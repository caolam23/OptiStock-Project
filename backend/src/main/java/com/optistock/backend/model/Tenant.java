package com.optistock.backend.model;

import com.optistock.backend.enums.TenantStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {
    @Id
    private String id;
    private String tenantId; // Unique identifier (ví dụ: hungphat-stock)
    private String name;
    private String ownerEmail;
    private String phoneNumber;
    private String industryCode; // electronics, fmcg, fashion, pharmacy, fnb
    
    // Subscription info
    @Builder.Default
    private String subscriptionPlan = "FREE"; // FREE, BASIC, PRO, ENTERPRISE
    @Builder.Default
    private LocalDateTime startDate = LocalDateTime.now();
    @Builder.Default
    private LocalDateTime expiryDate = LocalDateTime.now().plusDays(30);
    @Builder.Default
    private TenantStatus status = TenantStatus.ACTIVE;
    
    // Settings
    private String website;
    private String address;
    private String taxId;
    
    // Nested TenantSettings
    @org.springframework.data.mongodb.core.mapping.DBRef
    private TenantSettings settings;
    
    // Members: List of users who are part of this workspace
    @Builder.Default
    private List<TenantMember> members = new ArrayList<>();
    
    // Timestamps
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Lombok generates all getters/setters automatically
    public boolean isActive() {
        return status == TenantStatus.ACTIVE && expiryDate.isAfter(LocalDateTime.now());
    }
}
