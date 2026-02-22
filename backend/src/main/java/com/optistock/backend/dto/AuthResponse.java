package com.optistock.backend.dto;

import com.optistock.backend.model.TenantMembership;
import java.util.List;

/**
 * Response trả về sau login/register/google-login.
 * memberships chứa danh sách kho + role của user — thay thế cho tenantId +
 * roles cũ.
 */
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private boolean isActive;
    private String message;

    /**
     * Danh sách kho + role của user.
     * VD: [{tenantId: "kho-a", role: "MANAGER"}, {tenantId: "kho-b", role:
     * "STAFF"}]
     */
    private List<TenantMembership> memberships;

    // Constructors
    public AuthResponse() {
    }

    // Getters & Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<TenantMembership> getMemberships() {
        return memberships;
    }

    public void setMemberships(List<TenantMembership> memberships) {
        this.memberships = memberships;
    }
}
