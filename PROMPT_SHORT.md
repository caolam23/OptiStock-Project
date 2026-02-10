# ⚡ SHORT PROMPT FOR GEMINI (COPY-PASTE VERSION)

---

## 🎯 BRIEF REQUEST

I have an OptiStock project (Spring Boot backend + React frontend) that needs Authentication & Authorization implementation.

**Current State:**
- Backend: Spring Boot 3.2.2, Java 17, MongoDB, has empty config/dto/service/util folders, has TestController.java
- Frontend: React 19, Vite, has empty pages/routes folders
- Need to DELETE: TestController.java (test only, not needed)
- Keep: Product.java, ProductRepository.java, axiosClient.js structure

---

## 📝 REQUIREMENTS

Implement 6 Authentication Features:

1. **User Registration**
   - Email validation (unique), password encryption (BCrypt), welcome email
   - Return JWT access token (1h) + refresh token (7d)
   - Assign ROLE_USER by default

2. **User Login**
   - Email+Password authentication, JWT token generation
   - "Remember me" checkbox, track last login

3. **Forgot Password (OTP Email)**
   - Generate 6-digit OTP, send via Gmail SMTP
   - OTP valid for 15 minutes
   - Verify OTP + reset password
   - Send email using JavaMailSender

4. **Google SSO Login**
   - Decode Google JWT token, auto-create user from Google profile
   - If user exists with googleId: just update lastLoginAt
   - Return JWT tokens same as regular auth

5. **Protected Routes**
   - Frontend: Auto-add JWT token to API requests, handle 401
   - Frontend: Guard routes (redirect /login if no token)
   - Backend: Validate JWT before allowing access

6. **Token Refresh**
   - Use refresh token to get new access token

---

## 📦 BACKEND SETUP

**Add to pom.xml dependencies:**
- JWT: jjwt-api, jjwt-impl, jjwt-jackson (0.12.3)
- Spring Security: spring-boot-starter-security
- OAuth2: spring-boot-starter-oauth2-client
- Email: spring-boot-starter-mail, spring-boot-starter-thymeleaf

**Update application.properties:**
```properties
jwt.secret=YOUR-256-BIT-KEY-HERE
jwt.expiration=3600000
jwt.refresh-expiration=604800000
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Create Backend Files:**

**Models:**
- `User.java` - @Document(collection="users"), fields: email(unique), password, fullName, phoneNumber, otpCode, otpExpiredAt, googleId, googleEmail, avatar, enabled, roles, refreshToken, createdAt, lastLoginAt

**Repository:**
- `UserRepository.java` - findByEmail(), findByGoogleId(), existsByEmail()

**DTOs (6 files):**
- LoginRequest: email, password
- RegisterRequest: email, password, confirmPassword, fullName, phoneNumber
- AuthResponse: accessToken, refreshToken, email, fullName, message, success
- ForgotPasswordRequest: email
- VerifyOtpRequest: email, otpCode, newPassword, confirmPassword
- GoogleLoginRequest: googleId, email, fullName, avatar

**Services:**
- `JwtUtil.java` - generateToken(), generateRefreshToken(), getEmailFromToken(), validateToken()
- `EmailService.java` - generateOtpCode(), sendOtpEmail(), sendWelcomeEmail()
- `AuthService.java` - register(), login(), forgotPassword(), verifyOtpAndResetPassword(), refreshAccessToken(), loginWithGoogle()

**Controller:**
- `AuthController.java` - 6 POST endpoints: /register, /login, /forgot-password, /verify-otp, /refresh-token, /google-login

**Config:**
- `SecurityConfig.java` - PasswordEncoder bean (BCryptPasswordEncoder), CORS configuration

---

## 📱 FRONTEND SETUP

**Add to package.json:**
```json
"react-router-dom": "^6.20.0",
"@react-oauth/google": "^0.12.1",
"jwt-decode": "^4.0.0"
```

**Create Frontend Files:**

**Pages (6 files):**
- `Login.jsx` - Email, password, remember me, Google button, register link
- `Login.css` - Gradient background, centered card
- `Register.jsx` - Full name, email, phone, password, confirm password
- `ForgotPassword.jsx` - 3-step flow: email → OTP → reset password
- `Dashboard.jsx` - Protected, header with logout, sidebar menu
- `Product.jsx` - Protected, product table placeholder

**API:**
- `authApi.js` - 6 functions: registerUser(), loginUser(), forgotPassword(), verifyOtpAndResetPassword(), refreshToken(), loginWithGoogle()
- Update `axiosClient.js` - Add request interceptor (auto JWT token), response interceptor (handle 401)

**Routing:**
- `AppRouter.jsx` - BrowserRouter, protected routes, redirect logic

**Core:**
- Update `App.jsx` - Wrap with GoogleOAuthProvider
- Update `package.json` - Add dependencies

---

## 🎯 DELETE

Remove `backend/src/main/java/com/optistock/backend/controller/TestController.java`

---

## ✅ IMPLEMENTATION CHECKLIST

**Backend (9 files to create):**
- [ ] User.java
- [ ] UserRepository.java
- [ ] LoginRequest.java
- [ ] RegisterRequest.java
- [ ] AuthResponse.java
- [ ] ForgotPasswordRequest.java
- [ ] VerifyOtpRequest.java
- [ ] GoogleLoginRequest.java
- [ ] JwtUtil.java
- [ ] EmailService.java
- [ ] AuthService.java
- [ ] AuthController.java
- [ ] SecurityConfig.java
- [ ] Update pom.xml
- [ ] Update application.properties
- [ ] Delete TestController.java

**Frontend (9 files to create/update):**
- [ ] Login.jsx + Login.css
- [ ] Register.jsx
- [ ] ForgotPassword.jsx
- [ ] Dashboard.jsx
- [ ] Product.jsx
- [ ] authApi.js
- [ ] Update axiosClient.js
- [ ] AppRouter.jsx
- [ ] Update App.jsx
- [ ] Update package.json

---

## 🧪 TEST FLOWS

1. **Register** - Create new user → Get JWT → Redirect /dashboard
2. **Login** - Email+password → Get JWT → Redirect /dashboard
3. **Forgot Password** - Email → Receive OTP → Enter OTP+new password → Success
4. **Google Login** - Click button → Google popup → Auto login → Redirect /dashboard
5. **Protected Route** - Logout → Try access /dashboard → Redirect /login
6. **Token Auto-add** - Check API calls have Authorization header with JWT

---

## 📞 CONFIGURATION USER MUST DO

1. Gmail app password - https://myaccount.google.com/apppasswords
2. Google OAuth Client ID - https://console.cloud.google.com
3. MongoDB running on localhost:27017
4. JWT secret key (update in application.properties)

---

## 🚀 READY!

**Total files:** 22+ files to create/modify
**Difficulty:** Intermediate
**Estimated time:** 3-4 hours

---

👉 **USE THIS PROMPT FOR GEMINI TO CODE THE ENTIRE IMPLEMENTATION**
