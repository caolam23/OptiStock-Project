# 📋 OTP (One-Time Password) Flow - Complete File Guide

## 🏗️ Overall OTP Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                                                              │
│  ForgotPassword.jsx                                         │
│  ├─ Step 1: User enters email                              │
│  │  └─ Calls: authApi.forgotPassword(email)               │
│  │                                                          │
│  ├─ Step 2: User enters OTP + New Password                │
│  │  └─ Calls: authApi.resetPassword(data)                │
│  │                                                          │
│  └─ Uses: AuthContext.jsx (useAuth hook)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         ↓ API Calls ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                     │
│                                                              │
│  AuthController.java                                        │
│  ├─ @PostMapping("/forgot-password")                        │
│  │  └─ Calls: authService.sendOtpForPasswordReset()        │
│  │                                                          │
│  ├─ @PostMapping("/reset-password")                         │
│  │  └─ Calls: authService.resetPassword()                  │
│  │                                                          │
│  AuthService.java                                           │
│  ├─ sendOtpForPasswordReset()                              │
│  │  ├─ Find user by email                                  │
│  │  ├─ Generate OTP (6 digits)                            │
│  │  ├─ Save OTP + Expiry (10 mins) to DB                 │
│  │  └─ Call: emailService.sendOtpEmail()                 │
│  │                                                          │
│  ├─ resetPassword()                                         │
│  │  ├─ Find user by email                                  │
│  │  ├─ Validate OTP                                        │
│  │  ├─ Check OTP not expired                              │
│  │  ├─ Update password (BCrypt)                           │
│  │  ├─ Clear OTP from DB                                  │
│  │  └─ Return AuthResponse with token                     │
│  │                                                          │
│  EmailService.java                                          │
│  └─ sendOtpEmail()                                          │
│     └─ Send OTP via Gmail SMTP                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔙 BACKEND Files (3 chính)

### 1️⃣ **AuthController.java** (2 endpoints)

**File Path:** `backend/src/main/java/com/optistock/backend/controller/AuthController.java`

**Endpoint 1: Forgotten Password - STEP 1: Gửi OTP**
```java
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    try {
        authService.sendOtpForPasswordReset(request);  // Gửi OTP
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!");
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        // Error handling
    }
}
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!"
}
```

---

**Endpoint 2: Reset Password - STEP 2: Xác nhận OTP & Đổi Mật Khẩu**
```java
@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    try {
        AuthResponse response = authService.resetPassword(request);  // Reset mật khẩu
        response.setMessage("Mật khẩu đã được thay đổi thành công!");
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        // Error handling
    }
}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "email": "user@example.com",
  "fullName": "User Name",
  "roles": ["ROLE_USER"],
  "message": "Mật khẩu đã được thay đổi thành công!"
}
```

---

### 2️⃣ **AuthService.java** (2 main methods)

**File Path:** `backend/src/main/java/com/optistock/backend/service/AuthService.java`

**Method 1: Generate & Send OTP (Line 100-120)**
```java
public void sendOtpForPasswordReset(ForgotPasswordRequest request) {
    // 1. Tìm user
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UserNotFoundException("Email này không tồn tại!"));

    // 2. Tạo OTP (6 chữ số ngẫu nhiên)
    String otp = generateOtp();  // Returns: "123456"
    
    // 3. Tính thời gian hết hạn (10 phút từ bây giờ)
    LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

    // 4. Lưu OTP vào database
    user.setResetOtp(otp);
    user.setResetOtpExpiry(otpExpiry);
    userRepository.save(user);

    // 5. Gửi email chứa OTP
    emailService.sendOtpEmail(user.getEmail(), otp);
}
```

**What happens in DB:**
```
User Table:
- email: "user@example.com"
- resetOtp: "123456"
- resetOtpExpiry: "2026-02-09 10:25:00" (10 phút sau)
```

---

**Method 2: Verify OTP & Reset Password (Line 123-160)**
```java
public AuthResponse resetPassword(ResetPasswordRequest request) {
    // 1. Kiểm tra mật khẩu mới trùng khớp
    if (!request.getNewPassword().equals(request.getConfirmPassword())) {
        throw new IllegalArgumentException("Mật khẩu xác nhận không trùng khớp!");
    }

    // 2. Kiểm tra độ dài mật khẩu
    if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
        throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    // 3. Tìm user
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UserNotFoundException("Email này không tồn tại!"));

    // 4. Kiểm tra OTP chính xác
    if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
        throw new AuthException("INVALID_OTP", "Mã OTP không chính xác!");
    }

    // 5. Kiểm tra OTP không hết hạn
    if (user.getResetOtpExpiry() == null || LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
        throw new AuthException("OTP_EXPIRED", "Mã OTP đã hết hạn!");
    }

    // 6. Cập nhật mật khẩu (mã hóa BCrypt)
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    
    // 7. Xóa OTP khỏi DB (xóa sạch)
    user.setResetOtp(null);
    user.setResetOtpExpiry(null);
    user.setUpdatedAt(LocalDateTime.now());
    userRepository.save(user);

    // 8. Gửi email thông báo
    emailService.sendPasswordChangeEmail(user.getEmail(), user.getFullName());

    // 9. Return JWT token để auto-login
    return buildAuthResponse(user);
}
```

---

**Helper Method: Generate OTP (Line 167-171)**
```java
private String generateOtp() {
    Random random = new Random();
    int otp = 100000 + random.nextInt(900000);
    return String.valueOf(otp);  // Returns string like: "456789"
}
```

---

### 3️⃣ **EmailService.java** (sendOtpEmail method)

**File Path:** `backend/src/main/java/com/optistock/backend/service/EmailService.java`

```java
public void sendOtpEmail(String email, String otp) {
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);  // To: user@example.com
        message.setSubject("OptiStock - Mã OTP Reset Mật Khẩu");
        message.setText("Mã OTP của bạn là: " + otp + "\n\n" +
                "Mã này có hiệu lực trong 10 phút.\n" +
                "Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "---\n" +
                "Đây là email tự động, vui lòng không trả lời.");
        
        mailSender.send(message);  // Send via SMTP
        System.out.println("OTP email sent to: " + email);
    } catch (Exception e) {
        throw new RuntimeException("Failed to send OTP email", e);
    }
}
```

**Email Content Example:**
```
To: user@example.com
Subject: OptiStock - Mã OTP Reset Mật Khẩu

Mã OTP của bạn là: 456789

Mã này có hiệu lực trong 10 phút.
Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.

---
Đây là email tự động, vui lòng không trả lời.
```

---

## 🎨 FRONTEND Files (3 chính)

### 1️⃣ **ForgotPassword.jsx** (UI with 2 steps)

**File Path:** `frontend/src/pages/ForgotPassword/ForgotPassword.jsx`

**Structure:**
```jsx
const ForgotPassword = () => {
  const [step, setStep] = useState(0);  // 0 = Email, 1 = OTP
  
  // -------- STEP 1: GỬI OTP --------
  const onFinishStep1 = async (values) => {
    try {
      await sendOtp(values.email);  // Gọi API
      setEmail(values.email);
      setSuccessMessage(`OTP đã được gửi tới email ${values.email}...`);
      
      // Chuyển sang step 2 sau 2 giây
      setTimeout(() => {
        setStep(1);
        form.resetFields();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  // -------- STEP 2: RESET MẬT KHẨU --------
  const onFinishStep2 = async (values) => {
    try {
      // Kiểm tra mật khẩu khớp
      if (values.newPassword !== values.confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp!');
        return;
      }

      await resetPassword(
        email,
        values.otp,
        values.newPassword,
        values.confirmPassword
      );  // Gọi API

      setSuccessMessage('Mật khẩu đã được thay đổi! Đang chuyển hướng...');
      
      // Redirect sang Login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  return (
    <Card>
      <Steps current={step} items={[
        { title: 'Email' },
        { title: 'Xác nhận OTP' }
      ]} />

      {/* STEP 1: Email Form */}
      {step === 0 && (
        <Form onFinish={onFinishStep1}>
          <Form.Item name="email" rules={[...]}>
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Button htmlType="submit">Gửi OTP</Button>
        </Form>
      )}

      {/* STEP 2: OTP + Password Form */}
      {step === 1 && (
        <Form onFinish={onFinishStep2}>
          <Form.Item name="otp" rules={[...]}>
            <Input placeholder="6 chữ số OTP" />
          </Form.Item>
          <Form.Item name="newPassword" rules={[...]}>
            <Input.Password placeholder="Mật khẩu mới" />
          </Form.Item>
          <Form.Item name="confirmPassword" rules={[...]}>
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          <Button htmlType="submit">Reset Mật Khẩu</Button>
        </Form>
      )}
    </Card>
  );
};
```

---

### 2️⃣ **authApi.js** (API endpoints)

**File Path:** `frontend/src/api/authApi.js`

```javascript
const authApi = {
  /**
   * Gửi OTP cho reset mật khẩu
   * Calls Backend: POST /api/auth/forgot-password
   */
  forgotPassword: (email) => {
    return axiosClient.post(`${AUTH_URL}/forgot-password`, { email });
  },

  /**
   * Reset mật khẩu bằng OTP
   * Calls Backend: POST /api/auth/reset-password
   * ⚠️ ISSUE: Currently calls /auth/verify-otp but backend has /auth/reset-password
   */
  resetPassword: (data) => {
    return axiosClient.post(`${AUTH_URL}/reset-password`, data);
  },
};
```

---

### 3️⃣ **AuthContext.jsx** (State management)

**File Path:** `frontend/src/context/AuthContext.jsx`

```jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * 1. Gửi OTP email
   */
  const sendOtp = async (email) => {
    return await authApi.forgotPassword(email);
  };

  /**
   * 2. Reset mật khẩu bằng OTP
   */
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    return await authApi.resetPassword({
      email,
      otp,
      newPassword,
      confirmPassword,
    });
  };

  // Export để components sử dụng
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    sendOtp,           // ← Gửi OTP
    resetPassword,     // ← Reset mật khẩu
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
```

---

## 🔀 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: FORGOT PASSWORD (Gửi OTP)                     │
└─────────────────────────────────────────────────────────┘

User mengetik email → Frontend Form
                        ↓
                    authApi.forgotPassword(email)
                        ↓
                    POST /api/auth/forgot-password
                        ↓
                    AuthController.forgotPassword()
                        ↓
                    AuthService.sendOtpForPasswordReset()
                        ├─ 1. Find user by email
                        ├─ 2. Generate OTP (6 digits)
                        ├─ 3. Set expiry (10 minutes)
                        ├─ 4. Save to DB
                        └─ 5. Send email
                        ↓
                    EmailService.sendOtpEmail()
                        ↓
                    Gmail SMTP
                        ↓
                    Email arrives ✉️ "Mã OTP: 456789"


┌─────────────────────────────────────────────────────────┐
│  STEP 2: RESET PASSWORD (Verify OTP & Change Password) │
└─────────────────────────────────────────────────────────┘

User nhập:
- OTP: 456789
- New Password: NewPass123!
- Confirm: NewPass123!
        ↓
    Frontend Form
        ↓
    authApi.resetPassword({email, otp, newPassword, ...})
        ↓
    POST /api/auth/reset-password
        ↓
    AuthController.resetPassword()
        ↓
    AuthService.resetPassword()
        ├─ 1. Check password match
        ├─ 2. Check password length
        ├─ 3. Find user by email
        ├─ 4. Validate OTP matches
        ├─ 5. Check OTP not expired
        ├─ 6. Encode new password (BCrypt)
        ├─ 7. Clear OTP from DB
        ├─ 8. Save user
        └─ 9. Send confirmation email
        ↓
    Return JWT token
        ↓
    Frontend: Save token
        ↓
    Redirect to Login ← Auto-login with new password
```

---

## 📊 Database Changes During OTP Process

```
STEP 1: After sending OTP
┌─────────────────────┬───────────────────────┬──────────────────────┐
│ Field               │ Before                │ After                │
├─────────────────────┼───────────────────────┼──────────────────────┤
│ email               │ user@example.com      │ user@example.com     │
│ password            │ $2a$10$hashedpass...  │ $2a$10$hashedpass... │
│ resetOtp            │ null                  │ "456789"             │
│ resetOtpExpiry      │ null                  │ 2026-02-09 10:25:00  │
│ updatedAt           │ 2026-02-09 10:00:00   │ 2026-02-09 10:15:00  │
└─────────────────────┴───────────────────────┴──────────────────────┘

STEP 2: After resetting password
┌─────────────────────┬───────────────────────┬──────────────────────┐
│ Field               │ Before                │ After                │
├─────────────────────┼───────────────────────┼──────────────────────┤
│ email               │ user@example.com      │ user@example.com     │
│ password            │ $2a$10$oldpassword... │ $2a$10$newpassword..│
│ resetOtp            │ "456789"              │ null                 │
│ resetOtpExpiry      │ 2026-02-09 10:25:00   │ null                 │
│ updatedAt           │ 2026-02-09 10:15:00   │ 2026-02-09 10:16:00  │
└─────────────────────┴───────────────────────┴──────────────────────┘
```

---

## ✅ Complete File Checklist

### Backend Files
- [x] `AuthController.java` - Lines 67-95 (forgot-password & reset-password endpoints)
- [x] `AuthService.java` - Lines 100-170 (sendOtpForPasswordReset & resetPassword)
- [x] `EmailService.java` - Lines 16-30 (sendOtpEmail method)
- [x] `User.java` - Has resetOtp & resetOtpExpiry fields
- [x] `UserRepository.java` - Has findByEmail()
- [x] `ResetPasswordRequest.java` - Contains: email, otp, newPassword, confirmPassword
- [x] `ForgotPasswordRequest.java` - Contains: email

### Frontend Files
- [x] `ForgotPassword.jsx` - Lines 1-311 (2-step OTP form)
- [x] `authApi.js` - Lines 34-44 (forgotPassword & resetPassword API calls)
- [x] `AuthContext.jsx` - Lines 95-112 (sendOtp & resetPassword hooks)

---

## 🔗 API Endpoint Mapping

| Frontend Call | API Method | Backend Controller | Backend Service |
|---------------|------------|-------------------|-----------------|
| `authApi.forgotPassword(email)` | POST | `/auth/forgot-password` | `sendOtpForPasswordReset()` |
| `authApi.resetPassword(data)` | POST | `/auth/reset-password` | `resetPassword()` |

---

## 📝 Notes

1. **OTP Length:** 6 digits (100000-999999)
2. **OTP Expiry:** 10 minutes from generation
3. **Email Service:** Gmail SMTP
4. **Password Hashing:** BCrypt with 10 rounds
5. **JWT Token:** Generated after successful password reset
6. **Auto-login:** User can login immediately after password reset

---

*OTP Authentication Complete Flow Documentation* ✅
