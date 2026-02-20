package com.optistock.backend.security;

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
import java.util.Set;

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
                
                // Extract roles from JWT token
                Set<String> roles = jwtUtils.getRolesFromJwtToken(jwt);
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                
                // Add roles as authorities with ROLE_ prefix
                if (roles != null && !roles.isEmpty()) {
                    for (String role : roles) {
                        if (!role.startsWith("ROLE_")) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                        } else {
                            authorities.add(new SimpleGrantedAuthority(role));
                        }
                    }
                } else {
                    // Default role if no roles in token
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                }
                
                // Tạo Authentication object để lưu vào SecurityContext
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(email, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Tách JWT token từ header "Authorization: Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Bỏ "Bearer " (7 ký tự)
        }
        return null;
    }
}
