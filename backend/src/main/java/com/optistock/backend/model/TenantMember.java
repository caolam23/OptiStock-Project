package com.optistock.backend.model;

import java.time.LocalDateTime;

/**
 * Represents a member of a Tenant (Workspace)
 * Tracks user's role and last access time within the workspace
 */
public class TenantMember {
    private String userId;          // MongoDB User ID
    private String email;           // User email for reference
    private String role;            // Role: OWNER, MANAGER, STAFF
    private LocalDateTime joinedAt; // When user joined this workspace
    private LocalDateTime lastAccessed; // Last access timestamp

    // Constructors
    public TenantMember() {
    }

    public TenantMember(String userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
        this.lastAccessed = LocalDateTime.now();
    }

    public TenantMember(String userId, String email, String role, LocalDateTime joinedAt, LocalDateTime lastAccessed) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.joinedAt = joinedAt;
        this.lastAccessed = lastAccessed;
    }

    // Getters and Setters
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

    public LocalDateTime getLastAccessed() {
        return lastAccessed;
    }

    public void setLastAccessed(LocalDateTime lastAccessed) {
        this.lastAccessed = lastAccessed;
    }

    @Override
    public String toString() {
        return "TenantMember{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", joinedAt=" + joinedAt +
                ", lastAccessed=" + lastAccessed +
                '}';
    }
}
