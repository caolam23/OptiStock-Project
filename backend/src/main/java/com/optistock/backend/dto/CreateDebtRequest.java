package com.optistock.backend.dto;

import com.optistock.backend.model.Debt;
import java.math.BigDecimal;

/**
 * CreateDebtRequest — DTO để tạo công nợ mới
 */
public class CreateDebtRequest {
    private String partnerId;
    private String partnerName;
    private Debt.DebtType type;
    private BigDecimal totalDebt;
    private BigDecimal creditLimit;
    private String notes;

    // ==================== Getters & Setters ====================
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

    public Debt.DebtType getType() {
        return type;
    }

    public void setType(Debt.DebtType type) {
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
