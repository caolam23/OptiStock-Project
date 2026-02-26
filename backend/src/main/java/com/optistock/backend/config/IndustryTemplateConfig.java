package com.optistock.backend.config;

import com.optistock.backend.dto.TenantOnboardingRequestV2.LocationRequest;
import com.optistock.backend.model.TenantSettings;

import java.lang.reflect.Field;
import java.util.*;

/**
 * IndustryTemplateConfig: Định nghĩa templates mặc định cho từng ngành hàng
 * Khi create tenant, backend sẽ pull settings & locations dựa trên industryCode
 */
public class IndustryTemplateConfig {

    public static final Map<String, IndustryTemplate> TEMPLATES = new HashMap<>();

    static {
        // Electronics: Yêu cầu Serial Tracking
        TEMPLATES.put("electronics", IndustryTemplate.builder()
                .industryCode("electronics")
                .name("Electronics & Gadgets")
                .requireSerialTracking(true)
                .requireExpiryDate(false)
                .enableBom(true)
                .enableLotTracking(true)
                .locations(Arrays.asList(
                        createLocation("Kho Hiển Thị", "DISPLAY", 100, "Sản phẩm trưng bày"),
                        createLocation("Kho Lưu Trữ", "STORAGE", 500, "Kho chính"),
                        createLocation("Khu Bảo Hành", "REPAIR", 50, "Bảo hành & sửa chữa")
                ))
                .defaultSettings(createElectronicsSettings())
                .build());

        // FMCG: Yêu cầu Expiry Date, Lot Tracking
        TEMPLATES.put("fmcg", IndustryTemplate.builder()
                .industryCode("fmcg")
                .name("Fast Moving Consumer Goods")
                .requireSerialTracking(false)
                .requireExpiryDate(true)
                .enableBom(false)
                .enableLotTracking(true)
                .locations(Arrays.asList(
                        createLocation("Kho Hàng Mới", "STORAGE", 1000, "Hàng vừa nhập"),
                        createLocation("Kho Bán", "DISPLAY", 200, "Hàng sẵn sàng bán"),
                        createLocation("Khu Kiểm Chất", "INSPECTION", 100, "Kiểm tra chất lượng"),
                        createLocation("Khu Xóa Hạn", "STAGING", 50, "Hàng sắp hết hạn")
                ))
                .defaultSettings(createFmcgSettings())
                .build());

        // Fashion: Color/Size Tracking
        TEMPLATES.put("fashion", IndustryTemplate.builder()
                .industryCode("fashion")
                .name("Fashion & Apparel")
                .requireSerialTracking(false)
                .requireExpiryDate(false)
                .enableBom(false)
                .enableLotTracking(false)
                .locations(Arrays.asList(
                        createLocation("Kho Nam", "STORAGE", 300, "Hàng thời trang nam"),
                        createLocation("Kho Nữ", "STORAGE", 300, "Hàng thời trang nữ"),
                        createLocation("Kho Trẻ Em", "STORAGE", 200, "Hàng trẻ em"),
                        createLocation("Khu Trưng Bày", "DISPLAY", 100, "Trưng bày sản phẩm")
                ))
                .defaultSettings(createFashionSettings())
                .build());

        // Pharmacy: Strict Serial + Expiry + Batch
        TEMPLATES.put("pharmacy", IndustryTemplate.builder()
                .industryCode("pharmacy")
                .name("Pharmacy & Medical")
                .requireSerialTracking(true)
                .requireExpiryDate(true)
                .enableBom(false)
                .enableLotTracking(true)
                .locations(Arrays.asList(
                        createLocation("Kho Dược Phẩm", "STORAGE", 200, "Thuốc & dược phẩm"),
                        createLocation("Khu Bán", "DISPLAY", 50, "Quầy bán hàng"),
                        createLocation("Khu Kiểm Định", "INSPECTION", 30, "Kiểm định hạn sử dụng")
                ))
                .defaultSettings(createPharmacySettings())
                .build());

        // FNB (Food & Beverage): Expiry + Lot + Temperature
        TEMPLATES.put("fnb", IndustryTemplate.builder()
                .industryCode("fnb")
                .name("Food & Beverage")
                .requireSerialTracking(false)
                .requireExpiryDate(true)
                .enableBom(true)
                .enableLotTracking(true)
                .locations(Arrays.asList(
                        createLocation("Kho Lạnh", "STORAGE", 500, "Kho hàng đông lạnh"),
                        createLocation("Kho Thường", "STORAGE", 300, "Kho thường nhiệt độ phòng"),
                        createLocation("Khu Chế Biến", "STAGING", 200, "Khu chế biến & chuẩn bị"),
                        createLocation("Khu Bán", "DISPLAY", 100, "Quầy bán")
                ))
                .defaultSettings(createFnbSettings())
                .build());
    }

    /**
     * Lấy template cho một industryCode
     */
    public static IndustryTemplate getTemplate(String industryCode) {
        return TEMPLATES.getOrDefault(industryCode, TEMPLATES.get("fmcg")); // Default to FMCG
    }

    /**
     * Danh sách tất cả industries
     */
    public static Set<String> getAvailableIndustries() {
        return TEMPLATES.keySet();
    }

    // ==========================================
    // CÁC HÀM HELPER KHỞI TẠO (Sử dụng Reflection để Bypass hoàn toàn lỗi IDE Lombok)
    // ==========================================

    private static void setFieldValue(Object obj, String fieldName, Object value) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            // Log ignored in config initialization to keep simple
        }
    }

    private static LocationRequest createLocation(String name, String type, int capacity, String desc) {
        LocationRequest req = new LocationRequest();
        setFieldValue(req, "name", name);
        setFieldValue(req, "locationType", type);
        setFieldValue(req, "capacity", capacity);
        setFieldValue(req, "description", desc);
        return req;
    }

    private static TenantSettings createElectronicsSettings() {
        TenantSettings s = new TenantSettings();
        setFieldValue(s, "requireSerialTracking", true);
        setFieldValue(s, "requireExpiryDate", false);
        setFieldValue(s, "enableBom", true);
        setFieldValue(s, "enableLotTracking", true);
        setFieldValue(s, "enableInventoryTracking", true);
        setFieldValue(s, "enableMultipleUnitConversion", true);
        return s;
    }

    private static TenantSettings createFmcgSettings() {
        TenantSettings s = new TenantSettings();
        setFieldValue(s, "requireSerialTracking", false);
        setFieldValue(s, "requireExpiryDate", true);
        setFieldValue(s, "enableBom", false);
        setFieldValue(s, "enableLotTracking", true);
        setFieldValue(s, "requireBatchExpiry", true);
        setFieldValue(s, "enableInventoryTracking", true);
        setFieldValue(s, "enableStockAdjustment", true);
        setFieldValue(s, "enableAutoReorder", true);
        setFieldValue(s, "reorderThreshold", 10);
        return s;
    }

    private static TenantSettings createFashionSettings() {
        TenantSettings s = new TenantSettings();
        setFieldValue(s, "requireSerialTracking", false);
        setFieldValue(s, "requireExpiryDate", false);
        setFieldValue(s, "enableBom", false);
        setFieldValue(s, "enableInventoryTracking", true);
        setFieldValue(s, "enableMultipleUnitConversion", false);
        setFieldValue(s, "enablePriceAdjustment", true);
        return s;
    }

    private static TenantSettings createPharmacySettings() {
        TenantSettings s = new TenantSettings();
        setFieldValue(s, "requireSerialTracking", true);
        setFieldValue(s, "requireExpiryDate", true);
        setFieldValue(s, "enableBom", false);
        setFieldValue(s, "enableLotTracking", true);
        setFieldValue(s, "requireBatchExpiry", true);
        setFieldValue(s, "enableInventoryTracking", true);
        setFieldValue(s, "enableStockAdjustment", true);
        setFieldValue(s, "enableCostTracking", true);
        return s;
    }

    private static TenantSettings createFnbSettings() {
        TenantSettings s = new TenantSettings();
        setFieldValue(s, "requireSerialTracking", false);
        setFieldValue(s, "requireExpiryDate", true);
        setFieldValue(s, "enableBom", true);
        setFieldValue(s, "enableLotTracking", true);
        setFieldValue(s, "requireBatchExpiry", true);
        setFieldValue(s, "enableInventoryTracking", true);
        setFieldValue(s, "enableStockAdjustment", true);
        setFieldValue(s, "enableAutoReorder", true);
        return s;
    }

    // ==========================================
    // CLASS INDUSTRY TEMPLATE (Đã thay thế Lombok Builder bằng Java thuần)
    // ==========================================
    public static class IndustryTemplate {
        private String industryCode;
        private String name;
        private boolean requireSerialTracking;
        private boolean requireExpiryDate;
        private boolean enableBom;
        private boolean enableLotTracking;
        private List<LocationRequest> locations;
        private TenantSettings defaultSettings;

        // Empty Constructor
        public IndustryTemplate() {}

        // Getters
        public String getIndustryCode() { return industryCode; }
        public String getName() { return name; }
        public boolean isRequireSerialTracking() { return requireSerialTracking; }
        public boolean isRequireExpiryDate() { return requireExpiryDate; }
        public boolean isEnableBom() { return enableBom; }
        public boolean isEnableLotTracking() { return enableLotTracking; }
        public List<LocationRequest> getLocations() { return locations; }
        public TenantSettings getDefaultSettings() { return defaultSettings; }

        public static Builder builder() {
            return new Builder();
        }

        // Manual Builder Class
        public static class Builder {
            // FIX: Đã thêm final để giải quyết cảnh báo dòng 222
            private final IndustryTemplate template = new IndustryTemplate();

            public Builder industryCode(String industryCode) { template.industryCode = industryCode; return this; }
            public Builder name(String name) { template.name = name; return this; }
            public Builder requireSerialTracking(boolean val) { template.requireSerialTracking = val; return this; }
            public Builder requireExpiryDate(boolean val) { template.requireExpiryDate = val; return this; }
            public Builder enableBom(boolean val) { template.enableBom = val; return this; }
            public Builder enableLotTracking(boolean val) { template.enableLotTracking = val; return this; }
            public Builder locations(List<LocationRequest> val) { template.locations = val; return this; }
            public Builder defaultSettings(TenantSettings val) { template.defaultSettings = val; return this; }

            public IndustryTemplate build() {
                return template;
            }
        }
    }
}