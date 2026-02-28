package com.optistock.backend.util;

/**
 * WorkspaceContext: Thread-local lưu thông tin workspace hiện tại.
 *
 * Được set bởi WorkspaceRoleAspect sau khi verify role thành công.
 * Teammates dùng để:
 * - Lấy workspaceId khi query MongoDB (filter by tenantId)
 * - Check role khi cần logic phân quyền phức tạp hơn annotation
 *
 * Cách dùng trong Service:
 *
 * String wsId = WorkspaceContext.getCurrentWorkspaceId();
 * List products = productRepo.findByTenantId(wsId);
 *
 * if ("OWNER".equals(WorkspaceContext.getCurrentWorkspaceRole())) {
 * // Chỉ Owner mới thấy thông tin tài chính nhạy cảm
 * }
 *
 * LƯU Ý: Context được tự động clear sau mỗi request (trong Aspect).
 */
public class WorkspaceContext {

    private static final ThreadLocal<String> workspaceId = new ThreadLocal<>();
    private static final ThreadLocal<String> tenantId = new ThreadLocal<>();
    private static final ThreadLocal<String> workspaceRole = new ThreadLocal<>();
    private static final ThreadLocal<String> userId = new ThreadLocal<>();

    /** MongoDB _id của Tenant document */
    public static String getCurrentWorkspaceId() {
        return workspaceId.get();
    }

    /** Business tenantId (slug, ví dụ: "hung-phat-stock") */
    public static String getCurrentTenantId() {
        return tenantId.get();
    }

    /** Role của user hiện tại: "OWNER", "MANAGER", "ACCOUNTANT", "SALE", "STAFF" */
    public static String getCurrentWorkspaceRole() {
        return workspaceRole.get();
    }

    /** userId của user hiện tại */
    public static String getCurrentUserId() {
        return userId.get();
    }

    public static void setCurrentWorkspaceId(String id) {
        workspaceId.set(id);
    }

    public static void setCurrentTenantId(String id) {
        tenantId.set(id);
    }

    public static void setCurrentWorkspaceRole(String role) {
        workspaceRole.set(role);
    }

    public static void setCurrentUserId(String id) {
        userId.set(id);
    }

    /** Clear tất cả context — gọi trong finally block của Aspect */
    public static void clear() {
        workspaceId.remove();
        tenantId.remove();
        workspaceRole.remove();
        userId.remove();
    }
}
