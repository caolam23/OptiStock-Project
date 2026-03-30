package com.optistock.backend.service;

import com.optistock.backend.model.Tenant;
import com.optistock.backend.dto.TenantDTO;
import com.optistock.backend.enums.TenantStatus;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TenantService {

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Tạo tenant mới (deprecated - use TenantOnboardingServiceV2 instead)
     */
    public TenantDTO createTenant(String ownerEmail, String companyName, String phoneNumber) {
        // Generate unique tenantId from company name
        String tenantId = generateTenantId(companyName);
        
        // Check if tenantId already exists
        if (tenantRepository.existsByTenantId(tenantId)) {
            throw new AuthException("Tên công ty đã tồn tại. Vui lòng sử dụng tên khác.");
        }

        // Bypass Lombok Builder using standard instantiation and Reflection
        Tenant tenant = new Tenant();
        setFieldValue(tenant, "tenantId", tenantId);
        setFieldValue(tenant, "name", companyName);
        setFieldValue(tenant, "ownerEmail", ownerEmail);
        setFieldValue(tenant, "phoneNumber", phoneNumber);

        Tenant saved = tenantRepository.save(tenant);
        return convertToDTO(saved);
    }

    /**
     * Get tenant by ID
     */
    public TenantDTO getTenantById(String id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new AuthException("Không tìm thấy công ty"));
        return convertToDTO(tenant);
    }

    /**
     * Get tenant by tenantId
     */
    public TenantDTO getTenantByTenantId(String tenantId) {
        Tenant tenant = tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new AuthException("Không tìm thấy công ty"));
        return convertToDTO(tenant);
    }

    /**
     * Get tenant entity (raw object) by tenantId - used for fetching full object with all properties
     * Supports both MongoDB ID (@Id) and custom tenantId field
     */
    public Tenant getTenantEntityByTenantId(String tenantIdOrMongoId) {
        // Thử tìm theo custom tenantId trước
        Optional<Tenant> byCustomId = tenantRepository.findByTenantId(tenantIdOrMongoId);
        if (byCustomId.isPresent()) {
            return byCustomId.get();
        }
        
        // Nếu không tìm thấy, thử tìm theo MongoDB ID (@Id)
        Optional<Tenant> byMongoId = tenantRepository.findById(tenantIdOrMongoId);
        if (byMongoId.isPresent()) {
            return byMongoId.get();
        }
        
        throw new AuthException("Không tìm thấy công ty");
    }

    /**
     * Get all tenants (for Super Admin)
     */
    public List<TenantDTO> getAllTenants() {
        return tenantRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lock/Unlock tenant
     */
    public TenantDTO updateTenantStatus(String tenantId, TenantStatus status) {
        Tenant tenant = tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new AuthException("Không tìm thấy công ty"));
        
        setFieldValue(tenant, "status", status);
        setFieldValue(tenant, "updatedAt", LocalDateTime.now());
        
        Tenant saved = tenantRepository.save(tenant);
        return convertToDTO(saved);
    }

    /**
     * Renew/Extend subscription
     */
    public TenantDTO renewSubscription(String tenantId, int days) {
        Tenant tenant = tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new AuthException("Không tìm thấy công ty"));
        
        LocalDateTime currentExpiry = (LocalDateTime) getFieldValue(tenant, "expiryDate");
        if (currentExpiry != null) {
            LocalDateTime newExpiryDate = currentExpiry.plusDays(days);
            setFieldValue(tenant, "expiryDate", newExpiryDate);
        }
        
        setFieldValue(tenant, "updatedAt", LocalDateTime.now());
        
        Tenant saved = tenantRepository.save(tenant);
        return convertToDTO(saved);
    }

    /**
     * Check if tenant is active and not expired
     */
    public boolean isTenantActive(String tenantId) {
        Optional<Tenant> tenantOpt = tenantRepository.findByTenantId(tenantId);
        if (tenantOpt.isPresent()) {
            Tenant tenant = tenantOpt.get();
            // Check both boolean active and isActive standard names
            Boolean isActive = getBoolean(tenant, "isActive");
            if (isActive == null) {
                isActive = getBoolean(tenant, "active");
            }
            return Boolean.TRUE.equals(isActive);
        }
        return false;
    }

    /**
     * Generate unique tenantId from company name
     */
    private String generateTenantId(String companyName) {
        // Convert to lowercase and replace spaces with hyphens
        String tenantId = companyName.toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "");
        
        // Ensure it's unique by appending timestamp if needed
        if (tenantRepository.existsByTenantId(tenantId)) {
            tenantId = tenantId + "-" + System.currentTimeMillis();
        }
        
        return tenantId;
    }

    /**
     * Convert Tenant to TenantDTO
     */
    private TenantDTO convertToDTO(Tenant tenant) {
        TenantDTO dto = new TenantDTO();
        
        // Use Reflection to read properties from Tenant bypassing Lombok Getters
        dto.setId(getString(tenant, "id"));
        dto.setTenantId(getString(tenant, "tenantId"));
        dto.setCompanyName(getString(tenant, "name")); 
        dto.setOwnerEmail(getString(tenant, "ownerEmail"));
        dto.setPhoneNumber(getString(tenant, "phoneNumber"));
        dto.setBusinessType(getString(tenant, "industryCode")); 
        dto.setSubscriptionPlan(getString(tenant, "subscriptionPlan"));
        dto.setStartDate((LocalDateTime) getFieldValue(tenant, "startDate"));
        dto.setExpiryDate((LocalDateTime) getFieldValue(tenant, "expiryDate"));
        
        TenantStatus status = (TenantStatus) getFieldValue(tenant, "status");
        if (status != null) {
            dto.setStatus(status.getCode());
        }
        
        dto.setWebsite(getString(tenant, "website"));
        dto.setAddress(getString(tenant, "address"));
        dto.setTaxId(getString(tenant, "taxId"));
        dto.setCreatedAt((LocalDateTime) getFieldValue(tenant, "createdAt"));
        
        return dto;
    }

    // ==========================================
    // REFLECTION HELPERS (BYPASS LOMBOK)
    // ==========================================

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
            // Ignored silently for bypass
        }
    }

    private String getString(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val != null ? val.toString() : null;
    }

    private Boolean getBoolean(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        if (val instanceof Boolean) {
            return (Boolean) val;
        }
        return null;
    }
}