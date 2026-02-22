package com.optistock.backend.model;

import java.time.LocalDateTime;

/**
 * Embedded class - lưu thông tin tham gia của User vào 1 Tenant.
 * 1 User có thể có nhiều TenantMembership (tham gia nhiều kho với vai trò khác
 * nhau).
 */
public class TenantMembership {

    private String tenantId; // ID kho (ví dụ: "hung-phat-stock")
    private String role; // Role trong kho: MANAGER / STAFF / ACCOUNTANT / SALE
    private LocalDateTime joinedAt;

    public TenantMembership() {
    }

    public TenantMembership(String tenantId, String role) {
        this.tenantId = tenantId;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    @Override
    public String toString() {
        return "TenantMembership{tenantId='" + tenantId + "', role='" + role + "'}";
    }
}
