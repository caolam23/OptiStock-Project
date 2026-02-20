package com.optistock.backend.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class UserResponseDTO {
    private String id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private Set<String> roles;
    private String tenantId;
    private boolean isActive;
    private LocalDateTime createdAt;

    public UserResponseDTO() {}

    public UserResponseDTO(String id, String email, String fullName, String phoneNumber, 
                          String avatar, Set<String> roles, String tenantId, boolean isActive) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.avatar = avatar;
        this.roles = roles;
        this.tenantId = tenantId;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
