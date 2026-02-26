package com.optistock.backend.controller;

import com.optistock.backend.dto.TenantOnboardingRequestV2;
import com.optistock.backend.dto.TenantOnboardingResponseV2;
import com.optistock.backend.service.TenantOnboardingServiceV2;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Field;
import java.util.List;

/**
 * TenantOnboardingControllerV2: Consolidated Tenant Onboarding Endpoint
 */
@RestController
@RequestMapping("/api/v1/onboarding")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TenantOnboardingControllerV2 {

    private static final Logger log = LoggerFactory.getLogger(TenantOnboardingControllerV2.class);
    private final TenantOnboardingServiceV2 tenantOnboardingServiceV2;

    public TenantOnboardingControllerV2(TenantOnboardingServiceV2 tenantOnboardingServiceV2) {
        this.tenantOnboardingServiceV2 = tenantOnboardingServiceV2;
    }

    @PostMapping("/tenant")
    public ResponseEntity<TenantOnboardingResponseV2> onboardTenant(
            @RequestBody TenantOnboardingRequestV2 request) {

        log.info("Received onboarding request for tenant: {}", getString(request, "tenantName"));

        try {
            // 1. Validate request
            validateRequest(request);

            // 2. Lấy định danh User (Email hoặc ID) từ JWT token một cách an toàn
            String userIdentity = getCurrentUserId();

            // 3. Gọi service để xử lý onboarding
            TenantOnboardingResponseV2 response = tenantOnboardingServiceV2.onboardNewTenant(request, userIdentity);

            log.info("Tenant onboarded successfully!");
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return new ResponseEntity<>(createErrorResponse("VALIDATION_ERROR", e.getMessage()), HttpStatus.BAD_REQUEST);
        // Thêm khối catch này để bắt riêng lỗi AuthException
        } catch (com.optistock.backend.exception.AuthException e) { 
            log.warn("Lỗi xác thực: {}", e.getMessage());
            return new ResponseEntity<>(createErrorResponse("AUTH_ERROR", e.getMessage()), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            log.error("Error during onboarding", e);
            return new ResponseEntity<>(createErrorResponse("ERROR", "Lỗi khởi tạo Tenant: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateRequest(TenantOnboardingRequestV2 request) {
        String tenantName = getString(request, "tenantName");
        if (tenantName == null || tenantName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên Tenant không được để trống");
        }

        String industryCode = getString(request, "industryCode");
        if (industryCode == null || industryCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã ngành hàng không được để trống");
        }

        // FIX: Bỏ chặn mảng rỗng. Nếu frontend gửi mảng rỗng, cho phép đi tiếp để dùng Template Defaults.
        List<?> locations = getList(request, "locations");
        if (locations != null && !locations.isEmpty()) {
            for (Object loc : locations) {
                String name = getString(loc, "name");
                if (name == null || name.trim().isEmpty()) {
                    throw new IllegalArgumentException("Tên location không được để trống");
                }
                String type = getString(loc, "type");
                if (type == null) type = getString(loc, "locationType");
                if (type == null || type.trim().isEmpty()) {
                    throw new IllegalArgumentException("Loại location không được để trống");
                }
            }
        }

        List<?> invites = getList(request, "invites");
        if (invites != null && !invites.isEmpty()) {
            for (Object invite : invites) {
                String email = getString(invite, "email");
                if (email == null || email.trim().isEmpty()) {
                    throw new IllegalArgumentException("Email khách mời không được để trống");
                }
                String role = getString(invite, "role");
                if (role == null || role.trim().isEmpty()) {
                    throw new IllegalArgumentException("Role khách mời không được để trống");
                }
            }
        }
    }

    /**
     * Lấy User ID/Email an toàn, tránh lỗi ClassCastException làm sập Server (Lỗi 500)
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                return ((UserDetails) principal).getUsername();
            }
            return principal.toString();
        }
        throw new RuntimeException("User không được xác thực");
    }

    // ==========================================
    // HELPER METHODS: Bypass Lombok
    // ==========================================

    private TenantOnboardingResponseV2 createErrorResponse(String status, String message) {
        TenantOnboardingResponseV2 res = new TenantOnboardingResponseV2();
        setFieldValue(res, "status", status);
        setFieldValue(res, "message", message);
        setFieldValue(res, "timestamp", java.time.LocalDateTime.now());
        return res;
    }

    private Object getFieldValue(Object obj, String fieldName) {
        if (obj == null) return null;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (Exception e) { return null; }
    }

    private void setFieldValue(Object obj, String fieldName, Object value) {
        if (obj == null) return;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {}
    }

    private String getString(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val != null ? val.toString() : null;
    }

    private List<?> getList(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val instanceof List ? (List<?>) val : null;
    }
}