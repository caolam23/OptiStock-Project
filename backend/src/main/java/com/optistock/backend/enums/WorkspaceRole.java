package com.optistock.backend.enums;

/**
 * WorkspaceRole: Vai trò của người dùng trong một Workspace (Kho hàng)
 *
 * Đây là Tenant-Level roles, lưu trong TenantMember.role — KHÁC với UserRole
 * (System-Level).
 *
 * Phân cấp quyền (cao → thấp):
 * OWNER > MANAGER > ACCOUNTANT / SALE > STAFF
 *
 * Quy tắc:
 * - Mỗi Workspace có đúng 1 OWNER (người tạo kho).
 * - OWNER chỉ mời được: MANAGER, ACCOUNTANT, SALE, STAFF.
 * - OWNER không thể mời thêm OWNER khác (chỉ Transfer Ownership).
 */
public enum WorkspaceRole {

    OWNER("OWNER", "Chủ kho",
            "Toàn quyền: xem mọi thứ, sửa cài đặt, mời/xóa thành viên, xóa kho"),

    MANAGER("MANAGER", "Quản lý kho",
            "Quản lý tồn kho, sản phẩm, vị trí, nhập/xuất hàng. Không xóa kho được"),

    ACCOUNTANT("ACCOUNTANT", "Kế toán",
            "Xem báo cáo tài chính, nhập/xuất hàng, lịch sử giao dịch. Không sửa cấu hình"),

    SALE("SALE", "Nhân viên bán hàng",
            "Xem tồn kho, tạo đơn xuất hàng. Không sửa sản phẩm hoặc nhập hàng"),

    STAFF("STAFF", "Nhân viên kho",
            "Thực hiện nhập/xuất hàng theo lệnh. Quyền hạn chế nhất");

    // =====================
    // FIELDS
    // =====================

    private final String code;
    private final String displayName;
    private final String description;

    WorkspaceRole(String code, String displayName, String description) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
    }

    // =====================
    // GETTERS
    // =====================

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    // =====================
    // UTILITY METHODS
    // =====================

    /**
     * Kiểm tra role này có thể được mời không (OWNER không thể bị mời).
     * 
     * @return true nếu role hợp lệ để dùng trong invitation
     */
    public boolean isInvitable() {
        return this != OWNER;
    }

    /**
     * Lấy WorkspaceRole từ string code (case-insensitive).
     * Dùng để parse từ request body hoặc TenantMember.role.
     *
     * @param code chuỗi role, ví dụ "MANAGER", "staff"
     * @return WorkspaceRole tương ứng
     * @throws IllegalArgumentException nếu code không hợp lệ
     */
    public static WorkspaceRole fromCode(String code) {
        if (code == null)
            throw new IllegalArgumentException("Workspace role không được null");
        for (WorkspaceRole r : values()) {
            if (r.code.equalsIgnoreCase(code.trim()))
                return r;
        }
        throw new IllegalArgumentException("Role không hợp lệ: '" + code + "'. " +
                "Các giá trị hợp lệ: MANAGER, ACCOUNTANT, SALE, STAFF");
    }

    /**
     * Kiểm tra role code có hợp lệ để mời không.
     * Dùng để validate phía backend trước khi tạo invitation.
     *
     * @param code chuỗi role từ request
     * @return true nếu hợp lệ và có thể mời
     */
    public static boolean isValidInvitableRole(String code) {
        try {
            WorkspaceRole role = fromCode(code);
            return role.isInvitable();
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
