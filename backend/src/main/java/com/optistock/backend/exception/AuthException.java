package com.optistock.backend.exception;

public class AuthException extends RuntimeException {
    private String errorCode;

    public AuthException(String message) {
        super(message);
        this.errorCode = "AUTH_ERROR";
    }

    public AuthException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public AuthException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "AUTH_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }
}
