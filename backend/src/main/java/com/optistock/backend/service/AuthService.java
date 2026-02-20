package com.optistock.backend.service;

import com.optistock.backend.dto.AuthRequest;
import com.optistock.backend.dto.AuthResponse;
import com.optistock.backend.dto.ForgotPasswordRequest;
import com.optistock.backend.dto.ResetPasswordRequest;
import com.optistock.backend.enums.UserRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.exception.UserNotFoundException;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.UserRepository;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;

    /**
     * Đăng ký user mới
     */
    public AuthResponse registerUser(AuthRequest request) {
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("DUPLICATE_EMAIL", "Email này đã được đăng ký!");
        }

        // Kiểm tra dữ liệu đầu vào
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Email không hợp lệ!");
        }

        // Tạo user mới
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName() != null ? request.getFullName() : "User");
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProvider(User.AuthProvider.LOCAL);
        // ✅ FIX: Gán STAFF role thay vì ROLE_USER
        user.getRoles().add(UserRole.STAFF.getCode());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Gửi email chào mừng (optional)
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());
        } catch (Exception e) {
            System.err.println("Could not send welcome email: " + e.getMessage());
        }

        return buildAuthResponse(savedUser);
    }

    /**
     * Đăng nhập
     */
    public AuthResponse loginUser(String email, String password) {
        // Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Email hoặc mật khẩu không đúng!"));

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("INVALID_PASSWORD", "Email hoặc mật khẩu không đúng!");
        }

        // Trả về response
        return buildAuthResponse(user);
    }

    /**
     * Gửi OTP reset mật khẩu
     */
    public void sendOtpForPasswordReset(ForgotPasswordRequest request) {
        // Tìm user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email này không tồn tại trong hệ thống!"));

        // Tạo OTP
        String otp = generateOtp();
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        // Lưu OTP vào DB
        user.setResetOtp(otp);
        user.setResetOtpExpiry(otpExpiry);
        userRepository.save(user);

        // Gửi email
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại!");
        }
    }

    /**
     * Reset mật khẩu bằng OTP
     */
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        // Kiểm tra mật khẩu mới
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không trùng khớp!");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        // Tìm user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email này không tồn tại!"));

        // Kiểm tra OTP
        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
            throw new AuthException("INVALID_OTP", "Mã OTP không chính xác!");
        }

        // Kiểm tra hết hạn OTP
        if (user.getResetOtpExpiry() == null || LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
            throw new AuthException("OTP_EXPIRED", "Mã OTP đã hết hạn. Vui lòng yêu cầu OTP mới!");
        }

        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null); // Xóa OTP
        user.setResetOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Gửi email thông báo
        try {
            emailService.sendPasswordChangeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            System.err.println("Could not send password change email: " + e.getMessage());
        }

        return buildAuthResponse(user);
    }

    /**
     * Tạo OTP ngẫu nhiên 6 chữ số
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Build AuthResponse từ User object
     */
    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateJwtToken(user);
        
        // DEBUG: Log roles từ user
        System.out.println("🔍 DEBUG - User email: " + user.getEmail());
        System.out.println("🔍 DEBUG - User roles (raw): " + user.getRoles());
        System.out.println("🔍 DEBUG - User roles type: " + user.getRoles().getClass().getName());
        
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
        response.setMessage("Đăng nhập thành công!");
        
        System.out.println("✅ DEBUG - Response roles: " + response.getRoles());
        
        return response;
    }
}
