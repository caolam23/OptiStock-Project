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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    // --- 3. QUÊ MẬT KHẨU - STEP 1: GỬI OTP ---
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

    // --- 4. RESET MẬT KHẨU - STEP 2: XÁC NHẬN OTP & ĐỀ MẬT KHẨU MỚI ---
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
        String idTokenString = payload.get("token");

        if (idTokenString == null || idTokenString.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Google Token is missing"));
        }

        try {
            // Giả lập giải mã Google token (thực tế phải dùng Google Verifier)
            String emailFromGoogle = "demo.user@gmail.com";
            String nameFromGoogle = "Google User";
            String googleId = "123456789";

            User user = userRepository.findByEmail(emailFromGoogle).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(emailFromGoogle);
                newUser.setFullName(nameFromGoogle);
                newUser.setGoogleId(googleId);
                newUser.setProvider(User.AuthProvider.GOOGLE);
                newUser.setPassword(encoder.encode("GOOGLE_DEFAULT_PASS"));
                newUser.getRoles().add("ROLE_USER");
                return userRepository.save(newUser);
            });

            String jwt = jwtUtils.generateJwtToken(user.getEmail());

            AuthResponse response = new AuthResponse();
            response.setToken(jwt);
            response.setEmail(user.getEmail());
            response.setFullName(user.getFullName());
            response.setRoles(user.getRoles());
            response.setMessage("Google login successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid Google Token"));
        }
    }

    // --- 6. VERIFY TOKEN (kiểm tra token hợp lệ không) ---
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