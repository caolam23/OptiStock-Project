package com.optistock.backend.util;

import com.optistock.backend.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JwtUtils {

    @Value("${optistock.app.jwtSecret}")
    private String jwtSecret;

    @Value("${optistock.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT token from email (legacy)
     */
    public String generateJwtToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate JWT token from User object
     * Claims: userId, email (subject), systemRoles
     * NOTE: tenantId/workspaceId KHÔNG lưu trong JWT
     * Frontend gửi X-Workspace-Id header riêng khi cần workspace context
     */
    public String generateJwtToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles()); // System roles: ["SUPER_ADMIN"] hoặc []
        claims.put("userId", user.getId());
        claims.put("fullName", user.getFullName());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * @deprecated tenantId không còn lưu trong JWT.
     *             Dùng X-Workspace-Id header thay thế.
     *             Giữ lại method này để tránh compile error nếu có code cũ vẫn gọi.
     */
    @Deprecated
    public String getTenantIdFromJwtToken(String token) {
        return null; // Always return null — no longer stored in JWT
    }

    public String getUserIdFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                    .parseClaimsJws(token).getBody();
            return claims.get("userId", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public Set<String> getRolesFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                    .parseClaimsJws(token).getBody();

            Object rolesObj = claims.get("roles");
            Set<String> rolesSet = new HashSet<>();

            if (rolesObj instanceof Collection) {
                for (Object item : (Collection<?>) rolesObj) {
                    if (item != null) {
                        rolesSet.add(item.toString());
                    }
                }
            } else if (rolesObj instanceof String) {
                rolesSet.add((String) rolesObj);
            }

            return rolesSet;
        } catch (Exception e) {
            // Trả về Set rỗng nếu có lỗi parse token
            System.err.println("Lỗi khi parse roles từ JWT: " + e.getMessage());
            return new HashSet<>();
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Invalid JWT signature: " + e.getMessage());
        }
        return false;
    }
}