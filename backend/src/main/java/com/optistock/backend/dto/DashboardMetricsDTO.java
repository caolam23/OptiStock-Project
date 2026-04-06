package com.optistock.backend.dto;

import java.math.BigDecimal;

/**
 * DashboardMetricsDTO — DTO hiển thị các chỉ số tài chính trên dashboard
 */
public class DashboardMetricsDTO {
    private BigDecimal totalInventoryValue;       // Tổng giá trị tồn kho (WAC)
    private BigDecimal totalAccountsPayable;      // Tổng nợ phải trả
    private BigDecimal totalAccountsReceivable;   // Tổng nợ phải thu
    private BigDecimal netCash;                   // Tiền mặt ròng = receivable - payable
    private BigDecimal dailyRevenue;              // Doanh thu ngày
    private BigDecimal dailyProfit;               // Lợi nhuận ngày
    private Integer overdueDebts;                 // Số công nợ quá hạn
    private Integer totalActiveDebts;             // Số công nợ đang hoạt động

    // ==================== Constructor ====================
    public DashboardMetricsDTO() {}

    public DashboardMetricsDTO(
            BigDecimal totalInventoryValue,
            BigDecimal totalAccountsPayable,
            BigDecimal totalAccountsReceivable,
            BigDecimal dailyRevenue,
            BigDecimal dailyProfit,
            Integer overdueDebts,
            Integer totalActiveDebts
    ) {
        this.totalInventoryValue = totalInventoryValue;
        this.totalAccountsPayable = totalAccountsPayable;
        this.totalAccountsReceivable = totalAccountsReceivable;
        this.dailyRevenue = dailyRevenue;
        this.dailyProfit = dailyProfit;
        this.overdueDebts = overdueDebts;
        this.totalActiveDebts = totalActiveDebts;
        this.netCash = totalAccountsReceivable.subtract(totalAccountsPayable);
    }

    // ==================== Getters & Setters ====================
    public BigDecimal getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(BigDecimal totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }

    public BigDecimal getTotalAccountsPayable() {
        return totalAccountsPayable;
    }

    public void setTotalAccountsPayable(BigDecimal totalAccountsPayable) {
        this.totalAccountsPayable = totalAccountsPayable;
    }

    public BigDecimal getTotalAccountsReceivable() {
        return totalAccountsReceivable;
    }

    public void setTotalAccountsReceivable(BigDecimal totalAccountsReceivable) {
        this.totalAccountsReceivable = totalAccountsReceivable;
    }

    public BigDecimal getNetCash() {
        return netCash;
    }

    public void setNetCash(BigDecimal netCash) {
        this.netCash = netCash;
    }

    public BigDecimal getDailyRevenue() {
        return dailyRevenue;
    }

    public void setDailyRevenue(BigDecimal dailyRevenue) {
        this.dailyRevenue = dailyRevenue;
    }

    public BigDecimal getDailyProfit() {
        return dailyProfit;
    }

    public void setDailyProfit(BigDecimal dailyProfit) {
        this.dailyProfit = dailyProfit;
    }

    public Integer getOverdueDebts() {
        return overdueDebts;
    }

    public void setOverdueDebts(Integer overdueDebts) {
        this.overdueDebts = overdueDebts;
    }

    public Integer getTotalActiveDebts() {
        return totalActiveDebts;
    }

    public void setTotalActiveDebts(Integer totalActiveDebts) {
        this.totalActiveDebts = totalActiveDebts;
    }
}
