package com.optistock.backend.dto;

import lombok.*;

/**
 * DeadStockDTO: DTO cho báo cáo Hàng tồn không bán (Dead Stock)
 * 
 * Dùng để hiển thị các sản phẩm không có giao dịch xuất kho (OUTBOUND)
 * trong một thời gian quy định (vd: 90 ngày).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadStockDTO {
    
    /**
     * ID sản phẩm trong MongoDB
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
     * Số ngày kể từ lần bán cuối cùng
     * Nếu không có bán lần nào → lấy từ createdAt
     */
    private Long daysSinceLastSale;
    
    /**
     * Tồn kho hiện tại (units)
     */
    private Integer stockQuantity;
    
    /**
     * Tổng giá trị vốn bị giam (stockQuantity * cost)
     * Đơn vị: VND
     */
    private Double totalValue;
    
    /**
     * Giá vốn của sản phẩm (cost price)
     */
    private Double costPrice;
    
    /**
     * Danh mục sản phẩm (để phân loại báo cáo)
     */
    private String category;
    
    /**
     * Tình trạng (New, LikeNew, Refurbished, etc.)
     */
    private String condition;
}
