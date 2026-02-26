package com.optistock.backend.dto;

import java.time.LocalDateTime;

/**
 * InvitationDTO: DTO cho Invitation
 */
public class InvitationDTO {
    private String id;
    private String tenantId;
    private String invitedEmail;
    private String role;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime createdAt;

    // Constructors
    public InvitationDTO() {
    }

    public InvitationDTO(String id, String tenantId, String invitedEmail, String role, String status) {
        this.id = id;
        this.tenantId = tenantId;
        this.invitedEmail = invitedEmail;
        this.role = role;
        this.status = status;
    }

    // Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public void setInvitedEmail(String invitedEmail) {
        this.invitedEmail = invitedEmail;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

/**
 * SendInvitationRequest: Request gửi lời mời
 */
class SendInvitationRequest {
    private String invitedEmail;
    private String role; // TENANT_ADMIN, STAFF, ACCOUNTANT, MANAGER

    public SendInvitationRequest() {
    }

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public void setInvitedEmail(String invitedEmail) {
        this.invitedEmail = invitedEmail;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
