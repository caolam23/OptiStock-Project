package com.optistock.backend.service;

import com.optistock.backend.dto.TenantOnboardingRequestV2;
import com.optistock.backend.dto.TenantOnboardingResponseV2;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.*;
import com.optistock.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;

import java.lang.reflect.Field;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TenantOnboardingServiceTest (Đã nâng cấp lên V2)
 * Test luồng Onboarding All-in-One: Tạo Tenant -> Cài đặt -> Location -> Phân quyền -> Gửi lời mời.
 */
@DataMongoTest
@Import(TenantOnboardingServiceV2.class)
public class TenantOnboardingServiceTest {

    @Autowired
    private TenantOnboardingServiceV2 tenantOnboardingService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TenantSettingsRepository tenantSettingsRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    // Phải Mock EmailService để tránh lỗi khi nạp Application Context trong Test
    @MockBean
    private EmailService emailService;

    private User testUser;
    private String testUserId;

    @BeforeEach
    public void setUp() {
        // Clear DB
        userRepository.deleteAll();
        tenantRepository.deleteAll();
        locationRepository.deleteAll();
        tenantSettingsRepository.deleteAll();
        invitationRepository.deleteAll();

        // Tạo User gốc bằng Reflection
        testUser = new User();
        setFieldValue(testUser, "email", "hungphat@example.com");
        setFieldValue(testUser, "fullName", "Ông Hùng");
        setFieldValue(testUser, "password", "hashed_password");
        setFieldValue(testUser, "roles", new HashSet<>());
        setFieldValue(testUser, "phoneNumber", "0123456789");
        
        testUser = userRepository.save(testUser);
        testUserId = (String) getFieldValue(testUser, "id");
    }

    /**
     * Test luồng tạo Tenant thành công cho V2
     */
    @Test
    public void testOnboardNewTenant_Success() {
        // Arrange: Tạo Request V2
        TenantOnboardingRequestV2 request = new TenantOnboardingRequestV2();
        setFieldValue(request, "tenantName", "Kho Gia Dụng Hùng Phát V2");
        setFieldValue(request, "industryCode", "fmcg");
        setFieldValue(request, "phoneNumber", "0123456789");
        setFieldValue(request, "address", "123 Đường Lê Lợi");

        // Mock mảng Locations (Bypass Lombok builder inner class)
        Object locReq = createInstance("com.optistock.backend.dto.TenantOnboardingRequestV2$LocationRequest");
        if (locReq != null) {
            setFieldValue(locReq, "name", "Kho Chính");
            setFieldValue(locReq, "type", "STORAGE");
            setFieldValue(locReq, "capacity", 1000);
            setFieldValue(request, "locations", Collections.singletonList(locReq));
        }

        // Mock mảng Invitations
        Object invReq = createInstance("com.optistock.backend.dto.TenantOnboardingRequestV2$InviteRequest");
        if (invReq != null) {
            setFieldValue(invReq, "email", "staff@example.com");
            setFieldValue(invReq, "role", "STAFF");
            setFieldValue(request, "invites", Collections.singletonList(invReq));
        }

        // Act
        TenantOnboardingResponseV2 response = tenantOnboardingService.onboardNewTenant(request, testUserId);

        // Assert: Response hợp lệ
        assertNotNull(response);
        assertEquals("SUCCESS", getFieldValue(response, "status"));

        // Verify: Phân quyền TENANT_ADMIN thành công
        User updatedUser = userRepository.findById(testUserId).orElse(null);
        assertNotNull(updatedUser);
        @SuppressWarnings("unchecked")
        Set<String> roles = (Set<String>) getFieldValue(updatedUser, "roles");
        assertNotNull(roles);
        assertTrue(roles.contains("TENANT_ADMIN"));
        assertNotNull(getFieldValue(updatedUser, "tenantId"));

        // Verify: Tenant đã được lưu xuống DB
        List<Tenant> tenants = tenantRepository.findAll();
        assertEquals(1, tenants.size());
        Tenant createdTenant = tenants.get(0);
        assertEquals("Kho Gia Dụng Hùng Phát V2", getFieldValue(createdTenant, "name"));
        assertEquals("fmcg", getFieldValue(createdTenant, "industryCode"));
        
        // Verify: Settings đã được link
        assertNotNull(getFieldValue(createdTenant, "settings"));

        // Verify: Location đã được tạo
        List<Location> locs = locationRepository.findAll();
        assertEquals(1, locs.size());
        assertEquals("Kho Chính", getFieldValue(locs.get(0), "name"));

        // Verify: Lời mời đã được tạo
        List<Invitation> invs = invitationRepository.findAll();
        assertEquals(1, invs.size());
        assertEquals("staff@example.com", getFieldValue(invs.get(0), "invitedEmail"));
    }

    /**
     * Test bắn exception khi User ID không tồn tại
     */
    @Test
    public void testOnboardNewTenant_UserNotFound() {
        // Arrange
        TenantOnboardingRequestV2 request = new TenantOnboardingRequestV2();
        setFieldValue(request, "tenantName", "Kho Lỗi");
        setFieldValue(request, "industryCode", "fmcg");

        // Act & Assert
        AuthException thrownException = assertThrows(AuthException.class, () -> {
            tenantOnboardingService.onboardNewTenant(request, "invalid_user_id");
        });
        
        assertNotNull(thrownException);
        assertTrue(thrownException.getMessage().contains("User không tồn tại"));
    }

    // ==========================================
    // REFLECTION HELPERS (GIÚP BYPASS LỖI LOMBOK)
    // ==========================================

    private Object createInstance(String className) {
        try {
            return Class.forName(className).getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            return null;
        }
    }

    private Object getFieldValue(Object obj, String fieldName) {
        if (obj == null) return null;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private void setFieldValue(Object obj, String fieldName, Object value) {
        if (obj == null) return;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            // Bỏ qua ngoại lệ nội bộ
        }
    }
}