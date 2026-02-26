package com.optistock.backend.service;

import com.optistock.backend.dto.WorkspaceResponseDTO;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.Tenant;
import com.optistock.backend.model.TenantMember;
import com.optistock.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * WorkspaceService: Handles workspace/tenant retrieval for users
 * Provides methods to get user's workspaces, sorted by last access
 */
@Service
public class WorkspaceService {

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Get all workspaces (tenants) where user is a member
     * Sorted by lastAccessed (most recent first)
     *
     * @param userId MongoDB User ID
     * @return List of workspaces the user belongs to
     */
    public List<WorkspaceResponseDTO> getUserWorkspaces(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new AuthException("Invalid user ID");
        }

        // Query MongoDB for all tenants where user is a member
        List<Tenant> userTenants = tenantRepository.findAllByMembersUserId(userId);

        if (userTenants == null || userTenants.isEmpty()) {
            return List.of(); // Return empty list if no workspaces found
        }

        // Convert tenants to WorkspaceResponseDTO and sort by last access (most recent first)
        return userTenants.stream()
                .map(tenant -> convertTenantToWorkspaceDTO(tenant, userId))
                .sorted((a, b) -> {
                    LocalDateTime aLastAccessed = a.getLastAccessed();
                    LocalDateTime bLastAccessed = b.getLastAccessed();
                    
                    // Handle null values (put them at end)
                    if (aLastAccessed == null) return 1;
                    if (bLastAccessed == null) return -1;
                    
                    // Sort descending (most recent first)
                    return bLastAccessed.compareTo(aLastAccessed);
                })
                .collect(Collectors.toList());
    }

    /**
     * Convert Tenant to WorkspaceResponseDTO
     * Extracts user's specific role and last access time
     */
    private WorkspaceResponseDTO convertTenantToWorkspaceDTO(Tenant tenant, String userId) {
        WorkspaceResponseDTO dto = new WorkspaceResponseDTO();

        // Use reflection to read properties (bypassing Lombok issues)
        dto.setId(getString(tenant, "id"));
        dto.setName(getString(tenant, "name"));
        dto.setIndustryCode(getString(tenant, "industryCode"));

        // Find user's role and last access in members list
        String userRole = "STAFF"; // Default role
        LocalDateTime lastAccessed = (LocalDateTime) getFieldValue(tenant, "createdAt"); // Fallback to creation date

        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");

        if (members != null && !members.isEmpty()) {
            Optional<TenantMember> memberOptional = members.stream()
                    .filter(m -> userId.equals(m.getUserId()))
                    .findFirst();

            if (memberOptional.isPresent()) {
                TenantMember member = memberOptional.get();
                userRole = member.getRole() != null ? member.getRole() : "STAFF";
                if (member.getLastAccessed() != null) {
                    lastAccessed = member.getLastAccessed();
                }
            }
        }

        dto.setRole(userRole);
        dto.setLastAccessed(lastAccessed);

        return dto;
    }

    /**
     * Update user's last access time in a workspace
     * Called after user accesses a workspace
     */
    public void updateUserLastAccess(String tenantId, String userId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new AuthException("Workspace not found"));

        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");

        if (members != null && !members.isEmpty()) {
            Optional<TenantMember> memberOptional = members.stream()
                    .filter(m -> userId.equals(m.getUserId()))
                    .findFirst();

            memberOptional.ifPresent(member -> {
                member.setLastAccessed(LocalDateTime.now());
                tenantRepository.save(tenant);
            });
        }
    }

    // ==========================================
    // REFLECTION HELPERS (BYPASS LOMBOK)
    // ==========================================

    private Object getFieldValue(Object obj, String fieldName) {
        if (obj == null) return null;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return null;
        }
    }

    private String getString(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val != null ? val.toString() : null;
    }
}
