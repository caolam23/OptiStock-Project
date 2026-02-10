package com.optistock.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Màu chủ đạo của thương hiệu (Vàng cam)
    private static final String BRAND_COLOR = "#F59E0B";
    private static final String BRAND_NAME = "OptiStock";

    /**
     * Gửi email OTP cho việc reset mật khẩu (HTML)
     */
    public void sendOtpEmail(String email, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject(" Mã xác thực OTP - " + BRAND_NAME);

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background-color: %s; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">%s</h1>
                        </div>
                        <div style="padding: 30px; color: #333333;">
                            <h2 style="text-align: center; color: #1F2937;">Yêu cầu đặt lại mật khẩu</h2>
                            <p>Xin chào,</p>
                            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này. Dưới đây là mã OTP của bạn:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: %s; background: #FFF7ED; padding: 15px 30px; border: 2px dashed %s; border-radius: 8px;">
                                    %s
                                </span>
                            </div>
                            
                            <p>Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
                            <p style="font-size: 13px; color: #666;">Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                            <p>Email này được gửi tự động từ hệ thống %s. Vui lòng không trả lời.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(BRAND_COLOR, BRAND_NAME, BRAND_COLOR, BRAND_COLOR, otp, BRAND_NAME);

            helper.setText(htmlContent, true); // true = isHtml
            mailSender.send(message);
            System.out.println("HTML OTP email sent to: " + email);

        } catch (MessagingException e) {
            System.err.println("Failed to send HTML OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Gửi email xác nhận đăng ký (HTML)
     */
    public void sendWelcomeEmail(String email, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject(" Chào mừng bạn đến với " + BRAND_NAME + "!");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background-color: %s; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">%s</h1>
                        </div>
                        <div style="padding: 30px; color: #333333;">
                            <h2 style="text-align: center; color: #1F2937;">Đăng ký thành công! 🎉</h2>
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Cảm ơn bạn đã tin tưởng và lựa chọn <strong>%s</strong> để quản lý kho vận thông minh.</p>
                            <p>Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ để bắt đầu trải nghiệm.</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:3000/login" style="background-color: %s; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                    Đăng Nhập Ngay
                                </a>
                            </div>
                            
                            <p>Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi qua email này.</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                            <p>&copy; 2026 %s. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(BRAND_COLOR, BRAND_NAME, fullName, BRAND_NAME, BRAND_COLOR, BRAND_NAME);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("HTML Welcome email sent to: " + email);

        } catch (MessagingException e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    /**
     * Gửi email thông báo thay đổi mật khẩu (HTML)
     */
    public void sendPasswordChangeEmail(String email, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject(" Cảnh báo bảo mật: Mật khẩu đã thay đổi");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background-color: %s; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">%s</h1>
                        </div>
                        <div style="padding: 30px; color: #333333;">
                            <div style="text-align: center; font-size: 40px; margin-bottom: 10px;">🔒</div>
                            <h2 style="text-align: center; color: #1F2937;">Mật khẩu đã được thay đổi</h2>
                            
                            <p>Xin chào <strong>%s</strong>,</p>
                            
                            <p>Chúng tôi gửi email này để xác nhận rằng mật khẩu tài khoản của bạn vừa được thay đổi thành công.</p>
                            
                            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #166534;">
                                    <strong>Nếu bạn thực hiện thay đổi này:</strong><br>
                                    Bạn có thể yên tâm bỏ qua email này.
                                </p>
                            </div>

                            <p style="color: #ef4444; font-weight: 600;">
                                ⚠️ Nếu bạn KHÔNG thực hiện thay đổi này?
                            </p>
                            <p>Tài khoản của bạn có thể đã bị xâm nhập. Vui lòng đặt lại mật khẩu ngay lập tức hoặc liên hệ với admin.</p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="http://localhost:3000/forgot-password" style="color: %s; font-weight: bold; text-decoration: underline;">
                                    Khôi phục tài khoản
                                </a>
                            </div>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                            <p>Email bảo mật từ hệ thống %s.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(BRAND_COLOR, BRAND_NAME, fullName, BRAND_COLOR, BRAND_NAME);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("HTML Password change email sent to: " + email);

        } catch (MessagingException e) {
            System.err.println("Failed to send password change email: " + e.getMessage());
        }
    }
}