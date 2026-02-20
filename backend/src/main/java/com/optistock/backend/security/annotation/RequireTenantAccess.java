package com.optistock.backend.security.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireTenantAccess {
    String paramName() default "tenantId";
    String message() default "Bạn không có quyền truy cập tenant này";
}
