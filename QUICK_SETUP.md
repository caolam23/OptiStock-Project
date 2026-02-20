# OptiStock Authentication System - Quick Setup

## ⚡ Setup Nhanh (5 bước)

### Bước 1: Clone & Mở Project
```bash
cd OptiStock-Project/backend
code .
```

### Bước 2: Cấu Hình Email Gmail (BẮT BUỘC)

1. Vào https://myaccount.google.com/security
2. Bật **2-Step Verification**
3. Vào https://myaccount.google.com/apppasswords
4. Tạo App Password
5. Copy vào `src/main/resources/application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Bước 3: Đảm Bảo MongoDB Chạy

```bash
# Trên một terminal khác
mongod

# Hoặc nếu dùng Docker
docker run -d -p 27017:27017 mongo
```

### Bước 4: Compile & Build

```bash
./mvnw.cmd clean compile
./mvnw.cmd spring-boot:run
```

### Bước 5: Test API

Dùng Postman hoặc curl để test:

```bash
# Test Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"Test1234!","fullName":"Test"}'
```

---

## 📂 Files Created

```
✅ backend/src/main/java/com/optistock/backend/
   ├── dto/
   │   ├── AuthRequest.java
   │   ├── AuthResponse.java
   │   ├── ForgotPasswordRequest.java
   │   └── ResetPasswordRequest.java
   ├── exception/
   │   ├── AuthException.java
   │   ├── UserNotFoundException.java
   │   └── GlobalExceptionHandler.java
   ├── security/
   │   └── JwtAuthenticationFilter.java
   ├── service/
   │   ├── AuthService.java (NEW - Business Logic)
   │   └── EmailService.java (NEW - Email Service)
   ├── model/
   │   └── User.java (UPDATED - Added OTP fields)
   ├── controller/
   │   └── AuthController.java (UPDATED - Full endpoints)
   └── config/
       └── SecurityConfig.java (UPDATED - JWT Filter)

✅ Updated Files:
   ├── application.properties (Email config)
   ├── pom.xml (Already has dependencies)
   └── UserRepository.java (No changes needed)

✅ Documentation:
   ├── AUTHENTICATION_GUIDE.md (Comprehensive guide)
   └── API_DOCUMENTATION.md (API Reference)
```

---

## 🎯 Features Implemented

### ✅ Authentication
- [x] Register - Đăng ký user mới
- [x] Login - Đăng nhập bằng email/password
- [x] JWT Token Generation & Validation
- [x] JWT Filter - Kiểm tra token trên mỗi request

### ✅ Password Recovery
- [x] Forgot Password - Gửi OTP qua email
- [x] Reset Password - Đổi mật khẩu bằng OTP
- [x] OTP Expiry - 10 phút

### ✅ SSO
- [x] Google Login - Đăng nhập Google (Mock)

### ✅ Security
- [x] BCrypt Password Encryption
- [x] CORS Configuration
- [x] Global Exception Handler
- [x] Input Validation
- [x] Email Validation

### ✅ Email Services
- [x] OTP Email
- [x] Welcome Email
- [x] Password Change Notification

---

## 🔍 Testing Checklist

### Register API
```json
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "Test1234!",
  "fullName": "Test User",
  "phoneNumber": "0987654321"
}
```
✅ Should create user and return token

### Login API
```json
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "Test1234!"
}
```
✅ Should return token and user info

### Forgot Password API
```json
POST /api/auth/forgot-password
{
  "email": "test@example.com"
}
```
✅ Should send OTP email

### Reset Password API
```json
POST /api/auth/reset-password
{
  "email": "test@example.com",
  "otp": "123456",
  "newPassword": "NewTest1234!",
  "confirmPassword": "NewTest1234!"
}
```
✅ Should reset password and return token

### Verify Token API
```
GET /api/auth/verify-token
Header: Authorization: Bearer <token>
```
✅ Should validate token

---

## ⚠️ Important Notes

1. **JWT Secret Key**
   - Hiện tại: `OptiStockSecretKeyDungDeKyTokenJWTPhaiRatDaiVaBaoMat123456789!@#$%^&*()`
   - Production: Thay bằng key ngẫu nhiên 32+ ký tự

2. **Email Configuration**
   - **BẮT BUỘC** cấu hình Gmail App Password
   - Không thể dùng mật khẩu Gmail thường
   - Lưu ý: Có thể delay 1-2 phút email đến

3. **Passwords**
   - Minimum 6 ký tự
   - Recommend: Mix uppercase, lowercase, numbers, special chars

4. **OTP**
   - 6 chữ số ngẫu nhiên
   - Hết hạn sau 10 phút
   - Chỉ có thể dùng 1 lần

---

## 🚀 Next Steps

1. ✅ Test tất cả endpoints trong Postman
2. ✅ Thay đổi JWT Secret Key
3. ✅ Cấu hình email production
4. ✅ Integrate frontend (React)
5. ✅ Implement refresh token (optional)
6. ✅ Implement rate limiting (optional)

---

## 📞 Troubleshooting

**Q: Email không gửi được?**
- A: Check Gmail 2-Step Verification + App Password configuration

**Q: Token hết hạn?**
- A: Login lại hoặc implement Refresh Token

**Q: CORS Error?**
- A: Check CORS configuration in SecurityConfig

**Q: OTP hết hạn?**
- A: Ấn quên mật khẩu lại để tạo OTP mới

---

## 📖 Resources

- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io)

---

*Hệ thống Auth hoàn chỉnh và sẵn sàng sử dụng!* ✅
