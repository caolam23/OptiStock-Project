package com.optistock.backend.dto;

import lombok.*;

/**
 * ABCAnalysisDTO: DTO cho phân tích ABC
 * 
 * Phân tích ABC dựa trên doanh thu (revenue):
 * - Nhóm A: 70% giá trị lũy tích (High Priority - high revenue)
 * - Nhóm B: Tiếp theo 20% (Medium Priority)
 * - Nhóm C: 10% còn lại (Low Priority - low revenue)
 * 
 * Được xắp xếp theo doanh thu giảm dần.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ABCAnalysisDTO {
    
    /**
     * ID sản phẩm
     */
    private String productId;
    
    /**
     * Tên sản phẩm
     */
    private String productName;
    
    /**
     * Mã sản phẩm (SKU/Barcode)
     */
    private String productCode;
    
    /**
     * Tổng doanh thu từ các phiếu xuất kho (OUTBOUND)
     * = Tổng(quantityActual * price) từ tất cả VoucherItem OUTBOUND
     * Đơn vị: VND
     */
    private Double totalRevenue;
    
    /**
     * Tỷ lệ % lũy tích (cumulative percentage)
     * VD: 25.5 (= 25.5% giá trị tổng)
     */
    private Double cumulativePercentage;
    
    /**
     * Phân loại ABC
     * - "A": High priority (0-70%)
     * - "B": Medium priority (70-90%)
     * - "C": Low priority (90-100%)
     */
    private String category;
    
    /**
     * Số lượng đã bán (tổng quantityActual từ OUTBOUND)
     */
    private Integer quantitySold;
    
    /**
     * Giá bán của sản phẩm
     */
    private Double price;
    
    /**
     * Danh mục sản phẩm
     */
    private String productCategory;
}
