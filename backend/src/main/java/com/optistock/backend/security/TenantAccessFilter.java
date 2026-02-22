package com.optistock.backend.security;

import com.optistock.backend.repository.TenantRepository;
import com.optistock.backend.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class TenantAccessFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private TenantRepository tenantRepository;

    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/google-login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/verify-token");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Bỏ qua các đường dẫn public
        if (EXCLUDED_PATHS.stream().anyMatch(requestPath::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        // SUPER_ADMIN — không cần tenant check
        if (requestPath.startsWith("/api/admin/system")) {
            filterChain.doFilter(request, response);
            return;
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String jwt = bearerToken.substring(7);
            String tenantId = request.getHeader("X-Tenant-Id");

            // Nếu có X-Tenant-Id header → kiểm tra user có phải member không + tenant còn
            // active không
            if (tenantId != null && !tenantId.isEmpty()) {
                try {
                    // 1. Kiểm tra user có phải member của tenant này không
                    boolean isMember = jwtUtils.isMemberOfTenant(jwt, tenantId);
                    if (!isMember) {
                        writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN,
                                "Bạn không phải thành viên của kho này");
                        return;
                    }

                    // 2. Kiểm tra tenant có đang active không
                    boolean isTenantActive = tenantRepository.findByTenantId(tenantId)
                            .map(tenant -> tenant.isActive())
                            .orElse(false);

                    if (!isTenantActive) {
                        writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN,
                                "Kho hàng đã bị khóa hoặc hết hạn đăng ký");
                        return;
                    }
                } catch (Exception e) {
                    logger.error("Error checking tenant access: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void writeErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\": false, \"message\": \"" + message + "\"}");
    }
}
