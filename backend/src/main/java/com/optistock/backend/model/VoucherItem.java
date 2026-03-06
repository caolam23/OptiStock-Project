package com.optistock.backend.model;

import lombok.*;

/**
 * VoucherItem: Một dòng sản phẩm trong phiếu nhập/xuất.
 * Embedded document — KHÔNG có collection riêng.
 *
 * Lifecycle:
 * 1. Manager tạo phiếu → set quantityRequired, productId, locationCode
 * 2. Staff quét mã → tăng quantityActual (cap tối đa = quantityRequired)
 * 3. Khi quantityActual >= quantityRequired → isCompleted = true (dòng xanh)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherItem {

    private String productId; // Ref → Product._id
    private String productName; // Denormalized: "iPhone 13 Pro Max"
    private String productCode; // Barcode/SKU: "89300012"
    private String productVariant; // VD: "Color: Sierra Blue • 256GB"
    private String locationCode; // Vị trí kệ: "Shelf A-01", "Zone B-04"

    @Builder.Default
    private Integer quantityRequired = 0; // Số lượng cần xử lý

    @Builder.Default
    private Integer quantityActual = 0; // Số lượng thực tế (Staff quét/nhập)

    @Builder.Default
    private boolean isCompleted = false; // true khi actual >= required

    /**
     * Tăng số lượng thực tế khi Staff quét mã.
     * CHẶN CỨNG: không cho vượt quantityRequired.
     * Tự động set isCompleted nếu đủ.
     *
     * @return true nếu tăng thành công, false nếu đã đủ (bị chặn)
     */
    public boolean incrementActual(int amount) {
        if (this.quantityActual >= this.quantityRequired) {
            return false; // Đã đủ, không cho tăng nữa
        }
        // Cap lại không cho vượt
        this.quantityActual = Math.min(this.quantityActual + amount, this.quantityRequired);
        this.isCompleted = (this.quantityActual >= this.quantityRequired);
        return true;
    }

    /**
     * Set số lượng thủ công (khi Staff nhập tay thay vì quét).
     * CHẶN CỨNG: clamp về [0, quantityRequired].
     */
    public void setActualManually(int amount) {
        if (amount < 0)
            amount = 0;
        if (amount > this.quantityRequired)
            amount = this.quantityRequired;
        this.quantityActual = amount;
        this.isCompleted = (this.quantityActual >= this.quantityRequired);
    }
}
