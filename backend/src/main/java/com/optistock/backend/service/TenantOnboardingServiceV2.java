package com.optistock.backend.service;

import com.optistock.backend.config.IndustryTemplateConfig;
import com.optistock.backend.config.IndustryTemplateConfig.IndustryTemplate;
import com.optistock.backend.dto.TenantOnboardingRequestV2;
import com.optistock.backend.dto.TenantOnboardingResponseV2;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.*;
import com.optistock.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.*;

/**
 * TenantOnboardingService: Xử lý onboarding tenant với một API endpoint duy
 * nhất
 * Áp dụng @Transactional để đảm bảo tính toàn vẹn dữ liệu
 */
@Service
public class TenantOnboardingServiceV2 {

    // 1. Khởi tạo Logger thủ công (Thay thế @Slf4j)
    private static final Logger log = LoggerFactory.getLogger(TenantOnboardingServiceV2.class);

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final TenantSettingsRepository tenantSettingsRepository;
    private final InvitationRepository invitationRepository;
    private final EmailService emailService;

    // 2. Khởi tạo Constructor thủ công (Thay thế @RequiredArgsConstructor)
    public TenantOnboardingServiceV2(
            TenantRepository tenantRepository,
            UserRepository userRepository,
            LocationRepository locationRepository,
            TenantSettingsRepository tenantSettingsRepository,
            InvitationRepository invitationRepository,
            EmailService emailService) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.tenantSettingsRepository = tenantSettingsRepository;
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
    }

    /**
     * Khởi tạo Tenant mới với tất cả dữ liệu trong 1 transaction
     */
    @Transactional
    public TenantOnboardingResponseV2 onboardNewTenant(
            TenantOnboardingRequestV2 request,
            String currentUserEmailParam) { // Đổi tên biến để tránh trùng lặp

        String reqIndustryCode = getString(request, "industryCode");
        log.info("Starting tenant onboarding for user: {} with industry: {}", currentUserEmailParam, reqIndustryCode);

        try {
            // Lấy user hiện tại — KHÔNG tự động tạo mới, throw exception nếu không tìm thấy
            User currentUser = userRepository.findByEmail(currentUserEmailParam)
                    .orElseThrow(() -> {
                        log.error("User không tồn tại trong DB: {}", currentUserEmailParam);
                        return new com.optistock.backend.exception.AuthException(
                                "User không tồn tại: " + currentUserEmailParam);
                    });

            // Step 1: Tạo Tenant (Bypass Builder)
            String reqTenantName = getString(request, "tenantName");
            String tenantCode = generateTenantCode(reqTenantName);

            Tenant tenant = new Tenant();
            setFieldValue(tenant, "name", reqTenantName);
            setFieldValue(tenant, "tenantId", tenantCode);
            setFieldValue(tenant, "industryCode", reqIndustryCode);
            setFieldValue(tenant, "ownerEmail", getString(currentUser, "email"));
            setFieldValue(tenant, "phoneNumber", getString(request, "phoneNumber"));
            setFieldValue(tenant, "website", getString(request, "website"));
            setFieldValue(tenant, "address", getString(request, "address"));
            setFieldValue(tenant, "taxId", getString(request, "taxId"));
            setFieldValue(tenant, "subscriptionPlan", "FREE");
            setFieldValue(tenant, "startDate", LocalDateTime.now());
            setFieldValue(tenant, "expiryDate", LocalDateTime.now().plusDays(30));

            Tenant savedTenant = tenantRepository.save(tenant);
            String savedTenantId = getString(savedTenant, "id");
            log.info("Tenant created with ID: {}", savedTenantId);

            // Add current user as OWNER member
            String dbUserEmail = getString(currentUser, "email");
            String dbUserId = getString(currentUser, "id"); // SỬ DỤNG dbUserId ĐỂ KHÔNG TRÙNG BIẾN

            com.optistock.backend.model.TenantMember ownerMember = new com.optistock.backend.model.TenantMember(
                    dbUserId,
                    dbUserEmail,
                    "OWNER",
                    LocalDateTime.now(),
                    LocalDateTime.now());

            @SuppressWarnings("unchecked")
            List<com.optistock.backend.model.TenantMember> members = (List<com.optistock.backend.model.TenantMember>) getFieldValue(
                    savedTenant, "members");
            if (members == null) {
                members = new ArrayList<>();
            }
            members.add(ownerMember);
            setFieldValue(savedTenant, "members", members);
            savedTenant = tenantRepository.save(savedTenant);
            log.info("Added user {} as OWNER member of tenant", dbUserEmail);

            // Step 2: Tạo TenantSettings từ industry template
            IndustryTemplate template = IndustryTemplateConfig.getTemplate(reqIndustryCode);
            TenantSettings settings = buildTenantSettings(savedTenantId, request, template);

            TenantSettings savedSettings = tenantSettingsRepository.save(settings);
            log.info("TenantSettings created with ID: {}", getString(savedSettings, "id"));

            // Link settings vào tenant
            setFieldValue(savedTenant, "settings", savedSettings);
            tenantRepository.save(savedTenant);

            // Step 3: Tạo Locations (từ request hoặc từ template)
            List<Location> locationsToCreate = new ArrayList<>();
            List<?> reqLocations = getList(request, "locations");

            if (reqLocations != null && !reqLocations.isEmpty()) {
                // Sử dụng locations từ request nếu có
                for (Object locReq : reqLocations) {
                    Location loc = new Location();
                    setFieldValue(loc, "tenantId", savedTenantId);
                    setFieldValue(loc, "name", getString(locReq, "name"));
                    setFieldValue(loc, "type", getString(locReq, "type") != null ? getString(locReq, "type")
                            : getString(locReq, "locationType"));
                    setFieldValue(loc, "capacity", getInteger(locReq, "capacity"));
                    setFieldValue(loc, "description", getString(locReq, "description"));
                    setFieldValue(loc, "isActive", true);
                    locationsToCreate.add(loc);
                }
            } else {
                // Nếu không có, sử dụng từ template
                List<?> templateLocs = template.getLocations();
                if (templateLocs != null) {
                    for (Object locReq : templateLocs) {
                        Location loc = new Location();
                        setFieldValue(loc, "tenantId", savedTenantId);
                        setFieldValue(loc, "name", getString(locReq, "name"));
                        setFieldValue(loc, "type", getString(locReq, "type") != null ? getString(locReq, "type")
                                : getString(locReq, "locationType"));
                        setFieldValue(loc, "capacity", getInteger(locReq, "capacity"));
                        setFieldValue(loc, "description", getString(locReq, "description"));
                        setFieldValue(loc, "isActive", true);
                        locationsToCreate.add(loc);
                    }
                }
            }

            List<Location> savedLocations = locationRepository.saveAll(locationsToCreate);
            log.info("Created {} locations for tenant: {}", savedLocations.size(), savedTenantId);

            // Step 4: User đã là OWNER trong TenantMember (dòng 104-121 bên trên)
            // KHÔNG gán thêm system role hay tenantId vào User object
            // Workspace role = OWNER được lưu trong Tenant.members, KHÔNG trong User.roles
            setFieldValue(currentUser, "updatedAt", LocalDateTime.now());
            userRepository.save(currentUser);
            log.info("User {} đã là OWNER của workspace {} (via TenantMember)", dbUserId, savedTenantId);

            // Step 5: Gửi lời mời cho members
            List<Invitation> sentInvitations = new ArrayList<>();
            List<?> reqInvites = getList(request, "invites");
            if (reqInvites != null && !reqInvites.isEmpty()) {
                sentInvitations = sendInvitations(savedTenant, currentUser, reqInvites);
            }

            // Build response
            return buildSuccessResponse(savedTenant, savedLocations, sentInvitations);

        } catch (com.optistock.backend.exception.AuthException e) {
            // Re-throw AuthException trực tiếp (không wrap) để test và caller bắt được đúng
            // message
            log.error("AuthException during tenant onboarding: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error during tenant onboarding", e);
            throw new com.optistock.backend.exception.AuthException("Lỗi khởi tạo Tenant: " + e.getMessage());
        }
    }

    /**
     * Tạo TenantSettings từ industry template + custom settings từ request
     */
    private TenantSettings buildTenantSettings(
            String tenantId,
            TenantOnboardingRequestV2 request,
            IndustryTemplate template) {

        TenantSettings settings = new TenantSettings();
        setFieldValue(settings, "tenantId", tenantId);
        setFieldValue(settings, "createdAt", LocalDateTime.now());
        setFieldValue(settings, "updatedAt", LocalDateTime.now());

        Object reqSettings = getFieldValue(request, "tenantSettings");

        // Nếu request có custom settings, merge với template
        if (reqSettings != null) {
            setFieldValue(settings, "requireSerialTracking", getBoolean(reqSettings, "requireSerialTracking"));
            setFieldValue(settings, "requireExpiryDate", getBoolean(reqSettings, "requireExpiryDate"));
            setFieldValue(settings, "enableBom", getBoolean(reqSettings, "enableBom"));
            setFieldValue(settings, "enableLotTracking", getBoolean(reqSettings, "enableLotTracking"));
            setFieldValue(settings, "requireBatchExpiry", getBoolean(reqSettings, "requireBatchExpiry"));
            setFieldValue(settings, "enableInventoryTracking", getBoolean(reqSettings, "enableInventoryTracking"));
            setFieldValue(settings, "enableStockAdjustment", getBoolean(reqSettings, "enableStockAdjustment"));
            setFieldValue(settings, "reorderThreshold", getInteger(reqSettings, "reorderThreshold"));
            setFieldValue(settings, "customSettings", getFieldValue(reqSettings, "customSettings"));
        } else {
            // Sử dụng default từ template
            Object defaultSettings = template.getDefaultSettings();
            if (defaultSettings != null) {
                setFieldValue(settings, "requireSerialTracking", getBoolean(defaultSettings, "requireSerialTracking"));
                setFieldValue(settings, "requireExpiryDate", getBoolean(defaultSettings, "requireExpiryDate"));
                setFieldValue(settings, "enableBom", getBoolean(defaultSettings, "enableBom"));
                setFieldValue(settings, "enableLotTracking", getBoolean(defaultSettings, "enableLotTracking"));
                setFieldValue(settings, "requireBatchExpiry", getBoolean(defaultSettings, "requireBatchExpiry"));
                setFieldValue(settings, "enableInventoryTracking",
                        getBoolean(defaultSettings, "enableInventoryTracking"));
                setFieldValue(settings, "enableStockAdjustment", getBoolean(defaultSettings, "enableStockAdjustment"));
                setFieldValue(settings, "reorderThreshold", getInteger(defaultSettings, "reorderThreshold"));
            }
        }

        return settings;
    }

    /**
     * Gửi lời mời cho các members
     */
    private List<Invitation> sendInvitations(
            Tenant tenant,
            User invitedBy,
            List<?> invites) {

        List<Invitation> invitations = new ArrayList<>();
        String tenantId = getString(tenant, "id");
        String tenantName = getString(tenant, "name");
        String invitedById = getString(invitedBy, "id");

        for (Object invite : invites) {
            String email = getString(invite, "email");
            String role = getString(invite, "role");

            // Validate email
            if (!isValidEmail(email)) {
                log.warn("Invalid email skipped: {}", email);
                continue;
            }

            // Check user đã tồn tại trong tenant
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent() && tenantId.equals(getString(existingUser.get(), "tenantId"))) {
                log.warn("User already in tenant, skipped: {}", email);
                continue;
            }

            // Tạo invitation
            String invitationCode = generateInvitationCode();
            Invitation invitation = new Invitation();
            setFieldValue(invitation, "tenantId", tenantId);
            setFieldValue(invitation, "invitedEmail", email);
            setFieldValue(invitation, "role", role);
            setFieldValue(invitation, "invitedByUserId", invitedById);
            setFieldValue(invitation, "invitationCode", invitationCode);
            setFieldValue(invitation, "status", "PENDING");
            setFieldValue(invitation, "expiresAt", LocalDateTime.now().plusDays(7));

            Invitation saved = invitationRepository.save(invitation);
            invitations.add(saved);

            // Gửi email
            try {
                sendInvitationEmail(email, tenantName, role, invitationCode);
            } catch (Exception e) {
                log.error("Failed to send invitation email to {}: {}", email, e.getMessage());
            }
        }

        return invitations;
    }

    /**
     * Build success response
     */
    private TenantOnboardingResponseV2 buildSuccessResponse(
            Tenant tenant,
            List<Location> locations,
            List<Invitation> invitations) throws Exception {

        // Build Locations DTOs
        List<Object> locationDTOs = new ArrayList<>();
        Class<?> locDtoClass = Class.forName("com.optistock.backend.dto.TenantOnboardingResponseV2$LocationDTO");
        for (Location loc : locations) {
            Object dto = locDtoClass.getDeclaredConstructor().newInstance();
            setFieldValue(dto, "id", getString(loc, "id"));
            setFieldValue(dto, "name", getString(loc, "name"));
            setFieldValue(dto, "type", getString(loc, "type"));
            setFieldValue(dto, "capacity", getInteger(loc, "capacity"));
            locationDTOs.add(dto);
        }

        // Build Invitations DTOs
        List<Object> invitationDTOs = new ArrayList<>();
        Class<?> invDtoClass = Class.forName("com.optistock.backend.dto.TenantOnboardingResponseV2$InvitationDTO");
        for (Invitation inv : invitations) {
            Object dto = invDtoClass.getDeclaredConstructor().newInstance();
            setFieldValue(dto, "id", getString(inv, "id"));
            setFieldValue(dto, "email", getString(inv, "invitedEmail"));
            setFieldValue(dto, "role", getString(inv, "role"));
            setFieldValue(dto, "status", getString(inv, "status"));
            setFieldValue(dto, "invitationCode", getString(inv, "invitationCode"));
            invitationDTOs.add(dto);
        }

        // Build OnboardingData
        Class<?> dataClass = Class.forName("com.optistock.backend.dto.TenantOnboardingResponseV2$OnboardingData");
        Object data = dataClass.getDeclaredConstructor().newInstance();
        setFieldValue(data, "tenantId", getString(tenant, "id"));
        setFieldValue(data, "tenantCode", getString(tenant, "tenantId"));
        setFieldValue(data, "tenantName", getString(tenant, "name"));
        setFieldValue(data, "industryCode", getString(tenant, "industryCode"));
        setFieldValue(data, "locationsCreated", locations.size());
        setFieldValue(data, "invitationsSent", invitations.size());
        setFieldValue(data, "locations", locationDTOs);
        setFieldValue(data, "invitations", invitationDTOs);

        // Build Response
        TenantOnboardingResponseV2 response = new TenantOnboardingResponseV2();
        setFieldValue(response, "status", "SUCCESS");
        setFieldValue(response, "message", "✓ Khởi tạo Tenant thành công");
        setFieldValue(response, "data", data);
        setFieldValue(response, "timestamp", LocalDateTime.now());

        return response;
    }

    // ============ HELPER METHODS ============

    private String generateTenantCode(String tenantName) {
        if (tenantName == null)
            return "tenant-" + System.currentTimeMillis();
        String processed = tenantName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // xóa ký tự đặc biệt trước
                .trim()
                .replaceAll("\\s+", "-"); // thay space bằng dash
        // Substring theo độ dài của chuỗi ĐÃ XỬ LÝ (không phải tenantName gốc)
        return processed.substring(0, Math.min(30, processed.length()));
    }

    private String generateInvitationCode() {
        return "INV-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    private void sendInvitationEmail(String toEmail, String tenantName, String role, String code) {
        String link = "http://localhost:5173/accept-invitation?code=" + code;
        String subject = "📧 Lời mời tham gia " + tenantName + " trên OptiStock";

        String htmlContent = String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0;">OptiStock</h1>
                                </div>
                                <div style="padding: 30px; color: #333333;">
                                    <h2>Bạn được mời tham gia</h2>
                                    <p>Lời mời tham gia <strong>%s</strong> với vai trò <strong>%s</strong></p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="%s" style="display: inline-block; background-color: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                            CHẤP NHẬN LỜI MỜI
                                        </a>
                                    </div>
                                    <p>Hoặc code: <strong>%s</strong></p>
                                    <p style="color: #666; font-size: 12px;">Link hết hạn sau 7 ngày</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                tenantName, role, link, code);

        emailService.sendInvitationEmail(toEmail, subject, htmlContent);
    }

    // ============ REFLECTION HELPERS (BYPASS LOMBOK) ============

    private Object getFieldValue(Object obj, String fieldName) {
        if (obj == null)
            return null;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private void setFieldValue(Object obj, String fieldName, Object value) {
        if (obj == null)
            return;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            // Ignored silently for bypass
        }
    }

    private String getString(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val != null ? val.toString() : null;
    }

    private Integer getInteger(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        if (val instanceof Integer)
            return (Integer) val;
        if (val instanceof Number)
            return ((Number) val).intValue();
        if (val instanceof String) {
            try {
                return Integer.parseInt((String) val);
            } catch (Exception e) {
                return 0;
            }
        }
        return 0;
    }

    private Boolean getBoolean(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        if (val instanceof Boolean)
            return (Boolean) val;
        if (val instanceof String)
            return Boolean.parseBoolean((String) val);
        return false;
    }

    private List<?> getList(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val instanceof List ? (List<?>) val : null;
    }
}