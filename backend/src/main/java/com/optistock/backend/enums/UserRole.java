package com.optistock.backend.enums;

public enum UserRole {
    SUPER_ADMIN("SUPER_ADMIN", "Quản trị viên toàn hệ thống"),
    TENANT_ADMIN("TENANT_ADMIN", "Quản trị viên kho"),
    STAFF("STAFF", "Nhân viên kho"),
    ACCOUNTANT("ACCOUNTANT", "Kế toán"),
    MANAGER("MANAGER", "Quản lý kho");

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
