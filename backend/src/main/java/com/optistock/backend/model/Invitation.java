package com.optistock.backend.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Invitation: Lời mời thành viên join tenant
 * Status: PENDING, ACCEPTED, REJECTED, EXPIRED
 */
@Document(collection = "invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {
    @Id
    private String id;
    private String tenantId;
    private String invitedEmail;
    private String invitedByUserId;
    private String role; // TENANT_ADMIN, STAFF, ACCOUNTANT, MANAGER
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, EXPIRED
    private String invitationCode; // Token để xác nhận lời mời
    private LocalDateTime expiresAt; // Lời mời hết hạn sau 7 ngày
    private LocalDateTime acceptedAt;
    
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
