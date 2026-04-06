package com.optistock.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * FinancialReport — Lưu tổng quan tài chính theo ngày hoặc theo kỳ
 */
@Document(collection = "financial_reports")
public class FinancialReport {
    @Id
    private String id;
    
    private String tenantId;                  // Workspace
    
    // ==================== Metrics ====================
    private BigDecimal totalInventoryValue;   // Tổng giá trị tồn kho (WAC - Weighted Average Cost)
    private BigDecimal totalAccountsPayable;  // Tổng nợ phải trả (công nợ với nhà cung cấp)
    private BigDecimal totalAccountsReceivable; // Tổng nợ phải thu (công nợ từ khách hàng)
    
    private BigDecimal dailyRevenue;          // Doanh thu ngày hôm nay
    private BigDecimal dailyExpense;          // Chi phí ngày hôm nay
    private BigDecimal dailyProfit;           // Lợi nhuận ngày = revenue - expense
    
    private BigDecimal monthlyRevenue;        // Doanh thu tháng này
    private BigDecimal monthlyExpense;        // Chi phí tháng này
    
    // ==================== Summary ====================
    private Integer totalProducts;            // Số loại sản phẩm
    private Integer totalPartners;            // Số đối tác (nhà cung cấp/khách hàng)
    private Integer overdueDebts;             // Số công nợ quá hạn
    
    private LocalDate reportDate;             // Ngày báo cáo
    private LocalDateTime reportedAt;         // Thời gian báo cáo
    private Boolean isActive = true;

    // ==================== Constructor ====================
    public FinancialReport() {
        this.reportedAt = LocalDateTime.now();
        this.reportDate = LocalDate.now();
        this.totalInventoryValue = BigDecimal.ZERO;
        this.totalAccountsPayable = BigDecimal.ZERO;
        this.totalAccountsReceivable = BigDecimal.ZERO;
        this.dailyRevenue = BigDecimal.ZERO;
        this.dailyExpense = BigDecimal.ZERO;
        this.dailyProfit = BigDecimal.ZERO;
        this.monthlyRevenue = BigDecimal.ZERO;
        this.monthlyExpense = BigDecimal.ZERO;
        this.totalProducts = 0;
        this.totalPartners = 0;
        this.overdueDebts = 0;
    }

    // ==================== Getters & Setters ====================
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

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

    public BigDecimal getDailyRevenue() {
        return dailyRevenue;
    }

    public void setDailyRevenue(BigDecimal dailyRevenue) {
        this.dailyRevenue = dailyRevenue;
    }

    public BigDecimal getDailyExpense() {
        return dailyExpense;
    }

    public void setDailyExpense(BigDecimal dailyExpense) {
        this.dailyExpense = dailyExpense;
    }

    public BigDecimal getDailyProfit() {
        return dailyProfit;
    }

    public void setDailyProfit(BigDecimal dailyProfit) {
        this.dailyProfit = dailyProfit;
    }

    public BigDecimal getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(BigDecimal monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public BigDecimal getMonthlyExpense() {
        return monthlyExpense;
    }

    public void setMonthlyExpense(BigDecimal monthlyExpense) {
        this.monthlyExpense = monthlyExpense;
    }

    public Integer getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Integer totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Integer getTotalPartners() {
        return totalPartners;
    }

    public void setTotalPartners(Integer totalPartners) {
        this.totalPartners = totalPartners;
    }

    public Integer getOverdueDebts() {
        return overdueDebts;
    }

    public void setOverdueDebts(Integer overdueDebts) {
        this.overdueDebts = overdueDebts;
    }

    public LocalDate getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDate reportDate) {
        this.reportDate = reportDate;
    }

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(LocalDateTime reportedAt) {
        this.reportedAt = reportedAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
