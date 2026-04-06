package com.optistock.backend.dto;

import lombok.*;

/**
 * DashboardSummaryDTO: Tổng quan chung cho Dashboard
 * Response từ GET /api/v1/dashboard/summary
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    
    /**
     * Tổng giá trị tồn kho = Sum(cost * currentStock) của tất cả products
     * Format: VNĐ, sử dụng double với 2 chữ số thập phân
     */
    private Double totalInventoryValue;
    
    /**
     * Số lượng SKU (sản phẩm) có tồn kho > 0
     */
    private Integer totalActiveSkus;
    
    /**
     * Số lượng phiếu (StockVoucher) đang ở trạng thái PENDING
     * (Chờ xử lý)
     */
    private Integer pendingVouchers;
    
    /**
     * Tổng số sản phẩm trong hệ thống (không quan tâm tồn kho)
     */
    private Integer totalProducts;
    
    /**
     * Số lượng sản phẩm hết hàng (currentStock <= 0)
     */
    private Integer outOfStockProducts;
}
