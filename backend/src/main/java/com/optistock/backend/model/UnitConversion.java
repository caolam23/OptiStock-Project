package com.optistock.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * UnitConversion: Cấu hình quy đổi giữa các đơn vị sản phẩm
 * Ví dụ: 1 Thùng = 24 Chai
 */
@Document(collection = "unit_conversions")
public class UnitConversion {
    @Id
    private String id;
    private String tenantId;
    private String productId;
    private String fromUnit; // Đơn vị nguồn (Thùng)
    private String toUnit;   // Đơn vị đích (Chai)
    private Double conversionFactor; // Hệ số quy đổi
    private String description; // "1 Thùng = 24 Chai"
    private boolean isActive = true;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public UnitConversion() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UnitConversion(String tenantId, String productId, String fromUnit, String toUnit, Double conversionFactor) {
        this.tenantId = tenantId;
        this.productId = productId;
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.conversionFactor = conversionFactor;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getFromUnit() {
        return fromUnit;
    }

    public void setFromUnit(String fromUnit) {
        this.fromUnit = fromUnit;
    }

    public String getToUnit() {
        return toUnit;
    }

    public void setToUnit(String toUnit) {
        this.toUnit = toUnit;
    }

    public Double getConversionFactor() {
        return conversionFactor;
    }

    public void setConversionFactor(Double conversionFactor) {
        this.conversionFactor = conversionFactor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
