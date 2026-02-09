# OptiStock Frontend - Authentication UI Guide

## 📋 Overview

Frontend React application with complete Authentication & Authorization system:
- ✅ **Login Page** - Email/Password login
- ✅ **Register Page** - Create new account
- ✅ **Forgot Password** - 2-step OTP reset
- ✅ **Dashboard** - Protected route
- ✅ **Auth Context** - Global state management
- ✅ **JWT Token** - Automatic token handling
- ✅ **Responsive Design** - Mobile-friendly UI

---

## 🏗️ Frontend Structure

```
frontend/src/
├── api/
│   ├── authApi.js           (API calls for auth)
│   └── axiosClient.js       (Axios with interceptors)
├── context/
│   └── AuthContext.jsx      (Global auth state)
├── components/
│   └── ProtectedRoute.jsx   (Route protection)
├── pages/
│   ├── Login/
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── Register/
│   │   ├── Register.jsx
│   │   └── Register.css
│   ├── ForgotPassword/
│   │   ├── ForgotPassword.jsx
│   │   └── ForgotPassword.css
│   └── Dashboard/
│       ├── Dashboard.jsx
│       └── Dashboard.css
├── routes/
│   └── AppRouter.jsx        (Route configuration)
├── App.jsx
├── index.css
└── main.jsx
```

---

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Step 3: Make sure Backend is Running

Backend should be running on `http://localhost:8080`

---

## 📄 Pages Overview

### 1️⃣ Login Page (`/login`)

**Features:**
- Email validation
- Password validation
- Error messages
- Loading state
- Links to Register & Forgot Password

**Flow:**
1. User enters email & password
2. Calls `authApi.login()`
3. Stores token in localStorage
4. Updates AuthContext
5. Redirects to Dashboard

**Screenshot Elements:**
- Email input with icon
- Password input (masked)
- Submit button
- Links to other pages

---

### 2️⃣ Register Page (`/register`)

**Features:**
- Full name input
- Email validation
- Phone number (optional)
- Password confirmation
- Error handling

**Flow:**
1. User fills registration form
2. Validates password match
3. Calls `authApi.register()`
4. Auto-login after registration
5. Redirects to Dashboard

**Fields:**
- Full Name (required)
- Email (required, validated)
- Phone (optional)
- Password (min 6 chars)
- Confirm Password

---

### 3️⃣ Forgot Password Page (`/forgot-password`)

**Features:**
- 2-step process
- Step 1: Enter email → Send OTP
- Step 2: Enter OTP & new password
- Steps indicator
- Error/Success messages

**Step 1 Flow:**
1. User enters email
2. Calls `authApi.forgotPassword()`
3. Backend sends OTP via email
4. Shows success message
5. Moves to Step 2

**Step 2 Flow:**
1. User enters OTP (6 digits)
2. User enters new password
3. Calls `authApi.resetPassword()`
4. Updates password in backend
5. Redirects to Login

---

### 4️⃣ Dashboard Page (`/dashboard`)

**Features:**
- Protected route (requires login)
- User info display
- Logout button
- User preferences menu
- Welcome message

**Protected by:**
- `ProtectedRoute` component
- Checks `isAuthenticated` status
- Redirects to login if not authenticated

---

## 🔐 Authentication Flow

### Token Management

```javascript
// 1. Store token after login
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// 2. Automatic header addition
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Handle token expiry
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### AuthContext Hook

```javascript
// Use auth in any component
const { user, token, isAuthenticated, login, logout } = useAuth();

// Available functions:
// - login(email, password)
// - register(formData)
// - logout()
// - sendOtp(email)
// - resetPassword(email, otp, newPassword)
```

---

## 🎨 UI Components Used

### From Ant Design:
- `Form` - For form handling
- `Input` - Text inputs
- `Button` - Action buttons
- `Card` - Container
- `Alert` - Error/Success messages
- `Spin` - Loading indicator
- `Steps` - Progress steps
- `Layout` - Page layout
- `Avatar` - User avatar
- `Dropdown` - User menu
- `Typography` - Text styles

### Icons:
- `MailOutlined` - Email
- `LockOutlined` - Password
- `UserOutlined` - User
- `PhoneOutlined` - Phone
- `SafeOutlined` - OTP
- `LogoutOutlined` - Logout

---

## 🔗 API Endpoints Called

### From Frontend to Backend

| Method | Endpoint | Used In |
|--------|----------|---------|
| POST | `/auth/register` | Register.jsx |
| POST | `/auth/login` | Login.jsx |
| POST | `/auth/forgot-password` | ForgotPassword.jsx (Step 1) |
| POST | `/auth/reset-password` | ForgotPassword.jsx (Step 2) |
| GET | `/auth/verify-token` | AuthContext (optional) |
| POST | `/auth/google-login` | (Not implemented yet) |

---

## 📦 Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "antd": "^5.0.0",
  "axios": "^1.13.5",
  "jwt-decode": "^4.0.0",
  "@react-oauth/google": "^0.13.4"
}
```

---

## 🌐 Environment Configuration

### API Base URL

Currently set in `axiosClient.js`:
```javascript
baseURL: 'http://localhost:8080/api'
```

For production, create `.env`:
```
VITE_API_URL=https://api.production.com/api
```

Then update `axiosClient.js`:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
```

---

## 🧪 Testing Guide

### Test Register
1. Go to `http://localhost:5173/register`
2. Fill form with:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234!
   - Confirm: Test1234!
3. Click "Tạo Tài Khoản"
4. Should redirect to Dashboard

### Test Login
1. Go to `http://localhost:5173/login`
2. Enter:
   - Email: test@example.com
   - Password: Test1234!
3. Click "Đăng Nhập"
4. Should see Dashboard

### Test Forgot Password
1. Go to `http://localhost:5173/forgot-password`
2. Step 1: Enter email → Get OTP in email
3. Step 2: Enter OTP + New Password
4. Should redirect to Login

### Test Protected Route
1. Logout (or clear token)
2. Try accessing `/dashboard`
3. Should redirect to `/login`

---

## 🐛 Troubleshooting

### ❌ CORS Error

**Error:** `Access to XMLHttpRequest has been blocked`

**Solution:**
- Check backend CORS config
- Ensure frontend URL is in allowed origins
- Use `http://localhost:5173` (not `localhost:5173`)

### ❌ Token Not Sent

**Error:** 401 Unauthorized from backend

**Solution:**
- Check localStorage has `token` key
- Verify token format (should have 3 parts: header.payload.signature)
- Check `axiosClient.js` interceptor

### ❌ Login Fails

**Error:** Invalid email/password

**Solution:**
- Check backend is running
- Verify user exists in database
- Check MongoDB connection

### ❌ OTP Not Received

**Error:** Email not arriving

**Solution:**
- Check backend email configuration
- Verify Gmail App Password
- Check spam folder
- Check backend logs

### ❌ Blank Page / Errors

**Error:** White screen or console errors

**Solution:**
```bash
# Clear dependencies
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run dev
```

---

## 🚀 Building for Production

### Build Project

```bash
npm run build
```

Creates optimized build in `dist/` folder

### Preview Build

```bash
npm run preview
```

Test production build locally

### Deploy

Upload `dist/` folder to hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Azure Static Web Apps

---

## 📝 Development Notes

### Adding New Pages

1. Create page in `src/pages/NewPage/NewPage.jsx`
2. Add route in `AppRouter.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```
3. Import in `AppRouter.jsx`

### Protecting Routes

```javascript
<Route
  path="/protected"
  element={
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  }
/>
```

### Using Auth Context

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome {user.fullName}</p>}
    </div>
  );
}
```

---

## 📞 Support

For issues or questions:
1. Check console for errors
2. Check network tab in DevTools
3. Verify backend is running
4. Check `.env` configuration
5. Clear cache and rebuild

---

*Frontend Auth System - Complete and Ready to Use!* ✅
