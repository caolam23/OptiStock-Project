# OptiStock - Full Stack Authentication System Launch Guide

## 🎯 Quick Start (10 minutes)

### Prerequisites Checklist
- ✅ Node.js installed
- ✅ MongoDB running locally
- ✅ Gmail account with App Password created
- ✅ Both backend & frontend code ready

---

## 🚀 Step 1: Start Backend (Terminal 1)

```bash
cd OptiStock-Project/backend

# Option A: Run with Maven
./mvnw.cmd spring-boot:run

# Option B: Or build and run
./mvnw.cmd clean compile
./mvnw.cmd spring-boot:run
```

**Expected Output:**
```
Started OptistockBackendApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

**Verify Backend:**
```bash
curl http://localhost:8080/api/auth/login
# Should return a JSON error (not HTML 404)
```

---

## 🎨 Step 2: Start Frontend (Terminal 2)

```bash
cd OptiStock-Project/frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
  VITE v7.2.4  ready in XXX ms

  ➜  Local: http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ Step 3: Test the System

Open browser: `http://localhost:5173`

### 3.1 Register New Account

**URL:** `http://localhost:5173/register`

**Complete Form:**
```
Họ và Tên: Test User
Email: test@example.com
Số điện thoại: 0987654321
Mật khẩu: Test1234!
Xác nhận: Test1234!
```

**Expected Result:**
- ✅ Account created
- ✅ Auto-logged in
- ✅ Redirected to Dashboard

---

### 3.2 Login Page Test

**URL:** `http://localhost:5173/login`

**Input:**
```
Email: test@example.com
Mật khẩu: Test1234!
```

**Expected Result:**
- ✅ Login successful
- ✅ Token saved in localStorage
- ✅ Redirected to Dashboard
- ✅ See user name in header

---

### 3.3 Dashboard Test

**Expected Elements:**
- 👋 Welcome message with user name
- 📧 Email display
- 👤 User avatar in header
- 🔓 Logout button

**Test Logout:**
1. Click avatar in top right
2. Click "Logout"
3. Should redirect to Login page
4. Try accessing `/dashboard` - should redirect to Login

---

### 3.4 Forgot Password Test

**URL:** `http://localhost:5173/forgot-password`

**Step 1: Send OTP**
1. Enter email: `test@example.com`
2. Click "Gửi OTP"
3. Check your Gmail for OTP

**Step 2: Reset Password**
1. Enter OTP (6 digits)
2. New Password: `NewTest123!`
3. Confirm: `NewTest123!`
4. Click "Reset Mật Khẩu"
5. Should redirect to Login

**Test with New Password:**
- Email: `test@example.com`
- Password: `NewTest123!`

---

## 🔧 Configuration Guide

### Backend Configuration

**File:** `backend/src/main/resources/application.properties`

#### 1. Email Setup (REQUIRED)

```properties
# Gmail SMTP Settings
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

# Gmail App Password: 
# 1. Go to https://myaccount.google.com/security
# 2. Enable 2-Step Verification
# 3. Go to https://myaccount.google.com/apppasswords
# 4. Select "Mail" and "Windows Computer"
# 5. Copy the 16-character password
```

#### 2. JWT Secret (Recommended for production)

```properties
# Change this to a random string (min 32 chars)
optistock.app.jwtSecret=YourRandomSecretKeyAtLeast32CharactersLong!@#$%
```

#### 3. Database (Already configured)

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/optistock_db
```

### Frontend Configuration

**File:** `frontend/src/api/axiosClient.js`

API base URL is already set:
```javascript
baseURL: 'http://localhost:8080/api'
```

---

## 📱 Full Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  USER REGISTRATION                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend Register Form                                  │
│    ↓                                                      │
│  POST /api/auth/register                                │
│    ↓                                                      │
│  Backend validates & saves to MongoDB                   │
│    ↓                                                      │
│  Generate JWT Token                                      │
│    ↓                                                      │
│  Return token + user info                               │
│    ↓                                                      │
│  Frontend: Save token in localStorage                   │
│    ↓                                                      │
│  Frontend: Redirect to Dashboard                        │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    USER LOGIN                            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend Login Form                                     │
│    ↓                                                      │
│  POST /api/auth/login {email, password}                │
│    ↓                                                      │
│  Backend: Find user by email                            │
│    ↓                                                      │
│  Backend: Compare password (BCrypt)                     │
│    ↓                                                      │
│  Generate JWT Token                                      │
│    ↓                                                      │
│  Return token                                            │
│    ↓                                                      │
│  Frontend: Save token                                    │
│    ↓                                                      │
│  Frontend: Add to every request header                  │
│  Authorization: Bearer {token}                          │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              FORGOT PASSWORD (2-STEP)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  STEP 1: Send OTP                                        │
│  ├─ Frontend: Enter email                               │
│  ├─ POST /api/auth/forgot-password                      │
│  ├─ Backend: Generate 6-digit OTP                       │
│  ├─ Backend: Save OTP + expiry (10 min) to DB          │
│  ├─ Backend: Send OTP via email (Gmail SMTP)           │
│  └─ Frontend: Show success message                      │
│                                                           │
│  STEP 2: Reset Password                                 │
│  ├─ Frontend: Enter OTP & new password                  │
│  ├─ POST /api/auth/reset-password                       │
│  ├─ Backend: Validate OTP                               │
│  ├─ Backend: Check OTP not expired                      │
│  ├─ Backend: Update password (BCrypt)                   │
│  ├─ Backend: Clear OTP from DB                          │
│  └─ Frontend: Redirect to Login                         │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PROTECTED ROUTE ACCESS                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  User requests /dashboard                               │
│    ↓                                                      │
│  Frontend: Check ProtectedRoute component               │
│    ↓                                                      │
│  Check: isAuthenticated from AuthContext                │
│    ├─ YES: Show Dashboard                               │
│    └─ NO: Redirect to /login                            │
│                                                           │
│  For API calls:                                          │
│  ├─ Axios adds: Authorization: Bearer {token}          │
│  ├─ Backend: JwtAuthenticationFilter validates          │
│  ├─ Backend: Extract email from token                   │
│  └─ Backend: Allow access if valid                      │
│                                                           │
│  If token expired:                                       │
│  ├─ Backend: Return 401 Unauthorized                    │
│  ├─ Axios interceptor catches 401                       │
│  ├─ Clear localStorage                                   │
│  └─ Redirect to /login                                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Verification Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Gmail SMTP configured
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can see Dashboard when logged in
- [ ] Can't access Dashboard when logged out
- [ ] Can logout and return to login
- [ ] Forgot password works
- [ ] OTP received in email
- [ ] Can reset password and login with new password

---

## 📊 API Endpoints Summary

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | {email, password, fullName, phoneNumber} |
| POST | `/api/auth/login` | {email, password} |
| POST | `/api/auth/forgot-password` | {email} |
| POST | `/api/auth/reset-password` | {email, otp, newPassword, confirmPassword} |
| GET | `/api/auth/verify-token` | Header: Authorization: Bearer |

---

## 🛠️ Advanced Setup

### Using MongoDB Atlas (Cloud)

```properties
# Replace localhost with MongoDB Atlas URI
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/optistock_db
```

### Using Different Email Provider

Instead of Gmail, you can use:
- SendGrid
- AWS SES
- Mailgun
- Custom SMTP server

Configure in `application.properties`:
```properties
spring.mail.host=your-smtp-host
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

### Production Deployment

**Backend (Java):**
- Build JAR: `./mvnw.cmd clean package`
- Deploy to AWS, Azure, Heroku, etc.
- Set environment variables instead of properties

**Frontend (React):**
- Build: `npm run build`
- Deploy to Vercel, Netlify, AWS S3, etc.
- Update API base URL in `.env`

---

## 🆘 Troubleshooting

### Issue: Backend won't start

```
Error: Port 8080 already in use
Solution: Kill process or use different port in application.properties
```

### Issue: Frontend can't connect to backend

```
Error: CORS error in console
Solution: 
1. Check backend is running
2. Check firewall settings
3. Verify CORS config in SecurityConfig.java
```

### Issue: Emails not sending

```
Error: JavaMailSender connection error
Solution:
1. Check Gmail 2-Step Verification is enabled
2. Use App Password (not regular password)
3. Check spring.mail.username & spring.mail.password
```

### Issue: Login fails with valid credentials

```
Error: 401 Unauthorized
Solution:
1. Check user exists in MongoDB
2. Check password was hashed correctly
3. Check JWT token generation
4. Review backend logs
```

---

## 📚 Documentation Files

- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Detailed auth system guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - REST API reference
- [QUICK_SETUP.md](./QUICK_SETUP.md) - Quick backend setup
- [FRONTEND_AUTH_GUIDE.md](./FRONTEND_AUTH_GUIDE.md) - Frontend React implementation

---

## ✨ Features Implemented

### Backend (Spring Boot)
- ✅ User Registration with validation
- ✅ User Login with JWT token
- ✅ Password encryption (BCrypt)
- ✅ OTP email sending (Gmail SMTP)
- ✅ Forgot password flow
- ✅ Reset password with OTP
- ✅ JWT token generation & validation
- ✅ JWT authentication filter
- ✅ CORS configuration
- ✅ Global exception handling
- ✅ MongoDB integration

### Frontend (React)
- ✅ Login page with form validation
- ✅ Register page with validation
- ✅ Forgot password 2-step flow
- ✅ Dashboard with user info
- ✅ Auth context for global state
- ✅ Protected routes
- ✅ Token management
- ✅ Automatic token refresh on 401
- ✅ Logout functionality
- ✅ Responsive design
- ✅ Beautiful UI with Ant Design

---

## 🎓 Learning Path

1. **Start with Registration** - Create a new account
2. **Then Login** - Use the account you created
3. **Test Dashboard** - See protected route in action
4. **Try Forgot Password** - Test email OTP flow
5. **Test Token Expiry** - Wait 24 hours or modify JWT expiry
6. **Add More Features** - Build on this foundation

---

## 🚀 Next Steps

1. ✅ Test all core features
2. ✅ Customize styling
3. ✅ Add user profile page
4. ✅ Implement 2FA
5. ✅ Add social login (Google/Facebook)
6. ✅ Deploy to production

---

*Complete Authentication System - Ready for Production!* 🎉
