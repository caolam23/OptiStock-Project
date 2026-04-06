package com.optistock.backend.security;

import com.optistock.backend.model.Tenant;
import com.optistock.backend.model.TenantMember;
import com.optistock.backend.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * WorkspaceRoleValidator - Kiểm tra quyền của user trong workspace
 * 
 * Luồng:
 * 1. Lấy userId từ Spring Security context
 * 2. Lấy workspaceId từ URL parameter hoặc X-Workspace-Id header
 * 3. Query Tenant để tìm TenantMember tương ứng
 * 4. So sánh role với các role được phép
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WorkspaceRoleValidator {

    private final TenantRepository tenantRepository;

    /**
     * Kiểm tra user có role được phép trong workspace không
     * 
     * @param workspaceId - Workspace ID (Tenant MongoDB ID)
     * @param allowedRoles - Danh sách role được phép (VD: "OWNER", "MANAGER", "ACCOUNTANT")
     * @return true nếu user có role hợp lệ, false nếu không
     */
    public boolean hasWorkspaceRole(String workspaceId, String... allowedRoles) {
        try {
            // 1. Lấy userId từ Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("User not authenticated");
                return false;
            }
            
            String userEmail = (String) authentication.getPrincipal();
            
            // 2. Lấy Tenant từ database
            Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
            if (tenantOpt.isEmpty()) {
                log.warn("Workspace not found: {}", workspaceId);
                return false;
            }
            
            Tenant tenant = tenantOpt.get();
            
            // 3. Tìm TenantMember tương ứng
            List<TenantMember> members = tenant.getMembers();
            if (members == null) {
                log.warn("Workspace {} has no members", workspaceId);
                return false;
            }
            
            TenantMember member = members.stream()
                    .filter(m -> userEmail.equalsIgnoreCase(m.getEmail()))
                    .findFirst()
                    .orElse(null);
            
            if (member == null) {
                log.warn("User {} not found in workspace {}", userEmail, workspaceId);
                return false;
            }
            
            // 4. So sánh role
            String userRole = member.getRole();
            for (String allowedRole : allowedRoles) {
                if (userRole.equalsIgnoreCase(allowedRole)) {
                    log.info("User {} has role {} in workspace {}", userEmail, userRole, workspaceId);
                    return true;
                }
            }
            
            log.warn("User {} role {} not in allowed roles {} for workspace {}", 
                    userEmail, userRole, allowedRoles, workspaceId);
            return false;
            
        } catch (Exception e) {
            log.error("Error validating workspace role", e);
            return false;
        }
    }

    /**
     * Kiểm tra user có bất kỳ role nào trong workspace không
     */
    public boolean hasAnyWorkspaceRole(String workspaceId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return false;
            }
            
            String userEmail = (String) authentication.getPrincipal();
            
            Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
            if (tenantOpt.isEmpty()) {
                return false;
            }
            
            Tenant tenant = tenantOpt.get();
            if (tenant.getMembers() == null) {
                return false;
            }
            
            return tenant.getMembers().stream()
                    .anyMatch(m -> userEmail.equalsIgnoreCase(m.getEmail()));
            
        } catch (Exception e) {
            log.error("Error checking any workspace role", e);
            return false;
        }
    }

    /**
     * Lấy role của user trong workspace
     */
    public String getUserWorkspaceRole(String workspaceId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            
            String userEmail = (String) authentication.getPrincipal();
            
            Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
            if (tenantOpt.isEmpty()) {
                return null;
            }
            
            Tenant tenant = tenantOpt.get();
            if (tenant.getMembers() == null) {
                return null;
            }
            
            return tenant.getMembers().stream()
                    .filter(m -> userEmail.equalsIgnoreCase(m.getEmail()))
                    .map(TenantMember::getRole)
                    .findFirst()
                    .orElse(null);
                    
        } catch (Exception e) {
            log.error("Error getting user workspace role", e);
            return null;
        }
    }
}
