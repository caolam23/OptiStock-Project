package com.optistock.backend.exception;

/**
 * CreditLimitException — Ném ra khi vượt hạn mức tín dụng
 */
public class CreditLimitException extends RuntimeException {
    private String errorCode;
    
    public CreditLimitException(String message) {
        super(message);
        this.errorCode = "CREDIT_LIMIT_EXCEEDED";
    }

    public CreditLimitException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
}
