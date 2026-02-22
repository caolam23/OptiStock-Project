package com.optistock.backend.dto;

/**
 * Request body để assign/update role của 1 member trong tenant.
 * Dùng bởi MANAGER.
 */
public class AssignRoleRequest {
    private String role; // MANAGER / STAFF / ACCOUNTANT / SALE / MANAGER

    public AssignRoleRequest() {
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
