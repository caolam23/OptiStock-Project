package com.optistock.backend.model;

import com.optistock.backend.enums.TrackingType;
import com.optistock.backend.enums.ActivationStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Product: Sản phẩm trong kho (Thiết kế chuyên cho Electronics & Gadgets)
 * 
 * Hỗ trợ:
 * - Thiết bị IMEI (điện thoại, tablet)
 * - Phụ kiện (có hoặc không IMEI)
 * - Dịch vụ (không quản lý kho)
 * - Specifications động (RAM, ROM, Màn hình, Pin...)
 */
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    
    // ==================== THÔNG TIN CƠ BẢN ====================
    private String tenantId;
    private String productCode;              // SKU
    private String productName;              // Tên sản phẩm
    private String brand;                    // Hãng (Samsung, Apple, Xiaomi...)
    private String category;                 // Danh mục
    private String subCategory;              // 🔥 Phân loại chi tiết (cho GROCERY)
    private String description;              // Mô tả
    private String condition;                // Tình trạng: New, LikeNew, Good, Refurbished, Display
    private Double price;                    // Giá bán
    private Double cost;                     // Giá vốn
    private String mainUnit;                 // Đơn vị (Cái, Bộ...)
    
    // ==================== QUẢN LÝ TỒN KHO ====================
    private TrackingType trackingType;       // Loại quản lý: IMEI, BATCH, QUANTITY, SERVICE
    private Integer currentStock;            // Tồn kho hiện tại
    private Integer minStock;                // Tồn kho tối thiểu
    private Integer maxStock;                // Tồn kho tối đa
    private String supplier;                 // Nhà cung cấp
    
    // ==================== PHÂN LOẠI NGÀNH HÀNG ====================
    private String industryType;             // "ELECTRONICS" hoặc "GROCERY"
    
    // ==================== THÔNG TIN ELECTRONICS CHUYÊN BIỆT ====================
    private String originCode;               // Mã vùng (VN/A, LL/A, etc.)
    private ActivationStatus activationStatus = ActivationStatus.NOT_ACTIVATED; // Trạng thái kích hoạt
    
    /**
     * Specifications động (linh hoạt)
     * Ví dụ:
     * {
     *   "RAM": "8GB",
     *   "ROM": "256GB",
     *   "Display": "6.5 inch OLED",
     *   "Battery": "4000mAh",
     *   "Camera": "48MP",
     *   "Processor": "Snapdragon 888"
     * }
     */
    private Map<String, Object> specifications;
    
    // ==================== THỜI HẠN BẢO HÀNH ====================
    private Integer warrantyMonths;          // Thời gian bảo hành (tháng)
    
    // ==================== QUẢN LÝ QUY ĐỔI ĐƠN VỊ (GROCERY) ====================
    private List<UnitConversion> unitConversions;  // Danh sách quy đổi đơn vị (Thùng->Lốc->Lon)
    
    // ==================== QUẢN LÝ LÔ HÀNG & HẠN SỬ DỤNG (GROCERY) ====================
    private List<Batch> batches;             // Danh sách lô hàng & thông tin hạn sử dụng
    
    // ==================== TRẠNG THÁI ====================
    private boolean isActive = true;
    private List<String> unitConversionIds;
    
    // ==================== TIMESTAMP ====================
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // ==================== CONSTRUCTORS ====================
    public Product() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.trackingType = TrackingType.QUANTITY;
        this.activationStatus = ActivationStatus.NOT_ACTIVATED;
    }

    public Product(String tenantId, String productCode, String productName, String mainUnit) {
        this();
        this.tenantId = tenantId;
        this.productCode = productCode;
        this.productName = productName;
        this.mainUnit = mainUnit;
        this.currentStock = 0;
        this.isActive = true;
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

    // ==================== BUSINESS METHODS ====================
    
    /**
     * Kiểm tra xem sản phẩm này có cần tracking IMEI không
     */
    public boolean requiresIMEITracking() {
        return this.trackingType == TrackingType.IMEI;
    }

    /**
     * Kiểm tra xem sản phẩm này có phải dịch vụ không
     */
    public boolean isService() {
        return this.trackingType == TrackingType.SERVICE;
    }

    /**
     * Kiểm tra xem sản phẩm có cần quản lý kho không
     */
    public boolean requiresInventoryTracking() {
        return this.trackingType != TrackingType.SERVICE;
    }

    // ==================== NESTED CLASS: UnitConversion ====================
    /**
     * UnitConversion: Đơn vị quy đổi cho ngành Grocery
     * Ví dụ: 1 Thùng = 24 Lon, mã vạch = 8936024000013
     */
    public static class UnitConversion {
        private String unitName;             // Tên đơn vị (Thùng, Lốc, Lon)
        private Integer conversionRate;      // Hệ số quy đổi (so với đơn vị cơ bản)
        private String barcode;              // Mã vạch của đơn vị này
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UnitConversion() {
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }

        public UnitConversion(String unitName, Integer conversionRate, String barcode) {
            this();
            this.unitName = unitName;
            this.conversionRate = conversionRate;
            this.barcode = barcode;
        }

        public String getUnitName() {
            return unitName;
        }

        public void setUnitName(String unitName) {
            this.unitName = unitName;
        }

        public Integer getConversionRate() {
            return conversionRate;
        }

        public void setConversionRate(Integer conversionRate) {
            this.conversionRate = conversionRate;
        }

        public String getBarcode() {
            return barcode;
        }

        public void setBarcode(String barcode) {
            this.barcode = barcode;
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

    // ==================== NESTED CLASS: Batch ====================
    /**
     * Batch: Lô hàng & Hạn sử dụng (cho ngành Grocery)
     * Ví dụ: Lô CP-20240101-001, NSX: 01/01/2024, HSD: 01/03/2024, SL: 1000
     */
    public static class Batch {
        private String batchCode;            // Mã lô (VD: CP-20240101-001)
        private LocalDateTime manufactureDate;  // Ngày sản xuất
        private LocalDateTime expiryDate;    // Ngày hạn sử dụng
        private Integer quantity;            // Số lượng trong lô
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Batch() {
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }

        public Batch(String batchCode, LocalDateTime manufactureDate, LocalDateTime expiryDate, Integer quantity) {
            this();
            this.batchCode = batchCode;
            this.manufactureDate = manufactureDate;
            this.expiryDate = expiryDate;
            this.quantity = quantity;
        }

        public String getBatchCode() {
            return batchCode;
        }

        public void setBatchCode(String batchCode) {
            this.batchCode = batchCode;
        }

        public LocalDateTime getManufactureDate() {
            return manufactureDate;
        }

        public void setManufactureDate(LocalDateTime manufactureDate) {
            this.manufactureDate = manufactureDate;
        }

        public LocalDateTime getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(LocalDateTime expiryDate) {
            this.expiryDate = expiryDate;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
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

    // ==================== GETTER/SETTER CHO FIELDS MỚI ====================

    public String getIndustryType() {
        return industryType;
    }

    public void setIndustryType(String industryType) {
        this.industryType = industryType;
    }

    public List<UnitConversion> getUnitConversions() {
        return unitConversions;
    }

    public void setUnitConversions(List<UnitConversion> unitConversions) {
        this.unitConversions = unitConversions;
    }

    public List<Batch> getBatches() {
        return batches;
    }

    public void setBatches(List<Batch> batches) {
        this.batches = batches;
    }
}
