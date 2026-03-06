package com.optistock.backend.model;

import lombok.*;

/**
 * StocktakeItem: Một dòng sản phẩm trong phiếu kiểm kê.
 * Embedded document — KHÔNG có collection riêng.
 *
 * Staff chỉ thấy: productCode, productName, locationCode, actualQuantity (ô
 * nhập liệu).
 * systemQuantity (tồn kho trên sổ sách) được ẨN khỏi Staff để tránh gian lận.
 * Khi Staff submit → hệ thống tự tính hasDiscrepancy.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StocktakeItem {

    private String productId; // Ref → Product._id
    private String productName; // "Áo Thun Cotton Basic - Trắng / L"
    private String productCode; // SKU: "SK-001"
    private String locationCode; // Vị trí: "A-01-01"

    @Builder.Default
    private Integer systemQuantity = 0; // Tồn kho trên hệ thống (ẨN với Staff)

    private Integer actualQuantity; // Số lượng Staff đếm thực tế (null = chưa đếm)

    @Builder.Default
    private boolean hasDiscrepancy = false; // true nếu actual != system (tính khi submit)

    private Integer discrepancyAmount; // actual - system (+ là thừa, - là thiếu)

    /**
     * Tính chênh lệch sau khi Staff submit.
     * Gọi bởi StaffStocktakeService.
     */
    public void calculateDiscrepancy() {
        if (actualQuantity != null && systemQuantity != null) {
            this.discrepancyAmount = this.actualQuantity - this.systemQuantity;
            this.hasDiscrepancy = (this.discrepancyAmount != 0);
        }
    }

    /**
     * Kiểm tra Staff đã nhập số lượng chưa.
     */
    public boolean isCounted() {
        return actualQuantity != null;
    }
}
