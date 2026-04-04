package com.optistock.backend.dto;

import com.optistock.backend.enums.TrackingType;
import com.optistock.backend.enums.ActivationStatus;
import com.optistock.backend.model.Product.Batch;
import com.optistock.backend.model.Product.UnitConversion;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ProductDTO: Data Transfer Object cho Product (Electronics & Gadgets)
 * 
 * Hỗ trợ mapping với Entity đầy đủ các trường cho quản lý kho IMEI, 
 * phụ kiện và dịch vụ.
 */
public class ProductDTO {
    // ==================== THÔNG TIN CƠ BẢN ====================
    private String id;
    private String tenantId;
    private String productCode;              // SKU
    private String productName;              // Tên sản phẩm
    private String brand;                    // Hãng
    private String category;                 // Danh mục
    private String subCategory;              // 🔥 Phân loại chi tiết (cho GROCERY)
    private String description;              // Mô tả
    private String condition;                // Tình trạng: New, LikeNew, Good, Refurbished, Display
    private Double price;                    // Giá bán
    private Double cost;                     // Giá vốn
    private String mainUnit;                 // Đơn vị
    
    // ==================== QUẢN LÝ TỒN KHO ====================
    private TrackingType trackingType;       // Loại quản lý
    private Integer currentStock;            // Tồn kho hiện tại
    private Integer minStock;                // Tồn kho tối thiểu
    private Integer maxStock;                // Tồn kho tối đa
    private String supplier;                 // Nhà cung cấp
    
    // ==================== PHÂN LOẠI NGÀNH HÀNG ====================
    private String industryType;             // "ELECTRONICS" hoặc "GROCERY"
    
    // ==================== GROCERY CHUYÊN BIỆT ====================
    private List<Batch> batches;             // Danh sách lô hàng & thông tin hạn sử dụng
    private List<UnitConversion> unitConversions;  // Danh sách quy đổi đơn vị
    
    // ==================== ELECTRONICS CHUYÊN BIỆT ====================
    private String originCode;               // Mã vùng (VN/A, LL/A...)
    private ActivationStatus activationStatus;      // Trạng thái kích hoạt
    private Map<String, Object> specifications;     // Thông số kỹ thuật động
    private Integer warrantyMonths;         // Thời gian bảo hành (tháng)
    
    // ==================== TRẠNG THÁI ====================
    private boolean active;
    private List<String> unitConversionIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ==================== CONSTRUCTORS ====================
    public ProductDTO() {
    }

    public ProductDTO(String id, String productCode, String productName, String mainUnit) {
        this.id = id;
        this.productCode = productCode;
        this.productName = productName;
        this.mainUnit = mainUnit;
    }

    public ProductDTO(String productCode, String productName, String brand, String category, 
                     Double price, TrackingType trackingType) {
        this.productCode = productCode;
        this.productName = productName;
        this.brand = brand;
        this.category = category;
        this.price = price;
        this.trackingType = trackingType;
    }

    // ==================== GETTERS & SETTERS ====================
    
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubCategory() {
        return subCategory;
    }

    public void setSubCategory(String subCategory) {
        this.subCategory = subCategory;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
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

    public TrackingType getTrackingType() {
        return trackingType;
    }

    public void setTrackingType(TrackingType trackingType) {
        this.trackingType = trackingType;
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

    public String getOriginCode() {
        return originCode;
    }

    public void setOriginCode(String originCode) {
        this.originCode = originCode;
    }

    public ActivationStatus getActivationStatus() {
        return activationStatus;
    }

    public void setActivationStatus(ActivationStatus activationStatus) {
        this.activationStatus = activationStatus;
    }

    public Map<String, Object> getSpecifications() {
        return specifications;
    }

    public void setSpecifications(Map<String, Object> specifications) {
        this.specifications = specifications;
    }

    public Integer getWarrantyMonths() {
        return warrantyMonths;
    }

    public void setWarrantyMonths(Integer warrantyMonths) {
        this.warrantyMonths = warrantyMonths;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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

    public String getIndustryType() {
        return industryType;
    }

    public void setIndustryType(String industryType) {
        this.industryType = industryType;
    }

    public List<Batch> getBatches() {
        return batches;
    }

    public void setBatches(List<Batch> batches) {
        this.batches = batches;
    }

    public List<UnitConversion> getUnitConversions() {
        return unitConversions;
    }

    public void setUnitConversions(List<UnitConversion> unitConversions) {
        this.unitConversions = unitConversions;
    }
}
