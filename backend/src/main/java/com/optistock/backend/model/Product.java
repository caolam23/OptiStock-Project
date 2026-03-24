package com.optistock.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Product: Sản phẩm trong kho
 * Mỗi sản phẩm có thể có multiple unit conversions
 */
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String tenantId;
    private String productCode; // SKU hoặc mã sản phẩm
    private String productName;
    private String category;
    private String description;
    private Double price;
    private Double cost;
    private String mainUnit; // Đơn vị chính (VD: "Chai", "Thùng")
    private Integer currentStock;
    private Integer minStock;
    private Integer maxStock;
    private String supplier;
    private boolean isActive = true;
    private List<String> unitConversionIds; // IDs của các quy đổi
    private Double sellingPrice; // Giá bán niêm yết
    private Double maxDiscountPercent; // % chiết khấu tối đa cho phép
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Constructors
    public Product() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Product(String tenantId, String productCode, String productName, String mainUnit) {
        this.tenantId = tenantId;
        this.productCode = productCode;
        this.productName = productName;
        this.mainUnit = mainUnit;
        this.currentStock = 0;
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

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public Integer getMaxStock() {
        return maxStock;
    }

    public void setMaxStock(Integer maxStock) {
        this.maxStock = maxStock;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public List<String> getUnitConversionIds() {
        return unitConversionIds;
    }

    public void setUnitConversionIds(List<String> unitConversionIds) {
        this.unitConversionIds = unitConversionIds;
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

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Double getMaxDiscountPercent() {
        return maxDiscountPercent;
    }

    public void setMaxDiscountPercent(Double maxDiscountPercent) {
        this.maxDiscountPercent = maxDiscountPercent;
    }
}
