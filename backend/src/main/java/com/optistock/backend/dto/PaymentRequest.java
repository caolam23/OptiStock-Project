package com.optistock.backend.dto;

import java.math.BigDecimal;

/**
 * PaymentRequest — DTO để thanh toán công nợ
 */
public class PaymentRequest {
    private BigDecimal amount;
    private String paymentMethod;
    private String reference;

    // ==================== Getters & Setters ====================
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }
}
