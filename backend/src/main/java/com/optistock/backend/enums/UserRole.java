package com.optistock.backend.enums;

/**
 * UserRole: System-Level roles (toàn nền tảng OptiStock).
 *
 * CHÚ Ý: Đây KHÔNG phải vai trò trong kho (Workspace).
 * Vai trò trong kho (OWNER, MANAGER, ACCOUNTANT, SALE, STAFF)
 * được định nghĩa trong {@link WorkspaceRole} và lưu trong TenantMember.role.
 *
 * Hiện tại chỉ có 1 system role:
 * - SUPER_ADMIN: Đội ngũ phát triển OptiStock. Quản lý server, tenants,
 * subscription.
 *
 * User thông thường (chưa tạo/tham gia kho): roles = [] (rỗng)
 */
public enum UserRole {
    SUPER_ADMIN("SUPER_ADMIN", "Quản trị viên toàn hệ thống OptiStock");

    private final String code;
    private final String description;

    UserRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
