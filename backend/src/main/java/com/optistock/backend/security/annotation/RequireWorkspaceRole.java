package com.optistock.backend.security.annotation;

import com.optistock.backend.enums.WorkspaceRole;
import java.lang.annotation.*;

/**
 * Annotation đánh dấu API endpoint yêu cầu role cụ thể trong Workspace.
 *
 * KHÁC với @RequireRole (chỉ check System Role: SUPER_ADMIN).
 * Annotation này check role TRONG KHO (OWNER, MANAGER, ACCOUNTANT, SALE, STAFF)
 * dựa trên TenantMember.role và header X-Workspace-Id.
 *
 * Cách dùng:
 *
 * @RequireWorkspaceRole({WorkspaceRole.OWNER, WorkspaceRole.MANAGER})
 *                                             @PostMapping("/products")
 *                                             public ResponseEntity<?>
 *                                             createProduct(...) { ... }
 *
 *                                             Nếu user không thuộc workspace
 *                                             hoặc không đủ quyền → trả 403
 *                                             Forbidden.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireWorkspaceRole {
    /**
     * Danh sách role được phép truy cập.
     * Chỉ cần user có MỘT TRONG các role này là đủ.
     */
    WorkspaceRole[] value();

    String message() default "Bạn không có quyền thực hiện thao tác này trong kho";
}
