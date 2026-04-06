package com.optistock.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DashboardAlertDTO: Dữ liệu cảnh báo cho Dashboard
 * Response từ GET /api/v1/dashboard/alerts
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAlertDTO {
    
    /**
     * Danh sách Top 5 sản phẩm dưới tồn kho tối thiểu
     */
    private List<LowStockAlertItem> lowStockProducts;
    
    /**
     * Danh sách Top 5 lô hàng sắp hết hạn (chỉ cho GROCERY)
     * Null/Empty nếu industryType == ELECTRONICS
     */
    private List<ExpiryBatchAlertItem> expiringBatches;
    
    /**
     * Tổng số sản phẩm cảnh báo hết hàng
     */
    private Integer totalLowStockCount;
    
    /**
     * Tổng số lô hàng sắp hết hạn
     */
    private Integer totalExpiringBatchCount;
    
    // ========== INNER CLASSES ==========
    
    /**
     * Chi tiết sản phẩm hết hàng
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LowStockAlertItem {
        private String productId;
        private String productCode;        // SKU
        private String productName;
        private String category;
        private Integer currentStock;
        private Integer minStock;
        private Integer stockDeficit;      // minStock - currentStock
        private Double cost;
        private String mainUnit;
    }
    
    /**
     * Chi tiết lô hàng sắp hết hạn (GROCERY)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpiryBatchAlertItem {
        private String productId;
        private String productCode;
        private String productName;
        private String batchCode;          // Mã lô
        private LocalDateTime expiryDate;
        private Long daysRemaining;        // Số ngày còn lại
        private Integer quantity;          // Số lượng trong lô
        private String mainUnit;
        
        /**
         * Level cảnh báo: "CRITICAL" (<7 ngày), "HIGH" (<14 ngày), "MEDIUM" (<30 ngày)
         */
        private String alertLevel;
    }
}
