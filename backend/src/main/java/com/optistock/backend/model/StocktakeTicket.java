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
 * StocktakeTicket: Phiếu kiểm kê kho
 * 
 * Hỗ trợ 2 ngành hàng:
 * - ELECTRONICS: Quản lý IMEI (Serial)
 * - GROCERY: Quản lý Lô (Batch) + Hạn sử dụng (Expiry)
 * 
 * Lifecycle:
 * PENDING (Chờ xử lý) 
 *   → COUNTING (Đang kiểm kê - nhân viên ghi số đếm)
 *   → REVIEWING (Chờ duyệt - manager xác nhận)
 *   → COMPLETED (Đã hoàn tất)
 * hoặc CANCELLED (Hủy)
 * 
 * Collection: stocktake_tickets
 */
@Document(collection = "stocktake_tickets")
@CompoundIndex(name = "tenant_industry_idx", def = "{'tenantId': 1, 'industryType': 1, 'status': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StocktakeTicket {

    @Id
    private String id;

    private String tenantId;                     // Multi-tenant isolation

    private String ticketCode;                   // Mã phiếu duy nhất (VD: ST-20240401-001)
    private String title;                        // Tiêu đề phiếu (VD: "Kiểm kê kho A4")

    @Builder.Default
    private String status = "PENDING";           // PENDING, COUNTING, REVIEWING, COMPLETED, CANCELLED

    private String industryType;                 // ELECTRONICS hoặc GROCERY (Bắt buộc)
    private String locationId;                   // ID khu vực kiểm (VD: "Shelf A-01")
    private String locationName;                 // Tên khu vực (Denormalized)

    private String assignedTo;                   // ID nhân viên phụ trách đếm hàng
    private String assignedToName;               // Tên nhân viên (Denormalized)

    @Builder.Default
    private List<StocktakeItem> items = new ArrayList<>();

    // ========== TIMESTAMPS ==========
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private LocalDateTime startedAt;             // Lúc bắt đầu đếm
    private LocalDateTime completedAt;           // Lúc hoàn thành đếm
    private LocalDateTime submittedAt;           // Lúc gửi duyệt

    // ========== HELPERS ==========

    /**
     * Tính tổng số lượng tồn từ hệ thống
     */
    public Integer getTotalExpectedQty() {
        return items.stream()
            .mapToInt(item -> item.getExpectedQty() != null ? item.getExpectedQty() : 0)
            .sum();
    }

    /**
     * Tính tổng số lượng đếm được thực tế
     */
    public Integer getTotalActualQty() {
        return items.stream()
            .mapToInt(item -> item.getActualQty() != null ? item.getActualQty() : 0)
            .sum();
    }

    /**
     * Tính chênh lệch tổng = actual - expected
     */
    public Integer getTotalDifference() {
        return getTotalActualQty() - getTotalExpectedQty();
    }

    /**
     * Đếm số item chưa được đếm
     */
    public long getUnCountedItems() {
        return items.stream()
            .filter(item -> item.getActualQty() == null || item.getActualQty() == 0)
            .count();
    }

    /**
     * % hoàn thành đếm hàng
     */
    public Double getProgressPercentage() {
        if (items.isEmpty()) return 0.0;
        long counted = items.stream()
            .filter(item -> item.getActualQty() != null && item.getActualQty() > 0)
            .count();
        return (counted * 100.0) / items.size();
    }

    /**
     * Kiểm tra xem phiếu có cho phép edit không
     */
    public boolean isEditable() {
        return "PENDING".equals(status) || "COUNTING".equals(status);
    }

    /**
     * Đếm items có chênh lệch (sau khi submit).
     */
    public int getDiscrepancyCount() {
        if (items == null)
            return 0;
        return (int) items.stream().filter(item -> item.isHasDiscrepancy()).count();
    }

    /**
     * Tính chênh lệch cho tất cả items.
     * Gọi bởi StaffStocktakeService khi Staff submit.
     */
    public void calculateAllDiscrepancies() {
        if (items != null) {
            items.forEach(item -> item.calculateDiscrepancy());
        }
    }
}
