package com.optistock.backend.dto;

import lombok.*;

import java.util.List;

/**
 * DTO trả về cho Staff Dashboard — 3 cột phiếu chờ.
 * Gộp cả Vouchers và Stocktake Tickets vào 1 response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDashboardDTO {

    private List<StockVoucherDTO> inboundPending; // Cột Nhập kho
    private List<StockVoucherDTO> outboundPending; // Cột Xuất kho
    private List<StocktakeTicketDTO> stocktakePending; // Cột Kiểm kê

    // Badge counts
    private long inboundCount;
    private long outboundCount;
    private long stocktakeCount;
}
