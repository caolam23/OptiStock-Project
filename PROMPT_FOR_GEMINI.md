# 🎯 PROMPT CHO GEMINI - Authentication & Authorization Implementation

## 📌 TÓMSÁT DỰ ÁN HIỆN TẠI

**Project Name:** OptiStock - Quản Lý Kho Hàng  
**Tech Stack:**
- Backend: Spring Boot 3.2.2, Java 17, MongoDB, Lombok
- Frontend: React 19.2.0, Vite, Axios, Ant Design 5.0

**Current Structure:**
```
backend/
├── src/main/java/com/optistock/backend/
│   ├── config/          (empty - needs files)
│   ├── controller/      (has TestController.java - NEED TO REMOVE)
│   ├── dto/             (empty - needs files)
│   ├── model/           (has Product.java - KEEP IT)
│   ├── repository/      (has ProductRepository.java - KEEP IT)
│   ├── service/         (empty - needs files)
│   ├── util/            (empty - needs files)
│   └── OptistockBackendApplication.java (KEEP)
├── resources/
│   └── application.properties (NEED TO UPDATE)
└── pom.xml (NEED TO ADD DEPENDENCIES)

frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard/    (empty - needs Dashboard.jsx)
│   │   ├── Login/        (empty - needs Login.jsx + Login.css)
│   │   ├── Register/     (empty - needs Register.jsx)
│   │   ├── ForgotPassword/ (empty - needs ForgotPassword.jsx)
│   │   └── Product/      (empty - needs Product.jsx)
│   ├── routes/
│   │   └── AppRouter.jsx (empty - needs routing config)
│   ├── api/
│   │   ├── axiosClient.js (NEED TO UPDATE)
│   │   └── productApi.js (KEEP)
│   ├── App.jsx           (NEED TO UPDATE)
│   └── package.json      (NEED TO UPDATE)
```

---

## 🛑 FILES TO DELETE (NOT NEEDED FOR AUTH)

**Remove these files (Test connection only):**
- `backend/src/main/java/com/optistock/backend/controller/TestController.java` ❌ DELETE

**Keep all other files** - they are needed

---

## ✅ IMPLEMENTATION REQUIREMENTS

### FEATURE 1: USER REGISTRATION
- Email validation (unique)
- Password encryption (BCrypt)
- Password confirmation matching
- Full name + Phone number required
- Send welcome email
- Return JWT access token + refresh token
- Auto assign ROLE_USER

### FEATURE 2: USER LOGIN
- Email + Password authentication
- JWT access token generation (1 hour expiration)
- Refresh token generation (7 days expiration)
- "Remember me" checkbox functionality
- Track last login timestamp

### FEATURE 3: FORGOT PASSWORD (OTP EMAIL)
- User requests password reset by email
- System generates 6-digit OTP code
- Send OTP via email (15 minute expiration)
- User enters OTP + new password
- Verify OTP (check code + expiration)
- Hash new password + save to database
- Clear OTP data after successful reset

### FEATURE 4: GOOGLE SSO LOGIN
- User clicks "Login with Google" button
- Decode JWT token from Google
- Check if googleId exists in database
  - If YES: Update lastLoginAt + return JWT
  - If NO: Auto-create user from Google profile (email, name, avatar)
- Return JWT access token + refresh token

### FEATURE 5: PROTECTED ROUTES
- Frontend: Redirect unauthenticated users to /login
- Frontend: Auto-add JWT token to all API requests via interceptor
- Frontend: Handle 401 unauthorized response (token expired)
- Backend: Extract JWT token from Authorization header
- Backend: Return 401 if token invalid/expired

### FEATURE 6: TOKEN REFRESH
- Frontend can use RefreshToken to get new AccessToken
- Automatic refresh before token expires (optional)

---

## 📦 BACKEND DEPENDENCIES TO ADD (pom.xml)

**Add these dependencies in `<dependencies>` section:**

```xml
<!-- JWT Token (JJWT) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- OAuth2 Client (for Google) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>

<!-- Email Service -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Thymeleaf for Email Templates -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

---

## 📝 BACKEND FILES TO CREATE

### 1. MODEL: `backend/src/main/java/com/optistock/backend/model/User.java`

**Fields:**
- `_id` (ObjectId)
- `email` (String, unique, indexed)
- `password` (String, hashed/encrypted)
- `fullName` (String)
- `phoneNumber` (String)
- `enabled` (Boolean, default: true)
- `roles` (Set<String>, default: ["ROLE_USER"])
- `createdAt` (LocalDateTime)
- `updatedAt` (LocalDateTime)
- `lastLoginAt` (LocalDateTime)

**OTP Fields:**
- `otpCode` (String)
- `otpExpiredAt` (LocalDateTime)

**Google SSO Fields:**
- `googleId` (String)
- `googleEmail` (String)
- `avatar` (String)

**Token Fields:**
- `refreshToken` (String)
- `refreshTokenExpiredAt` (LocalDateTime)

**Other Fields:**
- `department` (String optional)

**Annotations:** @Document(collection = "users"), @Data, @NoArgsConstructor, @AllArgsConstructor (use Lombok)

---

### 2. REPOSITORY: `backend/src/main/java/com/optistock/backend/repository/UserRepository.java`

**Methods:**
- `Optional<User> findByEmail(String email)`
- `Optional<User> findByGoogleId(String googleId)`
- `boolean existsByEmail(String email)`

---

### 3. DTOs: Create following files in `backend/src/main/java/com/optistock/backend/dto/`

**LoginRequest.java**
- `email` (String)
- `password` (String)

**RegisterRequest.java**
- `email` (String)
- `password` (String)
- `confirmPassword` (String)
- `fullName` (String)
- `phoneNumber` (String)

**AuthResponse.java**
- `accessToken` (String)
- `refreshToken` (String)
- `email` (String)
- `fullName` (String)
- `message` (String)
- `success` (Boolean)

**ForgotPasswordRequest.java**
- `email` (String)

**VerifyOtpRequest.java**
- `email` (String)
- `otpCode` (String)
- `newPassword` (String)
- `confirmPassword` (String)

**GoogleLoginRequest.java**
- `googleId` (String)
- `email` (String)
- `fullName` (String)
- `avatar` (String)

---

### 4. UTILITY: `backend/src/main/java/com/optistock/backend/util/JwtUtil.java`

**Methods:**
- `String generateToken(String email)` - Create JWT with 1 hour expiration
- `String generateRefreshToken(String email)` - Create JWT with 7 days expiration
- `String getEmailFromToken(String token)` - Extract email from token
- `boolean validateToken(String token)` - Check if token is valid/not expired

**Use JJWT library (Jwts.builder())**

---

### 5. EMAIL SERVICE: `backend/src/main/java/com/optistock/backend/service/EmailService.java`

**Methods:**
- `String generateOtpCode()` - Generate 6-digit random OTP
- `void sendOtpEmail(String email, String otpCode)` - Send OTP via Gmail SMTP
- `void sendWelcomeEmail(String email, String fullName)` - Send welcome email on registration
- `void sendPasswordResetEmail(String email, String resetLink)` - Optional

**Use JavaMailSender**

---

### 6. AUTH SERVICE: `backend/src/main/java/com/optistock/backend/service/AuthService.java`

**Methods:**

1. `AuthResponse register(RegisterRequest request)`
   - Validate email not exists
   - Validate passwords match
   - Encrypt password with BCrypt
   - Save user to MongoDB
   - Send welcome email
   - Generate JWT tokens
   - Return AuthResponse

2. `AuthResponse login(LoginRequest request)`
   - Find user by email
   - Compare password with BCrypt
   - Update lastLoginAt
   - Generate JWT tokens
   - Return AuthResponse

3. `AuthResponse forgotPassword(ForgotPasswordRequest request)`
   - Find user by email
   - Generate OTP code
   - Set otpExpiredAt = now + 15 minutes
   - Save to database
   - Send OTP via email
   - Return AuthResponse

4. `AuthResponse verifyOtpAndResetPassword(VerifyOtpRequest request)`
   - Find user by email
   - Validate OTP code (match + not expired)
   - Validate passwords match
   - Encrypt new password
   - Save to database
   - Clear OTP fields
   - Return AuthResponse

5. `AuthResponse refreshAccessToken(String refreshToken)`
   - Validate refresh token
   - Extract email from token
   - Generate new access token
   - Return AuthResponse

6. `AuthResponse loginWithGoogle(String googleId, String email, String fullName, String avatar)`
   - Try find user by googleId
   - If found: Update lastLoginAt, save
   - If not found: Create new user with googleId, email, fullName, avatar, set ROLE_USER
   - Generate JWT tokens
   - Return AuthResponse

---

### 7. CONTROLLER: `backend/src/main/java/com/optistock/backend/controller/AuthController.java`

**Endpoints (all are POST):**

1. `POST /api/v1/auth/register`
   - Input: RegisterRequest
   - Output: AuthResponse
   - Validation: email not empty, password >= 6 chars

2. `POST /api/v1/auth/login`
   - Input: LoginRequest
   - Output: AuthResponse

3. `POST /api/v1/auth/forgot-password`
   - Input: ForgotPasswordRequest
   - Output: AuthResponse

4. `POST /api/v1/auth/verify-otp`
   - Input: VerifyOtpRequest
   - Output: AuthResponse

5. `POST /api/v1/auth/refresh-token`
   - Input: JSON with `refreshToken` field
   - Output: AuthResponse

6. `POST /api/v1/auth/google-login`
   - Input: GoogleLoginRequest
   - Output: AuthResponse

**CORS:** `@CrossOrigin(origins = "http://localhost:5173")`

---

### 8. SECURITY CONFIG: `backend/src/main/java/com/optistock/backend/config/SecurityConfig.java`

**Beans:**
- `PasswordEncoder passwordEncoder()` - Return `new BCryptPasswordEncoder()`
- `CorsConfigurationSource corsConfigurationSource()` - Allow http://localhost:5173

---

### 9. UPDATE: `backend/src/main/resources/application.properties`

**Add these properties:**

```properties
# JWT Configuration
jwt.secret=your-secret-key-min-256-bits-please-change-in-production
jwt.expiration=3600000
jwt.refresh-expiration=604800000

# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

---

## 📱 FRONTEND FILES TO CREATE/UPDATE

### 1. API SERVICE: `frontend/src/api/authApi.js`

**Functions (export all):**
```javascript
export const registerUser = (data) => /* POST /auth/register */
export const loginUser = (email, password) => /* POST /auth/login */
export const forgotPassword = (email) => /* POST /auth/forgot-password */
export const verifyOtpAndResetPassword = (email, otpCode, newPassword, confirmPassword) => /* POST /auth/verify-otp */
export const refreshToken = (refreshToken) => /* POST /auth/refresh-token */
export const loginWithGoogle = (googleId, email, fullName, avatar) => /* POST /auth/google-login */
```

Use `axiosClient` for all calls

---

### 2. AXIOS CLIENT: `frontend/src/api/axiosClient.js`

**Updates:**

**Request Interceptor:** Auto-add JWT token from localStorage
```javascript
if (localStorage has 'accessToken') {
    config.headers.Authorization = `Bearer ${accessToken}`
}
```

**Response Interceptor:**
- If 401 Unauthorized: Clear tokens, redirect to /login
- Handle error responses

---

### 3. LOGIN PAGE: `frontend/src/pages/Login/Login.jsx`

**Features:**
- Email input field
- Password input field
- "Remember me" checkbox
- "Forgot password?" link
- "Sign up" link
- Login button (with loading state)
- Google Login button (using @react-oauth/google)
- Error alert display
- Form validation

**On Success:** Save tokens to localStorage, redirect /dashboard
**On Google Success:** Decode JWT, call loginWithGoogle API

---

### 4. LOGIN STYLES: `frontend/src/pages/Login/Login.css`

**Styling:**
- Center container
- Gradient background
- Card with shadow
- Smooth animations

---

### 5. REGISTER PAGE: `frontend/src/pages/Register/Register.jsx`

**Fields:**
- Full name (required)
- Email (required, email validation)
- Phone number (required, 10-11 digits)
- Password (required, min 6 chars)
- Confirm password (required, must match)

**Features:**
- Form validation
- Success message
- Link to login page
- Loading state

**On Success:** Save tokens, redirect /dashboard

---

### 6. FORGOT PASSWORD PAGE: `frontend/src/pages/ForgotPassword/ForgotPassword.jsx`

**3-Step Flow:**

**Step 1:** Email input + "Send OTP" button
- Input: Email
- On success: Go to step 2

**Step 2:** OTP + New password
- Input: OTP code (6 digits), New password, Confirm password
- On success: Go to step 3

**Step 3:** Success message
- Message: "Password reset successful, redirecting to login..."
- Auto redirect /login after 2 seconds

**Use Ant Design Steps component for visual progress**

---

### 7. DASHBOARD PAGE: `frontend/src/pages/Dashboard/Dashboard.jsx`

**Features:**
- Protected route (redirect /login if no token)
- Header with user name + dropdown logout
- Sidebar menu (Dashboard, Products, Reports, Settings)
- Main content area
- Logout button

**On Logout:** Clear localStorage tokens, redirect /login

---

### 8. PRODUCT PAGE: `frontend/src/pages/Product/Product.jsx`

**Features:**
- Protected route
- Layout same as Dashboard
- Product table (empty for now)
- Can be filled later

---

### 9. ROUTING: `frontend/src/routes/AppRouter.jsx`

**Setup:**
- Use BrowserRouter
- Routes:
  - `/login` → Login page (public)
  - `/register` → Register page (public)
  - `/forgot-password` → ForgotPassword page (public)
  - `/dashboard` → Dashboard page (protected)
  - `/products` → Product page (protected)
  - Default: redirect to `/login` if not authenticated

**Protected Route Component:** Check localStorage accessToken
- If exists: Show component
- If not: Redirect /login

---

### 10. APP.JSX: `frontend/src/App.jsx`

```jsx
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <AppRouter />
</GoogleOAuthProvider>
```

Replace `YOUR_GOOGLE_CLIENT_ID` with actual Google OAuth Client ID

---

### 11. PACKAGE.JSON: `frontend/package.json`

**Add these dependencies:**
```json
"react-router-dom": "^6.20.0",
"@react-oauth/google": "^0.12.1",
"jwt-decode": "^4.0.0"
```

---

## 🧪 TESTING INSTRUCTIONS

### Backend Test:
```bash
1. Start MongoDB: mongosh
2. Build backend: mvn clean install
3. Run backend: mvn spring-boot:run
4. Check: http://localhost:8080/api/v1/test (if exists)
5. Or use Postman to test /auth/register endpoint
```

### Frontend Test:
```bash
1. npm install (install new dependencies)
2. npm run dev
3. Go to http://localhost:5173/login
4. Try all flows:
   - Register → Login → Dashboard
   - Forgot Password → OTP → Reset
   - Google Login
   - Protected routes (logout then access /dashboard)
```

---

## ⚙️ CONFIGURATION SETUP (User to do)

**User needs to configure:**

1. **Gmail App Password:**
   - Go: https://myaccount.google.com/apppasswords
   - Generate app password
   - Add to `application.properties` under `spring.mail.password`

2. **Google OAuth Client ID:**
   - Go: https://console.cloud.google.com
   - Create OAuth 2.0 Client ID
   - Replace in `App.jsx` GoogleOAuthProvider

3. **JWT Secret Key:**
   - Change `jwt.secret` in `application.properties` to random 256-bit key

4. **MongoDB:**
   - Ensure MongoDB running on localhost:27017
   - Or update connection string in `application.properties`

---

## 🎯 SUMMARY OF WORK NEEDED

**Backend:** 9 files (1 Model, 1 Repo, 6 DTOs, 1 Util, 1 Service, 1 Email Service, 1 Auth Service, 1 Controller, 1 Security Config)
**Frontend:** 9 files (1 Login, 1 Register, 1 ForgotPassword, 1 Dashboard, 1 Product, 1 AppRouter, 1 authApi, 1 updated axiosClient, updated App.jsx)
**Config:** Update pom.xml, application.properties, package.json
**Delete:** TestController.java (test only)

**Total Implementation Time:** ~3-4 hours
**Difficulty Level:** Intermediate (JWT, OAuth2, Email)

---

## ✅ COMPLETION CHECKLIST

- [ ] Add all pom.xml dependencies
- [ ] Create all Backend DTOs (6 files)
- [ ] Create User Model + UserRepository
- [ ] Create JwtUtil utility
- [ ] Create EmailService
- [ ] Create AuthService with 6 methods
- [ ] Create AuthController with 6 endpoints
- [ ] Create SecurityConfig
- [ ] Update application.properties with JWT + Email config
- [ ] Delete TestController.java
- [ ] Create authApi.js (6 functions)
- [ ] Update axiosClient.js with interceptors
- [ ] Create Login page + CSS
- [ ] Create Register page
- [ ] Create ForgotPassword page (3-step)
- [ ] Create Dashboard page
- [ ] Create Product page
- [ ] Create AppRouter.jsx with protected routes
- [ ] Update App.jsx with Google OAuth provider
- [ ] Update package.json with new dependencies
- [ ] Test all 6 features end-to-end

---

## 🚀 READY FOR IMPLEMENTATION!

This prompt contains all specifications needed for AI Gemini to implement complete Authentication & Authorization system.

**File this as reference and provide to Gemini for coding.**
