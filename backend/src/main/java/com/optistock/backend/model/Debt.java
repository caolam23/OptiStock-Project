package com.optistock.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Debt — Quản lý công nợ đối tác (nhà cung cấp/khách hàng)
 */
@Document(collection = "debts")
public class Debt {
    @Id
    private String id;
    
    private String tenantId;           // Workspace
    private String partnerId;          // ID nhà cung cấp / khách hàng
    private String partnerName;        // Tên đối tác
    private DebtType type;             // PAYABLE (nợ phải trả), RECEIVABLE (nợ phải thu)
    
    private BigDecimal totalDebt;      // Tổng tiền công nợ
    private BigDecimal creditLimit;    // Hạn mức tín dụng
    private BigDecimal paidAmount;     // Số tiền đã thanh toán
    private BigDecimal balance;        // Dư nợ = totalDebt - paidAmount
    
    private DebtStatus status;         // ACTIVE, SETTLED, OVERDUE
    private String notes;              // Ghi chú
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime settledAt;   // Ngày thanh toán xong
    private Boolean isActive = true;

    // ==================== Constructor ====================
    public Debt() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.paidAmount = BigDecimal.ZERO;
        this.balance = BigDecimal.ZERO;
    }

    // ==================== Enum ====================
    public enum DebtType {
        PAYABLE,      // Nợ phải trả (mua hàng từ nhà cung cấp)
        RECEIVABLE    // Nợ phải thu (bán hàng cho khách hàng)
    }

    public enum DebtStatus {
        ACTIVE,       // Đang có công nợ
        SETTLED,      // Đã thanh toán xong
        OVERDUE       // Quá hạn thanh toán
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

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public DebtType getType() {
        return type;
    }

    public void setType(DebtType type) {
        this.type = type;
    }

    public BigDecimal getTotalDebt() {
        return totalDebt;
    }

    public void setTotalDebt(BigDecimal totalDebt) {
        this.totalDebt = totalDebt;
    }

    public BigDecimal getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(BigDecimal creditLimit) {
        this.creditLimit = creditLimit;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public DebtStatus getStatus() {
        return status;
    }

    public void setStatus(DebtStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getSettledAt() {
        return settledAt;
    }

    public void setSettledAt(LocalDateTime settledAt) {
        this.settledAt = settledAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // ==================== Business Methods ====================
    /**
     * Cập nhật số dư công nợ
     */
    public void updateBalance() {
        this.balance = this.totalDebt.subtract(this.paidAmount);
        if (this.balance.compareTo(BigDecimal.ZERO) <= 0) {
            this.balance = BigDecimal.ZERO;
            this.status = DebtStatus.SETTLED;
            this.settledAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra nếu vượt hạn mức tín dụng
     */
    public boolean isOverCreditLimit() {
        return this.balance.compareTo(this.creditLimit) > 0;
    }
}
