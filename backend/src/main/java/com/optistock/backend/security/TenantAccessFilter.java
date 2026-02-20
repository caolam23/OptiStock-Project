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
            "/api/auth/verify-token"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip excluded paths
        String requestPath = request.getRequestURI();
        if (EXCLUDED_PATHS.stream().anyMatch(requestPath::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token from header
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String jwt = bearerToken.substring(7);

            try {
                // Extract tenantId from JWT
                String tenantId = jwtUtils.getTenantIdFromJwtToken(jwt);

                // If request is not for admin (super admin doesn't need tenant check)
                if (tenantId != null && !requestPath.startsWith("/api/admin")) {
                    // Check if tenant is active
                    boolean isTenantActive = tenantRepository.findByTenantId(tenantId)
                            .map(tenant -> tenant.isActive())
                            .orElse(false);

                    if (!isTenantActive) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"success\": false, \"message\": \"Tenant locked or subscription expired\"}");
                        return;
                    }
                }
            } catch (Exception e) {
                logger.error("Error checking tenant status: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
