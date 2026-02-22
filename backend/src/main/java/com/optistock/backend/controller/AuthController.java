package com.optistock.backend.controller;

import com.optistock.backend.dto.*;
import com.optistock.backend.enums.UserRole;
import com.optistock.backend.model.TenantMembership;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.UserRepository;
import com.optistock.backend.service.AuthService;
import com.optistock.backend.service.TenantService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    // --- 1. ĐĂNG KÝ ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        try {
            // Bước 1: Tạo user (chưa có membership)
            authService.registerUser(request);

            // Bước 2: Load user vừa tạo từ DB
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after registration"));

            // Bước 3: Tạo kho mặc định — giống Google login
            try {
                String displayName = (request.getFullName() != null && !request.getFullName().isBlank())
                        ? request.getFullName()
                        : "User";
                CreateTenantRequest tenantRequest = new CreateTenantRequest();
                tenantRequest.setCompanyName(displayName + "'s Warehouse");
                tenantRequest.setBusinessType("General");

                TenantDTO tenant = tenantService.createTenant(request.getEmail(), tenantRequest);
                user.addOrUpdateMembership(tenant.getTenantId(), UserRole.MANAGER.getCode());
                userRepository.save(user);
            } catch (Exception e) {
                System.err.println("Could not create default tenant for register: " + e.getMessage());
            }

            // Bước 4: Build response với membership mới
            AuthResponse response = authService.buildAuthResponse(user);
            response.setMessage("Đăng ký thành công! Kho hàng mặc định đã được tạo.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- 2. ĐĂNG NHẬP ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.loginUser(request.getEmail(), request.getPassword());
            response.setMessage("Đăng nhập thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    // --- 3. QUÊN MẬT KHẨU ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.sendOtpForPasswordReset(request);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP đã được gửi đến email."));
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- 4. RESET MẬT KHẨU ---
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = authService.resetPassword(request);
            response.setMessage("Mật khẩu đã được thay đổi thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- 5. GOOGLE LOGIN ---
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String accessToken = payload.get("token");

        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Google Token is missing"));
        }

        try {
            // Gọi Google API lấy thông tin user
            String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.exchange(googleUserInfoUrl, HttpMethod.GET, entity, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = (Map<String, Object>) response.getBody();

            if (userInfo == null || userInfo.get("email") == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid Google Token"));
            }

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");
            String picture = (String) userInfo.get("picture");

            // Tìm hoặc tạo User
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;
            boolean isNewUser = !existingUser.isPresent();

            if (isNewUser) {
                user = new User(email, encoder.encode(UUID.randomUUID().toString()), name, null);
                user.setGoogleId(googleId);
                user.setAvatar(picture);
                user.setProvider(User.AuthProvider.GOOGLE);

                // Tạo tenant mặc định + thêm membership MANAGER
                try {
                    CreateTenantRequest tenantRequest = new CreateTenantRequest();
                    tenantRequest.setCompanyName(name + "'s Warehouse");
                    tenantRequest.setBusinessType("General");
                    TenantDTO tenant = tenantService.createTenant(email, tenantRequest);

                    // Thêm vào kho với role MANAGER (dùng method mới)
                    user.addOrUpdateMembership(tenant.getTenantId(), UserRole.MANAGER.getCode());
                } catch (Exception e) {
                    System.err.println("Could not create default tenant: " + e.getMessage());
                }

                user = userRepository.save(user);
            } else {
                user = existingUser.get();
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    user.setAvatar(picture);
                    user.setProvider(User.AuthProvider.GOOGLE);
                    user = userRepository.save(user);
                }
            }

            AuthResponse authResponse = authService.buildAuthResponse(user);
            authResponse.setMessage(
                    isNewUser ? "Đăng ký thành công! Kho hàng mặc định đã được tạo." : "Đăng nhập thành công!");

            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Lỗi xác thực Google: " + e.getMessage()));
        }
    }

    // --- 6. VERIFY TOKEN ---
    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            boolean isValid = jwtUtils.validateJwtToken(jwt);

            if (isValid) {
                String email = jwtUtils.getUserNameFromJwtToken(jwt);
                String userId = jwtUtils.getUserIdFromJwtToken(jwt);
                List<TenantMembership> memberships = jwtUtils.getMembershipsFromJwtToken(jwt);

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("email", email);
                result.put("userId", userId);
                result.put("memberships", memberships);
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Token is invalid"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid token format"));
        }
    }

    private ResponseEntity<?> errorResponse(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(Map.of("success", false, "message", message));
    }
}