package com.optistock.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Gửi email OTP cho việc reset mật khẩu
     */
    public void sendOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("OptiStock - Mã OTP Reset Mật Khẩu");
            message.setText("Mã OTP của bạn là: " + otp + "\n\n" +
                    "Mã này có hiệu lực trong 10 phút.\n" +
                    "Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.\n\n" +
                    "---\n" +
                    "Đây là email tự động, vui lòng không trả lời.");
            
            mailSender.send(message);
            System.out.println("OTP email sent to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Gửi email xác nhận đăng ký
     */
    public void sendWelcomeEmail(String email, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("OptiStock - Chào mừng bạn!");
            message.setText("Xin chào " + fullName + ",\n\n" +
                    "Cảm ơn bạn đã đăng ký tài khoản OptiStock!\n" +
                    "Bạn giờ đã có thể đăng nhập vào hệ thống.\n\n" +
                    "---\n" +
                    "Đây là email tự động, vui lòng không trả lời.");
            
            mailSender.send(message);
            System.out.println("Welcome email sent to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    /**
     * Gửi email thông báo thay đổi mật khẩu
     */
    public void sendPasswordChangeEmail(String email, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("OptiStock - Mật khẩu đã được thay đổi");
            message.setText("Xin chào " + fullName + ",\n\n" +
                    "Mật khẩu của bạn đã được thay đổi thành công.\n" +
                    "Nếu đây không phải là bạn, vui lòng liên hệ với chúng tôi ngay lập tức.\n\n" +
                    "---\n" +
                    "Đây là email tự động, vui lòng không trả lời.");
            
            mailSender.send(message);
            System.out.println("Password change email sent to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send password change email: " + e.getMessage());
        }
    }
}
