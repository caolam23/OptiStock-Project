package com.optistock.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SaleProductDetailDTO {
    // Thông tin cơ bản
    private String productId;
    private String productCode;
    private String productName;

    // Thông tin tồn kho dành cho Sale
    private int currentStock;       // Tồn kho vật lý hiện tại
    private int committedStock;     // Hàng đã khách cọc/đặt nhưng chưa xuất
    private int availableToPromise; // TỒN KHO KHẢ DỤNG (Số lượng Sale có thể chốt đơn)

    // Thông tin giá & chiết khấu
    private BigDecimal sellingPrice;        // Giá niêm yết
    private BigDecimal suggestedMinPrice;   // Giá vốn + Biên độ lợi nhuận tối thiểu
    private BigDecimal maxDiscountPercent;      // % giảm giá tối đa Sale được phép dùng
}