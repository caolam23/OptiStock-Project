package com.optistock.backend.service;

import com.optistock.backend.dto.AuthRequest;
import com.optistock.backend.dto.AuthResponse;
import com.optistock.backend.dto.ForgotPasswordRequest;
import com.optistock.backend.dto.ResetPasswordRequest;
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
     * Đăng ký user mới.
     * User mới chưa thuộc kho nào (memberships rỗng).
     * Sau khi đăng ký, user sẽ được mời vào kho hoặc tự tạo kho.
     */
    public AuthResponse registerUser(AuthRequest request) {
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("DUPLICATE_EMAIL", "Email này đã được đăng ký!");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Email không hợp lệ!");
        }

        // Tạo user mới — KHÔNG gán membership/role tự động
        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName() != null ? request.getFullName() : "User",
                request.getPhoneNumber());
        // memberships = [] (rỗng) — user sẽ tạo hoặc được mời vào kho

        User savedUser = userRepository.save(user);

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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Email hoặc mật khẩu không đúng!"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("INVALID_PASSWORD", "Email hoặc mật khẩu không đúng!");
        }

        if (!user.isActive()) {
            throw new AuthException("ACCOUNT_DISABLED", "Tài khoản của bạn đã bị vô hiệu hóa!");
        }

        return buildAuthResponse(user);
    }

    /**
     * Gửi OTP reset mật khẩu
     */
    public void sendOtpForPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email này không tồn tại trong hệ thống!"));

        String otp = generateOtp();
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        user.setResetOtp(otp);
        user.setResetOtpExpiry(otpExpiry);
        userRepository.save(user);

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
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không trùng khớp!");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email này không tồn tại!"));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
            throw new AuthException("INVALID_OTP", "Mã OTP không chính xác!");
        }

        if (user.getResetOtpExpiry() == null || LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
            throw new AuthException("OTP_EXPIRED", "Mã OTP đã hết hạn. Vui lòng yêu cầu OTP mới!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            emailService.sendPasswordChangeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            System.err.println("Could not send password change email: " + e.getMessage());
        }

        return buildAuthResponse(user);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Build AuthResponse từ User object.
     * Trả về memberships thay vì roles + tenantId.
     */
    public AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateJwtToken(user);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAvatar(user.getAvatar());
        response.setMemberships(user.getMemberships());
        response.setActive(user.isActive());
        response.setMessage("Thành công!");

        return response;
    }
}
