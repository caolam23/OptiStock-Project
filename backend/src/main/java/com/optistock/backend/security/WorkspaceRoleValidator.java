package com.optistock.backend.security;

import com.optistock.backend.model.Tenant;
import com.optistock.backend.model.TenantMember;
import com.optistock.backend.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * WorkspaceRoleValidator - Xác thực quyền của user trong workspace
 * 
 * Kiểm tra xem user có role phù hợp trong workspace hay không bằng cách:
 * 1. Lấy email từ SecurityContext (JWT token)
 * 2. Truy vấn Tenant document
 * 3. Tìm TenantMember với email matching
 * 4. So sánh role với danh sách roles được phép
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WorkspaceRoleValidator {
    
    private final TenantRepository tenantRepository;
    
    /**
     * Kiểm tra user có role cho phép trong workspace
     * 
     * @param workspaceId Tenant ID
     * @param allowedRoles Các role được phép (ACCOUNTANT, MANAGER, OWNER, v.v)
     * @return true nếu user có một trong các allowed roles, false nếu không
     */
    public boolean hasWorkspaceRole(String workspaceId, String... allowedRoles) {
        try {
            // 1. Lấy email từ SecurityContext
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null) {
                log.warn("User not authenticated");
                return false;
            }
            
            String userEmail = principal.toString();
            
            // 2. Truy vấn Tenant
            Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
            if (tenantOpt.isEmpty()) {
                log.warn("Workspace not found: {}", workspaceId);
                return false;
            }
            
            Tenant tenant = tenantOpt.get();
            List<TenantMember> members = tenant.getMembers();
            
            // 3. Kiểm tra members list
            if (members == null || members.isEmpty()) {
                log.warn("Workspace {} has no members", workspaceId);
                return false;
            }
            
            // 4. Tìm TenantMember có email matching
            TenantMember member = members.stream()
                    .filter(m -> userEmail.equalsIgnoreCase(m.getEmail()))
                    .findFirst()
                    .orElse(null);
            
            if (member == null) {
                log.warn("User {} not found in workspace {}", userEmail, workspaceId);
                return false;
            }
            
            // 5. So sánh role
            String userRole = member.getRole();
            for (String allowedRole : allowedRoles) {
                if (userRole != null && userRole.equalsIgnoreCase(allowedRole)) {
                    log.info("User {} has role {} in workspace {}", userEmail, userRole, workspaceId);
                    return true;
                }
            }
            
            log.warn("User {} role {} not in allowed roles for workspace {}", 
                    userEmail, userRole, workspaceId);
            return false;
            
        } catch (Exception e) {
            log.error("Error validating workspace role", e);
            return false;
        }
    }
    
    /**
     * Lấy role của user trong workspace
     * 
     * @param workspaceId Tenant ID
     * @return Role string hoặc null nếu không tìm thấy
     */
    public String getUserWorkspaceRole(String workspaceId) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null) {
                return null;
            }
            
            String userEmail = principal.toString();
            Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
            
            if (tenantOpt.isEmpty()) {
                return null;
            }
            
            Tenant tenant = tenantOpt.get();
            TenantMember member = tenant.getMembers().stream()
                    .filter(m -> userEmail.equalsIgnoreCase(m.getEmail()))
                    .findFirst()
                    .orElse(null);
            
            return member != null ? member.getRole() : null;
            
        } catch (Exception e) {
            log.error("Error getting user workspace role", e);
            return null;
        }
    }
    
    /**
     * Kiểm tra user có là thành viên của workspace
     * 
     * @param workspaceId Tenant ID
     * @return true nếu user là thành viên workspace
     */
    public boolean isWorkspaceMember(String workspaceId) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal == null) {
                return false;
            }
            
            String userEmail = principal.toString();
            Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
            
            if (tenantOpt.isEmpty()) {
                return false;
            }
            
            Tenant tenant = tenantOpt.get();
            return tenant.getMembers().stream()
                    .anyMatch(m -> userEmail.equalsIgnoreCase(m.getEmail()));
            
        } catch (Exception e) {
            log.error("Error checking workspace membership", e);
            return false;
        }
    }
}
