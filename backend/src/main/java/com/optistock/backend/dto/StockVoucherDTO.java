package com.optistock.backend.dto;

import com.optistock.backend.model.VoucherItem;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO trả về cho frontend khi lấy danh sách / chi tiết phiếu nhập xuất.
 * Staff không cần thấy thông tin nội bộ như createdBy, tenantId raw.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockVoucherDTO {

    private String id;
    private String voucherCode; // "PN-001"
    private String type; // INBOUND, OUTBOUND, TRANSFER
    private String status; // PENDING, PROCESSING, COMPLETED
    private String title; // "Nhập hàng từ NCC"
    private String priority; // LOW, NORMAL, HIGH
    private String destination; // Nơi nhận (phiếu xuất)
    private String notes;

    private List<VoucherItem> items;

    // Tổng hợp tiến độ
    private int totalItems;
    private int completedItems;
    private int totalQuantityRequired;

    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
