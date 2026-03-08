package com.optistock.backend.config;

import com.optistock.backend.security.JwtAuthenticationFilter;
import com.optistock.backend.security.TenantAccessFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true, prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private TenantAccessFilter tenantAccessFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:5173"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/google-login",
                                "/api/auth/forgot-password", "/api/auth/reset-password")
                        .permitAll()
                        .requestMatchers("/api/auth/verify-token").permitAll()
                        // Invitation info: PUBLIC — hiển thị thông tin invite trước khi login
                        .requestMatchers("/api/v1/invitations/info").permitAll()
                        // Invitation accept/reject: cần đăng nhập
                        .requestMatchers("/api/v1/invitations/**").authenticated()
                        .requestMatchers("/api/onboarding/**", "/api/v1/onboarding/**").authenticated()
                        // SSE endpoint: EventSource không gửi được JWT header → permitAll
                        // (endpoint này chỉ push dữ liệu, không trả dữ liệu nhạy cảm)
                        .requestMatchers("/api/v1/workspaces/*/personnel/events").permitAll()
                        .requestMatchers("/api/v1/workspaces/**").authenticated()
                        .requestMatchers("/api/v1/staff/**").authenticated()
                        .requestMatchers("/api/v1/manager/**").authenticated()
                        .requestMatchers("/api/admin/**").authenticated()
                        .anyRequest().authenticated());

        // --- SỬA LỖI TẠI ĐÂY ---

        // 1. Thêm JWT Filter TRƯỚC UsernamePasswordAuthenticationFilter
        // (Để giải mã token lấy thông tin user)
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // 2. Thêm Tenant Access Filter SAU UsernamePasswordAuthenticationFilter
        // (Lúc này JWT filter đã chạy xong, đã có thông tin user để check tenant)
        http.addFilterAfter(tenantAccessFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}