package com.optistock.backend.util;

import com.optistock.backend.model.TenantMembership;
import com.optistock.backend.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

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
     * Generate JWT token từ User object.
     * Token mang toàn bộ memberships (list tenantId + role).
     */
    public String generateJwtToken(User user) {
        // Chuyển memberships thành List<Map> để lưu vào JWT
        List<Map<String, String>> membershipData = user.getMemberships().stream()
                .map(m -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("tenantId", m.getTenantId());
                    map.put("role", m.getRole());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> claims = new HashMap<>();
        claims.put("memberships", membershipData);
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

    /**
     * Generate JWT token từ email (legacy — vẫn giữ để tương thích)
     */
    public String generateJwtToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
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

    /**
     * Lấy danh sách memberships từ JWT token.
     * 
     * @return List<TenantMembership> hoặc danh sách rỗng
     */
    @SuppressWarnings("unchecked")
    public List<TenantMembership> getMembershipsFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                    .parseClaimsJws(token).getBody();

            Object membershipsObj = claims.get("memberships");
            if (membershipsObj instanceof List) {
                List<Map<String, String>> rawList = (List<Map<String, String>>) membershipsObj;
                return rawList.stream()
                        .map(m -> new TenantMembership(m.get("tenantId"), m.get("role")))
                        .collect(Collectors.toList());
            }
            return new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Lấy role của user trong 1 tenant cụ thể từ JWT.
     * 
     * @param token    JWT token
     * @param tenantId ID của tenant cần kiểm tra
     * @return role string hoặc null
     */
    public String getRoleInTenantFromJwtToken(String token, String tenantId) {
        List<TenantMembership> memberships = getMembershipsFromJwtToken(token);
        return memberships.stream()
                .filter(m -> m.getTenantId().equals(tenantId))
                .map(TenantMembership::getRole)
                .findFirst()
                .orElse(null);
    }

    /**
     * Kiểm tra user (trong JWT) có phải member của tenant không.
     */
    public boolean isMemberOfTenant(String token, String tenantId) {
        return getMembershipsFromJwtToken(token).stream()
                .anyMatch(m -> m.getTenantId().equals(tenantId));
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