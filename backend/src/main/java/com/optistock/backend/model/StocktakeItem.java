package com.optistock.backend.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * StocktakeItem: Một dòng sản phẩm trong phiếu kiểm kê.
 * Embedded document — KHÔNG có collection riêng.
 *
 * Hỗ trợ 2 ngành hàng:
 * 
 * ELECTRONICS:
 *   - expectedImeis: Danh sách IMEI từ hệ thống
 *   - actualImeis: Danh sách IMEI nhập viên đếm được
 *   - So sánh: missing = expectedImeis - actualImeis
 *
 * GROCERY:
 *   - batchCode: Mã lô hàng
 *   - expiryDate: Hạn sử dụng của lô
 *   - expectedQty/actualQty: Số lượng từng lô
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StocktakeItem {

    // ========== COMMON FIELDS ==========
    private String productId;                    // Ref → Product._id
    private String productCode;                  // SKU: "SK-001"
    private String productName;                  // "Áo Thun Cotton"
    private String category;                     // Danh mục sản phẩm

    private Integer expectedQty;                 // Tồn kho từ hệ thống
    private Integer actualQty;                   // Số lượng đếm được thực tế

    /**
     * Chênh lệch = actualQty - expectedQty
     * + Dương: Thừa hàng
     * - Âm: Thiếu hàng
     * 0: Khớp
     */
    private Integer discrepancy;

    // ========== FOR ELECTRONICS (Quản lý IMEI/Serial) ==========
    private List<String> expectedImeis;         // Danh sách IMEI từ hệ thống
    private List<String> actualImeis;           // Danh sách IMEI đếm được

    // ========== FOR GROCERY (Quản lý Lô/Batch) ==========
    private String batchCode;                   // Mã lô sản phẩm
    private LocalDateTime expiryDate;           // Hạn sử dụng lô

    // ========== HELPERS ==========

    /**
     * Tính chênh lệch số lượng
     */
    public void calculateDiscrepancy() {
        if (expectedQty != null && actualQty != null) {
            this.discrepancy = this.actualQty - this.expectedQty;
        }
    }

    /**
     * Kiểm tra đã đếm chưa
     */
    public boolean isCounted() {
        return actualQty != null && actualQty > 0;
    }

    /**
     * Kiểm tra có chênh lệch không
     */
    public boolean isHasDiscrepancy() {
        if (expectedQty == null || actualQty == null) {
            return false;
        }
        return !expectedQty.equals(actualQty);
    }
}
