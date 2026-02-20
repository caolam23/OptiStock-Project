package com.optistock.backend.service;

import com.optistock.backend.model.Tenant;
import com.optistock.backend.dto.TenantDTO;
import com.optistock.backend.dto.CreateTenantRequest;
import com.optistock.backend.enums.TenantStatus;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TenantService {

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Tạo tenant mới
     */
    public TenantDTO createTenant(String ownerEmail, CreateTenantRequest request) {
        // Generate unique tenantId from company name
        String tenantId = generateTenantId(request.getCompanyName());
        
        // Check if tenantId already exists
        if (tenantRepository.existsByTenantId(tenantId)) {
            throw new AuthException("Tên công ty đã tồn tại. Vui lòng sử dụng tên khác.");
        }

        Tenant tenant = new Tenant(tenantId, request.getCompanyName(), ownerEmail);
        tenant.setBusinessType(request.getBusinessType());
        tenant.setPhoneNumber(request.getPhoneNumber());
        tenant.setWebsite(request.getWebsite());
        tenant.setAddress(request.getAddress());
        tenant.setTaxId(request.getTaxId());

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
        
        tenant.setStatus(status);
        tenant.setUpdatedAt(LocalDateTime.now());
        
        Tenant saved = tenantRepository.save(tenant);
        return convertToDTO(saved);
    }

    /**
     * Renew/Extend subscription
     */
    public TenantDTO renewSubscription(String tenantId, int days) {
        Tenant tenant = tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new AuthException("Không tìm thấy công ty"));
        
        LocalDateTime newExpiryDate = tenant.getExpiryDate().plusDays(days);
        tenant.setExpiryDate(newExpiryDate);
        tenant.setUpdatedAt(LocalDateTime.now());
        
        Tenant saved = tenantRepository.save(tenant);
        return convertToDTO(saved);
    }

    /**
     * Check if tenant is active and not expired
     */
    public boolean isTenantActive(String tenantId) {
        Optional<Tenant> tenant = tenantRepository.findByTenantId(tenantId);
        return tenant.isPresent() && tenant.get().isActive();
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
        dto.setId(tenant.getId());
        dto.setTenantId(tenant.getTenantId());
        dto.setCompanyName(tenant.getCompanyName());
        dto.setOwnerEmail(tenant.getOwnerEmail());
        dto.setPhoneNumber(tenant.getPhoneNumber());
        dto.setBusinessType(tenant.getBusinessType());
        dto.setSubscriptionPlan(tenant.getSubscriptionPlan());
        dto.setStartDate(tenant.getStartDate());
        dto.setExpiryDate(tenant.getExpiryDate());
        dto.setStatus(tenant.getStatus().getCode());
        dto.setWebsite(tenant.getWebsite());
        dto.setAddress(tenant.getAddress());
        dto.setTaxId(tenant.getTaxId());
        dto.setCreatedAt(tenant.getCreatedAt());
        return dto;
    }
}
