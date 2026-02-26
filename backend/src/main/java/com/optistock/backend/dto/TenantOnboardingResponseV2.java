package com.optistock.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * TenantOnboardingResponseV2: Response cho Tenant Onboarding
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantOnboardingResponseV2 {
    private String status; // SUCCESS, CREATED, ERROR
    private String message;
    private OnboardingData data;
    private LocalDateTime timestamp;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OnboardingData {
        private String tenantId;
        private String tenantCode;
        private String tenantName;
        private String industryCode;
        private int locationsCreated;
        private int invitationsSent;
        private TenantSettingsDTO settings;
        private List<LocationDTO> locations;
        private List<InvitationDTO> invitations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationDTO {
        private String id;
        private String name;
        private String type;
        private Integer capacity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TenantSettingsDTO {
        private String id;
        private boolean requireSerialTracking;
        private boolean requireExpiryDate;
        private boolean enableBom;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvitationDTO {
        private String id;
        private String email;
        private String role;
        private String status;
        private String invitationCode;
    }
}
