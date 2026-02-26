package com.optistock.backend.controller;

import com.optistock.backend.dto.*;
import com.optistock.backend.enums.UserRole;
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

    // --- 1. ĐĂNG KÝ (REGISTER) ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.registerUser(request);
            response.setMessage("Đăng ký thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // --- 2. ĐĂNG NHẬP (LOGIN) ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.loginUser(request.getEmail(), request.getPassword());
            
            // DEBUG: Log response trước khi gửi về
            System.out.println("✅ AuthController - Login response roles: " + response.getRoles());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // --- 3. QUÊN MẬT KHẨU - STEP 1: GỬI OTP ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.sendOtpForPasswordReset(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // --- 4. RESET MẬT KHẨU - STEP 2: XÁC NHẬN OTP & ĐỔI MẬT KHẨU MỚI ---
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = authService.resetPassword(request);
            response.setMessage("Mật khẩu đã được thay đổi thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // --- 5. GOOGLE LOGIN (SSO) ---
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        // Token này là Access Token được gửi từ Frontend (ReactJS)
        String accessToken = payload.get("token");

        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Google Token is missing"));
        }

        try {
            // 1. Gọi Google API để lấy thông tin người dùng từ Access Token
            String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            // Sử dụng Map<String, Object> để tránh cảnh báo raw type
            ResponseEntity<Map> response = restTemplate.exchange(
                    googleUserInfoUrl, HttpMethod.GET, entity, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = (Map<String, Object>) response.getBody();

            if (userInfo == null || userInfo.get("email") == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid Google Token"));
            }

            // 2. Lấy thông tin từ Google
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");
            String picture = (String) userInfo.get("picture");

            // 3. Tìm hoặc tạo User
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;
            boolean isNewUser = !existingUser.isPresent();

            if (isNewUser) {
                // Tạo user mới
                user = new User();
                user.setEmail(email);
                user.setFullName(name);
                user.setGoogleId(googleId);
                user.setAvatar(picture);
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setPassword(encoder.encode(UUID.randomUUID().toString()));
                user.setActive(true);
                user.setCreatedAt(java.time.LocalDateTime.now());
                user.setUpdatedAt(java.time.LocalDateTime.now());

                // Tạo tenant mặc định cho user mới (chỉ khi là Google login lần đầu)
                try {
                    TenantDTO tenant = tenantService.createTenant(email, name + "'s Warehouse", null);
                    user.setTenantId(tenant.getTenantId());
                } catch (Exception e) {
                    System.err.println("Could not create default tenant: " + e.getMessage());
                }
                user.getRoles().add(UserRole.STAFF.getCode());

                user = userRepository.save(user);
            } else {
                user = existingUser.get();
                // Update Google info if not set
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    user.setAvatar(picture);
                    user.setProvider(User.AuthProvider.GOOGLE);
                    user = userRepository.save(user);
                }
            }

            // 4. Tạo JWT Token và trả về response
            AuthResponse authResponse = buildAuthResponse(user);
            authResponse.setMessage(isNewUser ? "Đăng ký thành công! Kho hàng mặc định đã được tạo." : "Đăng nhập thành công!");

            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Lỗi xác thực Google: " + e.getMessage()));
        }
    }

    // --- 6. VERIFY TOKEN (Kiểm tra token hợp lệ không) ---
    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Bỏ "Bearer "
            boolean isValid = jwtUtils.validateJwtToken(jwt);

            if (isValid) {
                String email = jwtUtils.getUserNameFromJwtToken(jwt);
                String userId = jwtUtils.getUserIdFromJwtToken(jwt);
                String tenantId = jwtUtils.getTenantIdFromJwtToken(jwt);
                Set<String> roles = jwtUtils.getRolesFromJwtToken(jwt);

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("message", "Token is valid");
                result.put("email", email);
                result.put("userId", userId);
                result.put("tenantId", tenantId);
                result.put("roles", roles);
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

    // Utility method
    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateJwtToken(user);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAvatar(user.getAvatar());
        // ✅ FIX: Convert Set<String> to List<String> vì user.getRoles() trả về Set
        response.setRoles(new java.util.ArrayList<>(user.getRoles()));
        response.setTenantId(user.getTenantId());
        response.setActive(user.isActive());

        return response;
    }
}