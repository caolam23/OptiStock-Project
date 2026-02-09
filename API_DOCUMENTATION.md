# OptiStock Backend - API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Token-based authentication using JWT

### Adding Token to Requests
```
Header: Authorization: Bearer <token>
```

---

## Auth Endpoints

### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "Full Name",
  "phoneNumber": "0123456789"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "email": "user@example.com",
  "fullName": "Full Name",
  "phoneNumber": "0123456789",
  "roles": ["ROLE_USER"],
  "message": "Đăng ký thành công!"
}
```

### 2. Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "email": "user@example.com",
  "fullName": "Full Name",
  "phoneNumber": "0123456789",
  "roles": ["ROLE_USER"],
  "message": "Đăng nhập thành công!"
}
```

### 3. Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra!"
}
```

### 4. Reset Password
```
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "email": "user@example.com",
  "fullName": "Full Name",
  "roles": ["ROLE_USER"],
  "message": "Mật khẩu đã được thay đổi thành công!"
}
```

### 5. Verify Token
```
GET /auth/verify-token
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Token is valid",
  "email": "user@example.com"
}
```

### 6. Google Login
```
POST /auth/google-login
Content-Type: application/json

{
  "token": "google_id_token"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "email": "user@gmail.com",
  "fullName": "Google User",
  "roles": ["ROLE_USER"],
  "message": "Google login successful"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message here"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "errorCode": "AUTH_ERROR",
  "message": "Error message here"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error: Error details"
}
```

---

## Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Notes
- All requests/responses use JSON format
- Timestamps are in ISO 8601 format
- Email validation is required
- Password must be at least 6 characters
- OTP expires in 10 minutes
- JWT token expires in 24 hours
