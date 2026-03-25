package com.optistock.backend.exception;

/**
 * ForbiddenException: Người dùng đã xác thực nhưng KHÔNG CÓ QUYỀN truy cập
 * resource.
 *
 * Phân biệt với AuthException:
 * - AuthException → HTTP 401 (chưa login, token hết hạn)
 * - ForbiddenException → HTTP 403 (đã login, nhưng sai role/workspace)
 *
 * Dùng khi:
 * - User không phải member của workspace (@RequireWorkspaceRole)
 * - User có role không đủ quyền thực hiện thao tác
 */
public class ForbiddenException extends RuntimeException {

    private final String errorCode;

    public ForbiddenException(String message) {
        super(message);
        this.errorCode = "FORBIDDEN";
    }

    public ForbiddenException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
