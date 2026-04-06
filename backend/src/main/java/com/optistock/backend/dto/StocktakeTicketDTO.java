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
    private String ticketCode;     // "ST-20240401-001"
    private String title;          // "Kiểm kê khu A4"
    private String status;         // PENDING, COUNTING, REVIEWING, COMPLETED, CANCELLED
    private String locationName;   // "Kho A - Tầng 1"

    private List<StocktakeItemStaffView> items; // Không có expectedQty

    private int totalItems;
    private int countedItems;      // Số item Staff đã nhập

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    /**
     * View cho Staff — không có expectedQty để tránh gian lận.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StocktakeItemStaffView {
        private String productId;
        private String productName;
        private String productCode;
        private Integer actualQty;   // null = chưa đếm
        private boolean isCounted;
    }
}
