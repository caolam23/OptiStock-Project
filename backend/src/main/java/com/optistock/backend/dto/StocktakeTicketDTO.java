package com.optistock.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO trả về cho frontend khi lấy danh sách / chi tiết phiếu kiểm kê.
 * systemQuantity của từng item bị ẩn — chỉ trả về sau khi Manager approve.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StocktakeTicketDTO {

    private String id;
    private String ticketCode; // "KK-003"
    private String title; // "Kiểm kê khu A"
    private String status; // PENDING, IN_PROGRESS, SUBMITTED, APPROVED
    private String locationCode; // "Kệ A - Tầng 1"

    private List<StocktakeItemStaffView> items; // Không có systemQuantity

    private int totalItems;
    private int countedItems; // Số item Staff đã nhập

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    /**
     * View cho Staff — không có systemQuantity để tránh gian lận.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StocktakeItemStaffView {
        private String productId;
        private String productName;
        private String productCode;
        private String locationCode;
        private Integer actualQuantity; // null = chưa đếm
        private boolean isCounted;
    }
}
