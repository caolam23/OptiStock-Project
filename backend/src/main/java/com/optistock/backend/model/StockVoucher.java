package com.optistock.backend.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * StockVoucher: Phiếu nhập/xuất/điều chuyển kho.
 *
 * Luồng:
 * 1. Manager tạo phiếu (PENDING) → giao cho Staff
 * 2. Staff bấm "Bắt đầu" → PROCESSING
 * 3. Staff quét barcode từng item → cập nhật VoucherItem.quantityActual
 * 4. Staff bấm "Hoàn tất" → COMPLETED → hệ thống cập nhật Product.currentStock
 *
 * Collection: stock_vouchers
 */
@Document(collection = "stock_vouchers")
@CompoundIndex(name = "tenant_status_idx", def = "{'tenantId': 1, 'status': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockVoucher {

    @Id
    private String id;

    private String tenantId; // Workspace ID

    private String voucherCode; // Mã phiếu: "PN-001", "PX-055"

    /**
     * Loại phiếu:
     * - INBOUND: Nhập kho (từ NCC, trả hàng, nội bộ)
     * - OUTBOUND: Xuất kho (cho khách, điều chuyển)
     * - TRANSFER: Điều chuyển giữa các kho/vị trí
     */
    private String type; // INBOUND, OUTBOUND, TRANSFER

    /**
     * Trạng thái:
     * - PENDING: Chờ Staff xử lý
     * - PROCESSING: Staff đang quét/xử lý
     * - COMPLETED: Đã hoàn tất
     * - CANCELLED: Hủy bỏ
     */
    @Builder.Default
    private String status = "PENDING";

    private String title; // "Nhập hàng từ NCC", "Xuất Cửa hàng A"
    private String priority; // LOW, NORMAL, HIGH
    private String destination; // Nơi nhận (phiếu xuất): "District 1 Store"
    private String notes; // Ghi chú thêm

    @Builder.Default
    private List<VoucherItem> items = new ArrayList<>(); // Danh sách SP cần xử lý

    private String assignedTo; // userId Staff được giao
    private String processedBy; // userId người xử lý thực tế
    private String createdBy; // userId Manager tạo phiếu

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private LocalDateTime startedAt; // Khi Staff bấm "Bắt đầu"
    private LocalDateTime completedAt; // Khi Staff bấm "Hoàn tất"

    // ============ HELPER METHODS ============

    /**
     * Đếm tổng items trong phiếu.
     */
    public int getTotalItems() {
        return items != null ? items.size() : 0;
    }

    /**
     * Đếm tổng số lượng cần xử lý (tất cả items cộng lại).
     */
    public int getTotalQuantityRequired() {
        if (items == null)
            return 0;
        return items.stream().mapToInt(item -> item.getQuantityRequired() != null ? item.getQuantityRequired() : 0).sum();
    }

    /**
     * Đếm items đã hoàn tất.
     */
    public int getCompletedItems() {
        if (items == null)
            return 0;
        return (int) items.stream().filter(item -> item.isCompleted()).count();
    }

    /**
     * Kiểm tra toàn bộ items trong phiếu đã hoàn tất chưa.
     */
    public boolean isAllItemsCompleted() {
        if (items == null || items.isEmpty())
            return false;
        return items.stream().allMatch(item -> item.isCompleted());
    }

    /**
     * Tìm VoucherItem theo productCode (barcode).
     * Dùng khi Staff quét mã.
     */
    public VoucherItem findItemByProductCode(String productCode) {
        if (items == null || productCode == null)
            return null;
        return items.stream()
                .filter(item -> productCode != null && productCode.equals(item.getProductCode()))
                .findFirst()
                .orElse(null);
    }
}
