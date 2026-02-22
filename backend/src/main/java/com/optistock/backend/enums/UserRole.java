package com.optistock.backend.enums;

public enum UserRole {
    SUPER_ADMIN("SUPER_ADMIN", "Quản trị viên toàn hệ thống"),
    MANAGER("MANAGER", "Chủ kho / Quản lý kho"),
    STAFF("STAFF", "Nhân viên kho"),
    ACCOUNTANT("ACCOUNTANT", "Kế toán kho"),
    SALE("SALE", "Nhân viên bán hàng");

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
