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
 * StocktakeTicket: Phiếu yêu cầu kiểm kê.
 *
 * Luồng:
 * 1. Manager tạo yêu cầu kiểm kê cho 1 vị trí cụ thể (PENDING)
 * 2. Staff nhận phiếu, đến vị trí kệ, đếm hàng bằng mắt
 * 3. Staff nhập số lượng thực tế → bấm "Gửi báo cáo" (SUBMITTED)
 * 4. Hệ thống tự đối chiếu, ghi nhận chênh lệch
 * 5. Manager xem kết quả → APPROVED hoặc REJECTED
 *
 * Lưu ý: Staff KHÔNG thấy systemQuantity để đảm bảo tính khách quan.
 *
 * Collection: stocktake_tickets
 */
@Document(collection = "stocktake_tickets")
@CompoundIndex(name = "tenant_status_idx", def = "{'tenantId': 1, 'status': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StocktakeTicket {

    @Id
    private String id;

    private String tenantId; // Workspace ID

    private String ticketCode; // Mã phiếu: "KK-003"

    private String title; // "Kiểm kê khu A", "Kiểm kê Kệ A - Tầng 1"

    /**
     * Trạng thái:
     * - PENDING: Chờ Staff nhận
     * - IN_PROGRESS: Staff đang đếm
     * - SUBMITTED: Staff đã gửi báo cáo
     * - APPROVED: Manager đã duyệt
     * - REJECTED: Manager từ chối (yêu cầu đếm lại)
     */
    @Builder.Default
    private String status = "PENDING";

    private String locationCode; // Vị trí cần kiểm kê: "Kệ A - Tầng 1"

    @Builder.Default
    private List<StocktakeItem> items = new ArrayList<>(); // Danh sách SP cần đếm

    private String assignedTo; // userId Staff được giao
    private String submittedBy; // userId Staff gửi báo cáo
    private String createdBy; // userId Manager tạo yêu cầu
    private String approvedBy; // userId Manager duyệt

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private LocalDateTime startedAt; // Khi Staff bắt đầu đếm
    private LocalDateTime submittedAt; // Khi Staff gửi báo cáo
    private LocalDateTime approvedAt; // Khi Manager duyệt

    // ============ HELPER METHODS ============

    /**
     * Đếm tổng sản phẩm cần kiểm kê.
     */
    public int getTotalItems() {
        return items != null ? items.size() : 0;
    }

    /**
     * Đếm sản phẩm Staff đã nhập số lượng.
     */
    public int getCountedItems() {
        if (items == null)
            return 0;
        return (int) items.stream().filter(StocktakeItem::isCounted).count();
    }

    /**
     * Kiểm tra Staff đã nhập hết chưa.
     */
    public boolean isAllCounted() {
        if (items == null || items.isEmpty())
            return false;
        return items.stream().allMatch(StocktakeItem::isCounted);
    }

    /**
     * Đếm items có chênh lệch (sau khi submit).
     */
    public int getDiscrepancyCount() {
        if (items == null)
            return 0;
        return (int) items.stream().filter(StocktakeItem::isHasDiscrepancy).count();
    }

    /**
     * Tính chênh lệch cho tất cả items.
     * Gọi bởi StaffStocktakeService khi Staff submit.
     */
    public void calculateAllDiscrepancies() {
        if (items != null) {
            items.forEach(StocktakeItem::calculateDiscrepancy);
        }
    }
}
