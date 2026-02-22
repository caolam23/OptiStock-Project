package com.optistock.backend.security;

import com.optistock.backend.model.TenantMembership;
import com.optistock.backend.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = extractTokenFromRequest(request);

            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String email = jwtUtils.getUserNameFromJwtToken(jwt);

                // Lấy X-Tenant-Id header — biết user đang làm việc với kho nào
                String currentTenantId = request.getHeader("X-Tenant-Id");

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                if (currentTenantId != null && !currentTenantId.isEmpty()) {
                    // Lấy role của user trong tenant hiện tại
                    String roleInTenant = jwtUtils.getRoleInTenantFromJwtToken(jwt, currentTenantId);
                    if (roleInTenant != null) {
                        // Add role với ROLE_ prefix (Spring Security convention)
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleInTenant));
                    }
                } else {
                    // Không có X-Tenant-Id → load tất cả roles từ tất cả memberships
                    // (dùng cho SUPER_ADMIN hoặc các endpoint không cần tenant context)
                    List<TenantMembership> memberships = jwtUtils.getMembershipsFromJwtToken(jwt);
                    for (TenantMembership m : memberships) {
                        String role = m.getRole();
                        if (!role.startsWith("ROLE_")) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                        } else {
                            authorities.add(new SimpleGrantedAuthority(role));
                        }
                    }
                    // Nếu không có membership nào (user chưa thuộc kho nào)
                    if (authorities.isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    }
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email,
                        null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
