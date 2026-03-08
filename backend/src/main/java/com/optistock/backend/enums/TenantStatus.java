package com.optistock.backend.enums;

public enum TenantStatus {
    ACTIVE("ACTIVE", "Hoạt động"),
    INACTIVE("INACTIVE", "Không hoạt động"),
    LOCKED("LOCKED", "Bị khóa"),
    SUSPENDED("SUSPENDED", "Tạm ngưng"),
    DELETED("DELETED", "Đã xóa");

    private final String code;
    private final String description;

    TenantStatus(String code, String description) {
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
