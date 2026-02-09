# Authentication & Authorization System - Hướng Dẫn Sử Dụng

## 📋 Mô tả Chung

Hệ thống Authentication & Authorization hoàn chỉnh với:
- ✅ **Đăng ký (Register)** - Tạo tài khoản mới
- ✅ **Đăng nhập (Login)** - Xác thực bằng email/password
- ✅ **Quên mật khẩu (Forgot Password)** - Gửi OTP qua email
- ✅ **Reset mật khẩu (Reset Password)** - Thay đổi mật khẩu bằng OTP
- ✅ **JWT Token** - Xác thực các request tiếp theo
- ✅ **Google SSO** - Đăng nhập bằng Google
- ✅ **Global Exception Handler** - Xử lý lỗi tập trung

---

## 🔧 CẤU HÌNH BẮT BUỘC

### 1️⃣ Cấu Hình Email (Gmail SMTP)

Để gửi OTP qua email, bạn phải:

**Bước 1:** Mở https://myaccount.google.com/security

**Bước 2:** Bật **2-Step Verification** (nếu chưa bật)

**Bước 3:** Vào https://myaccount.google.com/apppasswords

**Bước 4:** Tạo **App Password** cho "Mail" và "Windows Computer"

**Bước 5:** Copy App Password và dán vào `application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=vào dây app-password (16 ký tự, không có space)
```

### 2️⃣ Database MongoDB

Đảm bảo MongoDB chạy trên:
```
mongodb://localhost:27017/optistock_db
```

### 3️⃣ JWT Secret Key

Thay đổi `jwtSecret` từ `application.properties` bằng chuỗi ngẫu nhiên:

```properties
# Ví dụ sinh key: openssl rand -base64 32
optistock.app.jwtSecret=YOUR_RANDOM_LONG_SECRET_KEY_HERE_MIN_32_CHARS
```

---

## 📡 REST API Endpoints

### 1️⃣ **REGISTER - Đăng ký tài khoản mới**

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789",
  "roles": ["ROLE_USER"],
  "message": "Đăng ký thành công!"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email này đã được đăng ký!"
}
```

---

### 2️⃣ **LOGIN - Đăng nhập**

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789",
  "roles": ["ROLE_USER"],
  "message": "Đăng nhập thành công!"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng!"
}
```

---

### 3️⃣ **FORGOT PASSWORD - Gửi OTP**

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!"
}
```

**Response:**
- Email nhận được OTP 6 chữ số
- OTP hết hạn trong 10 phút
- Lưu OTP để dùng cho step tiếp theo

---

### 4️⃣ **RESET PASSWORD - Đổi mật khẩu**

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "roles": ["ROLE_USER"],
  "message": "Mật khẩu đã được thay đổi thành công!"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Mã OTP không chính xác!"
}
```

---

### 5️⃣ **VERIFY TOKEN - Kiểm tra token hợp lệ**

**Endpoint:** `GET /api/auth/verify-token`

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "email": "user@example.com"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Token is invalid"
}
```

---

### 6️⃣ **GOOGLE LOGIN - Đăng nhập Google**

**Endpoint:** `POST /api/auth/google-login`

**Request Body:**
```json
{
  "token": "google-id-token-from-frontend"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@gmail.com",
  "fullName": "Google User",
  "roles": ["ROLE_USER"],
  "message": "Google login successful"
}
```

---

## 🔐 Cách Sử Dụng JWT Token

### Sau khi đăng nhập thành công:

1. **Lưu token từ response:**
```javascript
const token = response.token;
localStorage.setItem('token', token);
```

2. **Gửi token trong mỗi request tới API bảo vệ:**
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/api/protected-endpoint', {
  headers: headers
});
```

3. **Khi token hết hạn:**
- User sẽ nhận lỗi 401
- Redirect sang trang Login
- Clear localStorage
```javascript
localStorage.removeItem('token');
```

---

## 📂 Cấu Trúc Thư Mục Tạo Ra

```
backend/src/main/java/com/optistock/backend/
├── controller/
│   └── AuthController.java          ← Xử lý HTTP requests
├── service/
│   ├── AuthService.java             ← Business logic Auth
│   └── EmailService.java            ← Gửi email
├── dto/
│   ├── AuthRequest.java
│   ├── AuthResponse.java
│   ├── ForgotPasswordRequest.java
│   └── ResetPasswordRequest.java
├── exception/
│   ├── AuthException.java
│   ├── UserNotFoundException.java
│   └── GlobalExceptionHandler.java   ← Xử lý lỗi tập trung
├── security/
│   └── JwtAuthenticationFilter.java  ← Kiểm tra JWT
├── util/
│   └── JwtUtils.java                ← Tạo & validate JWT
├── model/
│   └── User.java                    ← Có thêm OTP fields
├── config/
│   └── SecurityConfig.java          ← Cấu hình Security + JWT Filter
└── repository/
    └── UserRepository.java
```

---

## 🛡️ Security Features

### ✅ Bảo Mật Mật Khẩu
- Mã hóa: **BCryptPasswordEncoder**
- Độ mạnh: 10 rounds

### ✅ JWT Token
- Algorithm: **HS256**
- Expiry: **24 hours**
- Signing Key: **Configurable secret**

### ✅ OTP
- Độ dài: **6 chữ số**
- Thời gian hết hạn: **10 phút**
- Được lưu trong database

### ✅ CORS
- Chỉ cho phép: `http://localhost:5173`
- Methods: GET, POST, PUT, DELETE

### ✅ Exception Handling
- Tất cả lỗi được xử lý tập trung
- Response format thống nhất

---

## 🚀 Hướng Dẫn Test

### 1️⃣ Test Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "fullName": "Test User",
    "phoneNumber": "0987654321"
  }'
```

### 2️⃣ Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 3️⃣ Test Forgot Password

```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 4️⃣ Test Reset Password

```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "newPassword": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }'
```

### 5️⃣ Test Verify Token

```bash
curl -X GET http://localhost:8080/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 Troubleshooting

### ❌ Email không được gửi

**Lý do:** Gmail App Password chưa cấu hình đúng

**Giải pháp:**
1. Bật 2-Step Verification trên Google Account
2. Tạo App Password mới
3. Copy-paste chính xác vào `application.properties`
4. Không có space ở đầu/cuối

### ❌ OTP hết hạn

**Lý do:** Quá 10 phút không nhập

**Giải pháp:** Ấn "Quên mật khẩu" lại để tạo OTP mới

### ❌ Token hết hạn

**Lý do:** Token chỉ có hiệu lực 24 hours

**Giải pháp:** Đăng nhập lại để lấy token mới

### ❌ CORS Error

**Lý do:** Frontend URL không khớp

**Giải pháp:** Check `application.properties` - `http://localhost:5173`

---

## 📝 Lưu Ý Quan Trọng

⚠️ **Trước khi deploy lên Production:**

1. ✅ Thay đổi JWT Secret Key
2. ✅ Thay đổi email credentials
3. ✅ Cấu hình CORS cho domain thật
4. ✅ Bật HTTPS
5. ✅ Cấu hình Database credentials
6. ✅ Bật logging
7. ✅ Test security

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
- Console logs backend
- Network tab trong browser
- MongoDB connection
- Email configuration

---

*Hệ thống Auth hoàn chỉnh - 2026*
