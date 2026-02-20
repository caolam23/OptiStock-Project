package com.optistock.backend.security.annotation;

import com.optistock.backend.enums.UserRole;
import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireRole {
    UserRole[] value() default {};
    String message() default "Bạn không có quyền truy cập chức năng này";
}
