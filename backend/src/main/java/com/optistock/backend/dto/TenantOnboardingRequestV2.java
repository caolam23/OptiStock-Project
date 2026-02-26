package com.optistock.backend.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

/**
 * TenantOnboardingRequestV2: Consolidated request cho Tenant Onboarding
 * Frontend gom tất cả data từ 4 bước và gửi xuống đây
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantOnboardingRequestV2 {
    private String tenantName;
    private String industryCode; // electronics, fmcg, fashion, pharmacy, fnb
    
    private List<LocationRequest> locations;
    private TenantSettingsRequest tenantSettings;
    private List<InviteRequest> invites;
    
    // Optional fields
    private String phoneNumber;
    private String website;
    private String address;
    private String taxId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationRequest {
        private String name;
        private String type; // DISPLAY, STORAGE, REPAIR, etc.
        private Integer capacity;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TenantSettingsRequest {
        private boolean requireSerialTracking;
        private boolean requireExpiryDate;
        private boolean enableBom;
        private boolean enableLotTracking;
        private boolean requireBatchExpiry;
        private boolean enableInventoryTracking;
        private boolean enableStockAdjustment;
        private Integer reorderThreshold;
        
        // Flexible thêm settings tùy per industry
        private Map<String, Object> customSettings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InviteRequest {
        private String email;
        private String role; // WAREHOUSE_STAFF, ACCOUNTANT, MANAGER, etc.
    }
}
