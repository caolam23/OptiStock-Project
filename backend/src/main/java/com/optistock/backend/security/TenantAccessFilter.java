package com.optistock.backend.security;

import com.optistock.backend.repository.TenantRepository;
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

/**
 * TenantAccessFilter: Kiểm tra workspace hợp lệ từ header X-Workspace-Id.
 *
 * LUỒNG MỚI:
 * - Frontend gửi header "X-Workspace-Id: <tenantMongoId>" khi gọi API cần
 * workspace context.
 * - Filter kiểm tra workspace có ACTIVE không (không bị khóa, chưa hết hạn).
 * - API không cần workspace context (auth, onboarding, list workspaces) → bỏ
 * qua filter.
 *
 * Teammates dùng cách này để kiểm tra quyền:
 * 1. Frontend gửi header X-Workspace-Id
 * 2. Backend đọc header để biết workspace context
 * 3. Kết hợp với TenantMember để check role trong workspace đó
 */
@Component
public class TenantAccessFilter extends OncePerRequestFilter {

    @Autowired
    private TenantRepository tenantRepository;

    /** Các path không cần workspace context */
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/api/auth/",
            "/api/v1/workspaces/my-workspaces",
            "/api/v1/onboarding",
            "/api/admin");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Bỏ qua các path không cần workspace context
        if (EXCLUDED_PATHS.stream().anyMatch(requestPath::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Đọc X-Workspace-Id header (do frontend gửi khi đang làm việc trong 1
        // workspace)
        String workspaceId = request.getHeader("X-Workspace-Id");

        if (workspaceId != null && !workspaceId.isBlank()) {
            try {
                // Kiểm tra workspace có đang ACTIVE không (không bị khóa, chưa hết hạn
                // subscription)
                boolean isWorkspaceActive = tenantRepository.findById(workspaceId)
                        .map(tenant -> tenant.isActive())
                        .orElse(false);

                if (!isWorkspaceActive) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(
                            "{\"success\": false, \"message\": \"Workspace đã bị khóa hoặc hết hạn subscription\"}");
                    return;
                }
            } catch (Exception e) {
                logger.error("Error checking workspace status: " + e.getMessage());
                // Không block request nếu có lỗi check — để security layer xử lý
            }
        }
        // Nếu không có X-Workspace-Id: cho qua (API không cần workspace context)

        filterChain.doFilter(request, response);
    }
}
