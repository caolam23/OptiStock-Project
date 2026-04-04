package com.optistock.backend.config;

import java.util.*;

/**
 * ProductCategoryConfig: Định nghĩa danh mục sản phẩm & đơn vị theo ngành hàng
 * Được sử dụng khi tạo sản phẩm để gợi ý danh mục phù hợp
 */
public class ProductCategoryConfig {

    /**
     * Map ngành hàng -> list danh mục sản phẩm
     */
    private static final Map<String, List<String>> CATEGORIES_BY_INDUSTRY = new HashMap<>();

    /**
     * Map ngành hàng -> list đơn vị sản phẩm
     */
    private static final Map<String, List<String>> UNITS_BY_INDUSTRY = new HashMap<>();

    static {
        // =============== ELECTRONICS ===============
        CATEGORIES_BY_INDUSTRY.put("electronics", Arrays.asList(
                "Điện thoại",
                "Laptop",
                "Máy tính để bàn (PC)",
                "Linh kiện máy tính",
                "Máy tính bảng",
                "Thiết bị đeo",
                "Phụ kiện công nghệ",
                "Camera",
                "TV / Màn hình",
                "Thiết bị gaming",
                "Thiết bị mạng",
                "Thiết bị văn phòng",
                "Lưu trữ dữ liệu",
                "Thiết bị điện thông minh"
        ));
        UNITS_BY_INDUSTRY.put("electronics", Arrays.asList(
                "Cái", "Bộ", "Chiếc"
        ));

        // =============== FMCG ===============
        CATEGORIES_BY_INDUSTRY.put("fmcg", Arrays.asList(
                "FRESH_FOOD",
                "DRY_FOOD",
                "BEVERAGES",
                "CONFECTIONERY",
                "SPICES_SEASONINGS",
                "FROZEN",
                "COSMETICS_TOILETRIES",
                "BABY_CARE",
                "PET_CARE",
                "HEALTH_SUPPLEMENTS",
                "OTHER"
        ));
        UNITS_BY_INDUSTRY.put("fmcg", Arrays.asList(
                "Chai", "Thùng", "Gói", "Hộp", "Kg", "Lít", "Cái"
        ));

        // =============== FASHION ===============
        CATEGORIES_BY_INDUSTRY.put("fashion", Arrays.asList(
                "Áo thun & Áo sơ mi",
                "Quần áo ngoài",
                "Giày & Dép",
                "Phụ kiện thời trang",
                "Cửa hàng bán buôn",
                "Khác"
        ));
        UNITS_BY_INDUSTRY.put("fashion", Arrays.asList(
                "Cái", "Bộ", "Đôi"
        ));

        // =============== PHARMACY ===============
        CATEGORIES_BY_INDUSTRY.put("pharmacy", Arrays.asList(
                "Thuốc kê đơn",
                "Thuốc không kê đơn",
                "Vitamin & Bổ sung",
                "Dụng cụ y tế",
                "Mỹ phẩm y tế",
                "Khác"
        ));
        UNITS_BY_INDUSTRY.put("pharmacy", Arrays.asList(
                "Hộp", "Lọ", "Chai", "Vỉ", "Cái"
        ));

        // =============== FNB (Food & Beverage) ===============
        CATEGORIES_BY_INDUSTRY.put("fnb", Arrays.asList(
                "Thịt & Cá",
                "Rau & Thực vật",
                "Gia vị & Thảo dược",
                "Lúa & Ngũ cốc",
                "Sữa & Sản phẩm sữa",
                "Dầu ăn & Nước sốt",
                "Cà phê & Trà",
                "Khác"
        ));
        UNITS_BY_INDUSTRY.put("fnb", Arrays.asList(
                "Kg", "Lít", "Gói", "Thùng", "Hộp", "Cái"
        ));
    }

    /**
     * Lấy danh mục sản phẩm theo ngành hàng
     * @param industryCode mã ngành hàng (electronics, fmcg, fashion, pharmacy, fnb)
     * @return danh sách danh mục sản phẩm
     */
    public static List<String> getCategoriesByIndustry(String industryCode) {
        if (industryCode == null || industryCode.isEmpty()) {
            return CATEGORIES_BY_INDUSTRY.getOrDefault("fmcg", new ArrayList<>());
        }
        return CATEGORIES_BY_INDUSTRY.getOrDefault(industryCode.toLowerCase(), new ArrayList<>());
    }

    /**
     * Lấy danh sách đơn vị sản phẩm theo ngành hàng
     * @param industryCode mã ngành hàng
     * @return danh sách đơn vị
     */
    public static List<String> getUnitsByIndustry(String industryCode) {
        if (industryCode == null || industryCode.isEmpty()) {
            return UNITS_BY_INDUSTRY.getOrDefault("fmcg", new ArrayList<>());
        }
        return UNITS_BY_INDUSTRY.getOrDefault(industryCode.toLowerCase(), new ArrayList<>());
    }

    /**
     * Lấy đơn vị mặc định (đơn vị đầu tiên) theo ngành hàng
     * @param industryCode mã ngành hàng
     * @return đơn vị mặc định
     */
    public static String getDefaultUnitByIndustry(String industryCode) {
        List<String> units = getUnitsByIndustry(industryCode);
        return units.isEmpty() ? "Cái" : units.get(0);
    }

    /**
     * Lấy danh mục mặc định (danh mục đầu tiên) theo ngành hàng
     * @param industryCode mã ngành hàng
     * @return danh mục mặc định
     */
    public static String getDefaultCategoryByIndustry(String industryCode) {
        List<String> categories = getCategoriesByIndustry(industryCode);
        return categories.isEmpty() ? "Khác" : categories.get(0);
    }
}
