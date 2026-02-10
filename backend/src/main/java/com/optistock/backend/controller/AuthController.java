package com.optistock.backend.controller;

import com.optistock.backend.dto.AuthRequest;
import com.optistock.backend.dto.AuthResponse;
import com.optistock.backend.dto.ForgotPasswordRequest;
import com.optistock.backend.dto.ResetPasswordRequest;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.UserRepository;
import com.optistock.backend.service.AuthService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate; // Thư viện để gọi sang Google

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

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

    // --- 5. GOOGLE LOGIN (SSO) - ĐÃ CẬP NHẬT LOGIC THẬT ---
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
            headers.setBearerAuth(accessToken); // Gắn token vào header Authorization: Bearer <token>
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            // Gửi request GET lên Google
            ResponseEntity<Map> response = restTemplate.exchange(
                    googleUserInfoUrl, HttpMethod.GET, entity, Map.class);

            Map<String, Object> userInfo = response.getBody();

            if (userInfo == null || userInfo.get("email") == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Invalid Google Token"));
            }

            // 2. Lấy thông tin thật từ phản hồi của Google
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub"); // Google ID duy nhất
            // String picture = (String) userInfo.get("picture"); // Có thể lấy avatar nếu cần

            // 3. Tìm hoặc tạo User trong Database
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                // Nếu chưa có user thì tạo mới
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFullName(name);
                newUser.setGoogleId(googleId);
                newUser.setProvider(User.AuthProvider.GOOGLE);
                // Tạo password ngẫu nhiên vì login bằng Google không cần password
                newUser.setPassword(encoder.encode(UUID.randomUUID().toString()));
                newUser.getRoles().add("ROLE_USER");
                return userRepository.save(newUser);
            });

            // Nếu user đã tồn tại (đăng ký bằng email thường trước đó) nhưng chưa link Google ID
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setProvider(User.AuthProvider.GOOGLE);
                userRepository.save(user);
            }

            // 4. Tạo JWT Token của hệ thống OptiStock để trả về cho Frontend
            String jwt = jwtUtils.generateJwtToken(user.getEmail());

            AuthResponse authResponse = new AuthResponse();
            authResponse.setToken(jwt);
            authResponse.setEmail(user.getEmail());
            authResponse.setFullName(user.getFullName());
            authResponse.setRoles(user.getRoles());
            authResponse.setMessage("Đăng nhập Google thành công!");

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
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Token is valid");
                response.put("email", email);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Token is invalid"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid token format"));
        }
    }
}