package com.optistock.backend.service;

import com.optistock.backend.dto.WorkspaceResponseDTO;
import com.optistock.backend.enums.TenantStatus;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.Tenant;
import com.optistock.backend.model.TenantMember;
import com.optistock.backend.repository.StockVoucherRepository;
import com.optistock.backend.repository.StocktakeTicketRepository;
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

    @Autowired
    private StockVoucherRepository stockVoucherRepository;

    @Autowired
    private StocktakeTicketRepository stocktakeTicketRepository;

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

        // Query MongoDB — bỏ qua kho đã xóa
        List<Tenant> userTenants = tenantRepository.findAllByMembersUserId(userId)
                .stream()
                .filter(t -> !TenantStatus.DELETED.equals(getFieldValue(t, "status")))
                .collect(Collectors.toList());

        if (userTenants == null || userTenants.isEmpty()) {
            return List.of(); // Return empty list if no workspaces found
        }

        // Convert tenants to WorkspaceResponseDTO and sort by last access (most recent
        // first)
        return userTenants.stream()
                .map(tenant -> convertTenantToWorkspaceDTO(tenant, userId))
                .sorted((a, b) -> {
                    LocalDateTime aLastAccessed = a.getLastAccessed();
                    LocalDateTime bLastAccessed = b.getLastAccessed();

                    // Handle null values (put them at end)
                    if (aLastAccessed == null)
                        return 1;
                    if (bLastAccessed == null)
                        return -1;

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
    // DELETE WORKSPACE
    // ==========================================

    /**
     * Soft-delete workspace.
     * Guards:
     * 1. Chỉ OWNER mới xóa được
     * 2. Không có phiếu đang PROCESSING
     * Cơ chế: status = DELETED, deletedAt = now() (dữ liệu vẫn còn trong DB)
     */
    public void deleteWorkspace(String tenantId, String userId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new AuthException("Workspace không tồn tại"));

        // Guard 1: Chỉ OWNER
        String userRole = getMemberRole(tenant, userId);
        if (!"OWNER".equals(userRole)) {
            throw new AuthException("Chỉ OWNER mới có thể xóa workspace");
        }

        // Guard 2: Đã xóa rồi
        if (TenantStatus.DELETED.equals(getFieldValue(tenant, "status"))) {
            throw new AuthException("Workspace này đã bị xóa");
        }

        // Guard 3: Không có phiếu đang PROCESSING
        long processingCount = stockVoucherRepository
                .findByTenantIdAndStatus(tenantId, "PROCESSING").size();
        if (processingCount > 0) {
            throw new AuthException(
                    "Còn " + processingCount + " phiếu đang xử lý. Vui lòng hoàn tất trước khi xóa kho.");
        }

        // Soft-delete
        setFieldValue(tenant, "status", TenantStatus.DELETED);
        setFieldValue(tenant, "deletedAt", LocalDateTime.now());
        tenantRepository.save(tenant);

        System.out.printf("🗑️ Workspace '%s' đã bị xóa bởi user %s lúc %s%n",
                getString(tenant, "name"), userId, getFieldValue(tenant, "deletedAt"));
    }

    /**
     * Lấy thông tin tóm tắt trước khi xóa — hiện trong modal xác nhận.
     * Trả về: tên kho, số thành viên, số phiếu pending, số phiếu hoàn tất.
     */
    public java.util.Map<String, Object> getDeleteSummary(String tenantId, String userId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new AuthException("Workspace không tồn tại"));

        String userRole = getMemberRole(tenant, userId);
        if (!"OWNER".equals(userRole)) {
            throw new AuthException("Chỉ OWNER mới có thể xem thông tin xóa");
        }

        @SuppressWarnings("unchecked")
        List<TenantMember> memberList = (List<TenantMember>) getFieldValue(tenant, "members");
        int memberCount = memberList != null ? memberList.size() : 0;
        
        long pendingVouchers = stockVoucherRepository.findByTenantIdAndStatus(tenantId, "PENDING").size();
        long processingVouchers = stockVoucherRepository.findByTenantIdAndStatus(tenantId, "PROCESSING").size();
        long completedVouchers = stockVoucherRepository.countByTenantIdAndTypeAndStatus(tenantId, "INBOUND",
                "COMPLETED")
                + stockVoucherRepository.countByTenantIdAndTypeAndStatus(tenantId, "OUTBOUND", "COMPLETED");
        long stocktakeCount = stocktakeTicketRepository.findByTenantId(tenantId).size();

        return java.util.Map.of(
                "workspaceName", getString(tenant, "name"),
                "memberCount", memberCount,
                "pendingVouchers", pendingVouchers,
                "processingVouchers", processingVouchers,
                "completedVouchers", completedVouchers,
                "stocktakeCount", stocktakeCount,
                "canDelete", processingVouchers == 0);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private String getMemberRole(Tenant tenant, String userId) {
        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");
        if (members == null)
            return null;
        return members.stream()
                .filter(m -> userId.equals(m.getUserId()))
                .map(TenantMember::getRole)
                .findFirst()
                .orElse(null);
    }

    // ==========================================
    // REFLECTION HELPERS (BYPASS LOMBOK)
    // ==========================================

    private Object getFieldValue(Object obj, String fieldName) {
        if (obj == null)
            return null;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return null;
        }
    }

    private void setFieldValue(Object obj, String fieldName, Object value) {
        if (obj == null)
            return;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            // Ignored silently for bypass
        }
    }

    private String getString(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val != null ? val.toString() : null;
    }
}
