package com.optistock.backend.security.aspect;

import com.optistock.backend.enums.UserRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.security.annotation.RequireRole;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Aspect
@Component
public class RoleAuthorizationAspect {

    @Around("@annotation(requireRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint, RequireRole requireRole) throws Throwable {
        // 1. Lấy thông tin xác thực từ Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 2. Kiểm tra nếu chưa đăng nhập
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthException("AUTH_ERROR", "Vui lòng đăng nhập để truy cập chức năng này");
        }

        // 3. Lấy danh sách Role của User hiện tại
        Set<String> userRoles = new HashSet<>();
        for (GrantedAuthority auth : authentication.getAuthorities()) {
            String role = auth.getAuthority();
            // Chuẩn hóa role: Nếu có prefix ROLE_ thì cắt bỏ để so sánh dễ hơn
            if (role.startsWith("ROLE_")) {
                userRoles.add(role.substring(5)); 
            } else {
                userRoles.add(role);
            }
        }

        // 4. Kiểm tra xem User có quyền (Role) yêu cầu hay không
        UserRole[] requiredRoles = requireRole.value();
        
        // Nếu API yêu cầu role cụ thể
        if (requiredRoles.length > 0) {
            boolean hasRole = Arrays.stream(requiredRoles)
                    .anyMatch(role -> userRoles.contains(role.getCode()));

            if (!hasRole) {
                // errorCode = ROLE_REQUIRED → GlobalExceptionHandler sẽ trả 403 thay vì 401
                // (Tránh axios interceptor xóa token và đẩy user về /login)
                throw new AuthException("ROLE_REQUIRED", requireRole.message());
            }
        }

        // 5. Nếu hợp lệ, cho phép chạy tiếp method gốc
        return joinPoint.proceed();
    }
}