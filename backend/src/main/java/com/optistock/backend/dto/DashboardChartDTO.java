package com.optistock.backend.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

/**
 * DashboardChartDTO: Dữ liệu biểu đồ cho Dashboard
 * Response từ GET /api/v1/dashboard/charts
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardChartDTO {
    
    /**
     * Biểu đồ cột: Nhập - Xuất 7 ngày gần nhất
     * Dùng để vẽ Bar Chart với 2 series (Inbound/Outbound)
     */
    private List<DailyInOutData> sevenDayInOutChart;
    
    /**
     * Biểu đồ tròn: Cơ cấu tồn kho theo danh mục
     * Dùng để vẽ Pie/Donut Chart
     */
    private List<CategoryInventoryData> inventoryByCategory;
    
    // ========== INNER CLASSES ==========
    
    /**
     * Dữ liệu nhập/xuất theo ngày
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyInOutData {
        private String date;               // Format: "2024-01-15"
        private Integer inboundQuantity;   // Số lượng nhập (từ INBOUND vouchers)
        private Integer outboundQuantity;  // Số lượng xuất (từ OUTBOUND vouchers)
        private Double inboundValue;       // Giá trị nhập
        private Double outboundValue;      // Giá trị xuất
    }
    
    /**
     * Dữ liệu tồn kho theo danh mục
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryInventoryData {
        private String category;           // Tên danh mục
        private Double value;              // Giá trị tồn kho (cost * currentStock)
        private Integer quantity;          // Số lượng (tổng currentStock)
        private Double percentage;         // Phần trăm so với tổng (%)
    }
}
