package com.optistock.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SaleDashboardStatsDTO {
    private double totalRevenue;   // Tổng doanh thu (Chỉ tính đơn APPROVED)
    private int totalOrders;       // Tổng số đơn hàng
    private int pendingOrders;     // Số đơn chờ duyệt
    private int cancelledOrders;   // Số đơn bị hủy
}