# OptiStock - Setup & Running Guide

## I. BACKEND SETUP

### 1. Dependencies (pom.xml)
Những dependencies này đã được add:
```xml
<!-- Spring Security (Authentication & Authorization) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT Token (Authentication) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

<!-- AOP (for @RequireRole aspect) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>

<!-- MongoDB -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

<!-- Email (for OTP sending) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**Nếu chưa add**: Thêm spring-boot-starter-aop vào pom.xml
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### 2. application.properties Configuration

```properties
# Server
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/optistock
spring.data.mongodb.database=optistock

# JWT Configuration
optistock.app.jwtSecret=your-super-secret-key-min-32-chars-recommended-change-this-in-prod
optistock.app.jwtExpirationMs=86400000

# Email Configuration (for OTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Google OAuth
google.client.id=your-google-client-id.apps.googleusercontent.com
google.client.secret=your-google-client-secret

# Logging
logging.level.root=INFO
logging.level.com.optistock.backend=DEBUG
```

### 3. MongoDB Setup

```bash
# Start MongoDB (local)
mongod

# Create database & collections
mongo optistock

# Inside mongosh:
db.createCollection("users")
db.users.createIndex({ email: 1 }, { unique: true })

db.createCollection("tenants")
db.tenants.createIndex({ tenantId: 1 }, { unique: true })
db.tenants.createIndex({ ownerEmail: 1 }, { unique: true })

# Optional: Create Super Admin user manually
db.users.insertOne({
  email: "admin@optistock.com",
  password: "$2a$10$slYQmyNdGzin7olVN3p5mOpz7tj3IgfAYGmJrW1JoLx1jGEKpNLYS", // bcrypt of "admin123"
  fullName: "Super Admin",
  roles: ["SUPER_ADMIN"],
  tenantId: null,
  isActive: true,
  provider: "LOCAL",
  phoneNumber: null,
  googleId: null,
  avatar: null,
  resetOtp: null,
  resetOtpExpiry: null,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 4. Build & Run Backend

```bash
cd backend

# Clean & Build
mvn clean package -DskipTests

# Run
mvn spring-boot:run

# Or run JAR directly
java -jar target/optistock-backend-0.0.1-SNAPSHOT.jar
```

**Output should show**:
```
Started OptistockBackendApplication in XX.XXX seconds
```

### 5. Verify Backend is Running
```bash
curl http://localhost:8080/api/auth/verify-token \
  -H "Authorization: Bearer invalid-token"

# Should return 401 Unauthorized (expected - no valid token)
```

---

## II. FRONTEND SETUP

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env` or update `vite.config.js`:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

### 3. API Client Configuration

Update `src/api/axiosClient.js`:
```javascript
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 403 & 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Redirect to login or show error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

### 4. Run Frontend Development Server
```bash
npm run dev

# Output:
# ➜  Local:   http://localhost:5173/
```

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## III. TESTING THE SYSTEM

### Test 1: Super Admin Login
```bash
# 1. Backend must be running
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@optistock.com",
    "password": "admin123"
  }'

# Expected Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "email": "admin@optistock.com",
  "fullName": "Super Admin",
  "tenantId": null,
  "roles": ["SUPER_ADMIN"],
  "isActive": true,
  "message": "Đăng nhập thành công!"
}
```

### Test 2: Get All Tenants (Super Admin)
```bash
TOKEN="eyJhbGciOiJIUzI1NiJ9..." # From login above

curl -X GET http://localhost:8080/api/admin/tenants \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "tenantId": "hungphat-stock",
      "companyName": "Kho Gia Dụng Hùng Phát",
      "ownerEmail": "hung@example.com",
      "subscriptionPlan": "BASIC",
      "status": "ACTIVE",
      "expiryDate": "2026-03-13T10:00:00",
      ...
    }
  ],
  "total": 1
}
```

### Test 3: Google SSO (Frontend)
1. Go to http://localhost:5173
2. Click "Đăng nhập Google"
3. Choose Gmail account
4. Should auto-create Tenant & get TENANT_ADMIN role
5. Redirected to Dashboard

### Test 4: Admin Dashboard Access
```
URL: http://localhost:5173/admin
- Must be logged in
- Must have SUPER_ADMIN or TENANT_ADMIN role
- If not → Show 403 Forbidden
```

### Test 5: Tenant Lock
```bash
ADMIN_TOKEN="..." # Super Admin token

# Lock tenants
curl -X POST http://localhost:8080/api/admin/tenants/hungphat-stock/lock \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
{
  "success": true,
  "message": "Công ty đã bị khóa",
  "data": { ... }
}

# After lock, tenant users cannot access any API:
curl -X GET http://localhost:8080/api/warehouse/inventory \
  -H "Authorization: Bearer $TENANT_USER_TOKEN"

# Response: 403 Forbidden
# {
#   "success": false,
#   "message": "Tenant locked or subscription expired"
# }
```

---

## IV. TROUBLESHOOTING

### Issue 1: MongoDB Connection Error
```
Error: MongoSocketOpenException
```
**Solution**:
- Ensure MongoDB is running: `mongod`
- Check connection URI in application.properties
- Verify database name is correct

### Issue 2: JWT Secret Too Short
```
Error: The specified key byte length is 128 bits which is less than the required 256 bits
```
**Solution**:
- Generate a longer secret:
  ```
  optistock.app.jwtSecret=your-super-secret-key-min-32-characters-recommended-change-in-prod-abc123456789
  ```

### Issue 3: CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Check SecurityConfig.java CORS configuration
- Ensure frontend URL is in allowedOrigins
- Frontend must use correct baseURL in axiosClient

### Issue 4: Token Not Included in Request
```
Response: 401 Unauthorized
```
**Solution**:
- Check localStorage has 'token' saved
- Verify axiosClient interceptor adds Authorization header
- Check Bearer format: "Bearer {token}"

### Issue 5: Role Check Fails
```
Message: "Bạn không có quyền truy cập chức năng này"
```
**Solution**:
- Check user roles in localStorage
- Verify JWT token decoding (use jwt.io)
- Check @RequireRole annotation on endpoint
- Ensure JwtAuthenticationFilter correctly extracts roles

### Issue 6: Google SSO Not Working
```
Error: Invalid Google Token
```
**Solution**:
- Verify Google Client ID in frontend
- Check Google API is enabled in Cloud Console
- Ensure access token is valid (not expired)
- Test in Google OAuth Playground first

---

## V. DEVELOPMENT WORKFLOW

### Day 1: Setup & Run System
1. Start MongoDB: `mongod`
2. Configure application.properties with JWT secret
3. Build backend: `mvn clean package`
4. Run backend: `mvn spring-boot:run`
5. Run frontend: `npm run dev`
6. Test login: http://localhost:5173

### Day 2: Test Features
1. Test Super Admin login
2. Test Google SSO
3. Test Tenant Lock
4. Test Role-based Access
5. Test ProfileInfo display

### Day 3: Debug & Optimize
1. Check logs in backend console
2. Check Network tab in browser DevTools
3. Verify localStorage content
4. Verify MongoDB data
5. Check SQL/Mongo queries performance

---

## VI. DEPLOYMENT CHECKLIST

### Before Production
- [ ] Change JWT secret to long random string
- [ ] Set `spring.profiles.active=prod` in application.properties
- [ ] Update MongoDB URI to production cluster
- [ ] Configure HTTPS/SSL
- [ ] Set CORS allowedOrigins to production domain
- [ ] Setup email service for OTP (not Gmail)
- [ ] Setup Google OAuth credentials for production
- [ ] Enable logging but not DEBUG level
- [ ] Setup monitoring/alerting
- [ ] Test all endpoints with production domain

### Docker Deployment (Optional)

**Backend Dockerfile**:
```dockerfile
FROM openjdk:17-jdk-slim
COPY backend/target/optistock-backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine as build
COPY frontend /app
WORKDIR /app
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  backend:
    build: ./backend
    ports:
      - "8080:8080"
  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

Run: `docker-compose up -d`

---

## VII. MONITORING & LOGS

### Backend Logs
```bash
# View logs by severity
grep "ERROR" target/optistock... # Errors
grep "WARN" target/...           # Warnings
grep "DEBUG" target/...          # Debug info

# Or from application output
tail -f console.log
```

### Frontend Logs
```javascript
// Browser DevTools Console
console.log('Auth Context:', useAuth())

// Network tab: Check request/response
// Check Authorization header is included
// Check response status codes
```

### MongoDB Logs
```bash
# Check MongoDB status
mongo --eval "db.serverStatus()"

# Check collections
mongo optistock
db.users.count()
db.tenants.count()
```

---

## VIII. PERFORMANCE OPTIMIZATION (For Later)

- [ ] Add database indexes for frequently queried fields
- [ ] Implement caching (Redis for token blacklist)
- [ ] Optimize JWT token size (remove unnecessary claims)
- [ ] Implement pagination for tenant list
- [ ] Add request rate limiting
- [ ] Compress response payloads
- [ ] Implement lazy loading in frontend
- [ ] Add code splitting for React components

---

**Last Updated**: February 11, 2026
**Status**: Ready for Testing ✅
