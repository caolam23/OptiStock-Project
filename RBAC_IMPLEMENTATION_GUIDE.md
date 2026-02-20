# OptiStock - Role-Based Access Control Implementation Summary

## Ngày Tạo: February 11, 2026

---

## I. CÁC FILE BACKEND ĐÃ TẠO/CẬP NHẬT

### 1. Enums (Định nghĩa các loại role)
```
✅ src/main/java/com/optistock/backend/enums/UserRole.java
   - SUPER_ADMIN: Quản trị viên toàn hệ thống
   - TENANT_ADMIN: Quản trị viên kho (chủ kho)
   - STAFF: Nhân viên kho
   - ACCOUNTANT: Kế toán
   - MANAGER: Quản lý kho

✅ src/main/java/com/optistock/backend/enums/TenantStatus.java
   - ACTIVE: Hoạt động
   - INACTIVE: Không hoạt động
   - LOCKED: Bị khóa
   - SUSPENDED: Tạm ngưng
```

### 2. Models (Đối tượng dữ liệu)
```
✅ src/main/java/com/optistock/backend/model/User.java (CẬP NHẬT)
   - Thêm fields: tenantId, isActive
   - Giữ nguyên: roles (Set<String>), email, password, googleId, avatar

✅ src/main/java/com/optistock/backend/model/Tenant.java (TẠO MỚI)
   - id, tenantId (unique slug), companyName, ownerEmail
   - subscriptionPlan (FREE/BASIC/PRO/ENTERPRISE)
   - status (TenantStatus), expiryDate
   - Method: isActive() - check if tenant không bị lock và còn hạn
```

### 3. Repositories (Truy cập DB)
```
✅ src/main/java/com/optistock/backend/repository/TenantRepository.java (TẠO MỚI)
   - findByTenantId()
   - findByOwnerEmail()
   - existsByTenantId()
```

### 4. Security (Xác thực & Phân quyền)
```
✅ src/main/java/com/optistock/backend/security/annotation/RequireRole.java (TẠO MỚI)
   - Custom annotation cho method-level security
   - Sử dụng: @RequireRole(value = UserRole.SUPER_ADMIN)

✅ src/main/java/com/optistock/backend/security/annotation/RequireTenantAccess.java (TẠO MỚI)
   - Custom annotation để check quyền truy cập tenant cụ thể

✅ src/main/java/com/optistock/backend/security/aspect/RoleAuthorizationAspect.java (TẠO MỚI)
   - AOP Aspect để xử lý @RequireRole annotation
   - Kiểm tra authorities từ SecurityContext

✅ src/main/java/com/optistock/backend/security/JwtAuthenticationFilter.java (CẬP NHẬT)
   - Extract roles từ JWT token
   - Add roles vào SecurityContext.authorities
   - Sử dụng jwtUtils.getRolesFromJwtToken()

✅ src/main/java/com/optistock/backend/security/TenantAccessFilter.java (TẠO MỚI)
   - Middleware check tenant status (lock/expire)
   - Nếu tenant LOCKED hoặc subscription expired → Return 403
   - Skip excluded paths (auth endpoints)
```

### 5. Config (Cấu hình Spring Security)
```
✅ src/main/java/com/optistock/backend/config/SecurityConfig.java (CẬP NHẬT)
   - Thêm @EnableMethodSecurity
   - Thêm TenantAccessFilter vào chain
   - Cấu hình CORS, CSRF, SessionManagement
```

### 6. Utils (Tiện ích)
```
✅ src/main/java/com/optistock/backend/util/JwtUtils.java (CẬP NHẬT)
   - generateJwtToken(User user) - overload method
   - getTenantIdFromJwtToken()
   - getUserIdFromJwtToken()
   - getRolesFromJwtToken()
   - Token structure: {sub, userId, tenantId, roles, fullName}
```

### 7. Services (Business Logic)
```
✅ src/main/java/com/optistock/backend/service/TenantService.java (TẠO MỚI)
   - createTenant() - tạo tenant mới
   - getTenantById(), getTenantByTenantId()
   - getAllTenants() - lấy tất cả tenants (Super Admin)
   - updateTenantStatus() - khóa/mở khóa/suspend tenant
   - renewSubscription() - gia hạn dịch vụ
   - isTenantActive() - check tenant còn active?
   - generateTenantId() - tạo unique slug từ tên công ty

✅ src/main/java/com/optistock/backend/service/AuthService.java (CẬP NHẬT)
   - buildAuthResponse() - sử dụng jwtUtils.generateJwtToken(user) thay vì email
```

### 8. DTOs (Data Transfer Objects)
```
✅ src/main/java/com/optistock/backend/dto/AuthResponse.java (CẬP NHẬT)
   - Thêm fields: userId, avatar, tenantId, isActive

✅ src/main/java/com/optistock/backend/dto/UserResponseDTO.java (TẠO MỚI)
   - id, email, fullName, roles, tenantId, avatar, isActive

✅ src/main/java/com/optistock/backend/dto/TenantDTO.java (TẠO MỚI)
   - Response DTO cho Tenant object

✅ src/main/java/com/optistock/backend/dto/CreateTenantRequest.java (TẠO MỚI)
   - Request body để tạo tenant mới
```

### 9. Controllers (API Endpoints)
```
✅ src/main/java/com/optistock/backend/controller/AuthController.java (CẬP NHẬT)
   - POST /api/auth/google-login - cập nhật logic
     * Tạo Tenant mặc định cho user Google mới
     * Gán role TENANT_ADMIN cho owner
     * Generate JWT token với role info
   - GET /api/auth/verify-token - return userId, tenantId, roles

✅ src/main/java/com/optistock/backend/controller/AdminController.java (TẠO MỚI)
   - GET /api/admin/tenants - Xem danh sách tenants (Super Admin)
   - GET /api/admin/tenants/{id} - Chi tiết tenant (Super Admin)
   - POST /api/admin/tenants/{tenantId}/lock - Khóa tenant (Super Admin)
   - POST /api/admin/tenants/{tenantId}/unlock - Mở khóa (Super Admin)
   - POST /api/admin/tenants/{tenantId}/renew - Gia hạn (Super Admin)
   - GET /api/admin/my-tenant - Info kho của mình (Any authenticated)
```

---

## II. CÁC FILE FRONTEND ĐÃ TẠO/CẬP NHẬT

### 1. Context (State Management)
```
✅ src/context/AuthContext.jsx (CẬP NHẬT ĐẦY ĐỦ)
   State:
   - user, token, userId, tenantId, roles, avatar, isActive
   
   Helper Functions:
   - hasRole(roleName) - check role cụ thể
   - isSuperAdmin()
   - isTenantAdmin()
   - isStaff()
   - isAccountant()
   
   Methods:
   - login(email, password)
   - register(formData)
   - googleLogin(token) - CẬP NHẬT
   - logout()
   - sendOtp(), resetPassword()
```

### 2. Components
```
✅ src/components/RoleBasedRoute.jsx (TẠO MỚI)
   - Protected route component
   - Props: allowedRoles={['SUPER_ADMIN']}, element={<Component />}
   - Redirect đến /login nếu không authenticated
   - Show 403 error nếu không có role

✅ src/components/ProfileInfo.jsx (TẠO MỚI)
   - Hiển thị thông tin user (avatar, name, email)
   - Hiển thị userId, tenantId
   - List tất cả roles
   - Role checks (isSuperAdmin, isTenantAdmin, etc.)
```

### 3. Pages
```
✅ src/pages/AdminDashboard/AdminDashboard.jsx (TẠO MỚI)
   Tabs:
   1. Thông tin cá nhân - dùng ProfileInfo component
   2. Quản lý công ty (chỉ Super Admin)
      - Table hiển thị tất cả tenants
      - Columns: STT, Tên, Email, Gói dịch vụ, Trạng thái, Ngày hết hạn
      - Buttons: Khóa/Mở khóa, Gia hạn
   3. Thông tin công ty (Tenant Admin)
      - Hiển thị info kho của mình

✅ src/pages/AdminDashboard/AdminDashboard.css (TẠO MỚI)
   - Modern UI styling
   - Responsive design
```

### 4. Styles
```
✅ src/styles/ProfileInfo.css (TẠO MỚI)
   - Avatar styling
   - Info sections
   - Role badges
   - Responsive layout
```

---

## III. LÝ THUYẾT HOẠT ĐỘNG

### JWT Token Structure (Mới)
```json
{
  "sub": "user@email.com",
  "userId": "507f1f77bcf86cd799439011",
  "tenantId": "hungphat-stock",
  "roles": ["TENANT_ADMIN", "STAFF"],
  "fullName": "Nguyễn Hùng",
  "iat": 1630700800,
  "exp": 1630787200
}
```

### Security Filter Chain

```
Request received
        ↓
TenantAccessFilter
  ├─ Check token exists
  ├─ Extract tenantId from JWT
  └─ Check tenant status:
      ├─ LOCKED? → 403 Forbidden
      ├─ Expired? → 403 Forbidden
      └─ ACTIVE? → Continue
        ↓
JwtAuthenticationFilter
  ├─ Validate JWT signature
  ├─ Extract roles from JWT
  └─ Add roles to SecurityContext.authorities
        ↓
RoleAuthorizationAspect (@RequireRole)
  ├─ Check if method has @RequireRole
  ├─ Check if user has required role
  └─ Grant/Deny access
        ↓
Controller & Service
```

### Google SSO Signup Flow

```
User clicks "Đăng nhập Google"
        ↓
Frontend: googleLogin(accessToken)
        ↓
Backend: POST /api/auth/google-login
        ↓
Verify token with Google API
        ↓
Check user exists in DB
        ├─ Yes → Update googleId (if null) → Login
        └─ No → CREATE:
            ├─ User object
            ├─ Tenant object (auto-named)
            ├─ Set user.tenantId = tenant.tenantId
            ├─ Add role: TENANT_ADMIN
            └─ Save both objects
        ↓
Generate JWT with:
  - subject: email
  - userId, tenantId, roles, fullName
        ↓
Return AuthResponse:
  - token, userId, tenantId, roles, etc.
        ↓
Frontend: Save to localStorage
        ↓
Frontend: Update AuthContext state
        ↓
User redirected to /dashboard
```

---

## IV. ROLE DEFINITIONS

### SUPER_ADMIN (Quản trị viên toàn hệ thống)
```
Quyền:
  ✓ View all tenants
  ✓ Lock/Unlock tenant
  ✓ Renew subscription
  ✓ View system health metrics
  ✓ Manage IP blacklist
  
API Endpoints:
  GET /api/admin/tenants
  GET /api/admin/tenants/{id}
  POST /api/admin/tenants/{tenantId}/lock
  POST /api/admin/tenants/{tenantId}/unlock
  POST /api/admin/tenants/{tenantId}/renew
  
Không được phép:
  ✗ Access tenant data (inventory, products)
  ✗ Modify tenant settings (làm việc này thông qua tenant admin)
```

### TENANT_ADMIN (Quản trị viên kho)
```
Quyền:
  ✓ Invite team members
  ✓ Manage warehouse layout (zones, shelves, bins)
  ✓ Manage products & units
  ✓ View all reports
  ✓ Configure system settings
  ✓ Assign roles to team members
  
API Endpoints:
  GET /api/tenant/info
  POST /api/tenant/users/invite
  POST /api/warehouse/layout
  GET /api/reports/*
  
Không được phép:
  ✗ Access other tenant data
  ✗ Delete tenant
  ✗ Change subscription plan
```

### STAFF (Nhân viên kho)
```
Quyền:
  ✓ Create stock-in transactions
  ✓ Create stock-out transactions
  ✓ View inventory
  ✓ Scan barcode
  ✓ View warehouse layout
  
API Endpoints:
  GET /api/warehouse/inventory
  POST /api/warehouse/stock-in
  POST /api/warehouse/stock-out
  GET /api/warehouse/layout
  
Không được phép:
  ✗ View cost price
  ✗ Delete transactions
  ✗ Access configuration
  ✗ View financial reports
```

### ACCOUNTANT (Kế toán)
```
Quyền:
  ✓ View cost price
  ✓ View financial reports
  ✓ View profit/loss
  ✓ Export reports
  ✓ View valuation
  
API Endpoints:
  GET /api/finance/cost-price
  GET /api/finance/reports
  GET /api/finance/valuation
  
Không được phép:
  ✗ Create/edit transactions
  ✗ View inventory quantity
  ✗ Access configuration
```

---

## V. TEST SCENARIOS

### Scenario 1: Google SSO New User
```
1. User clicks "Đăng nhập Google"
2. Authenticate with Gmail
3. Backend creates:
   - User: role = TENANT_ADMIN, tenantId = "..." 
   - Tenant: name = "User's Warehouse", status = ACTIVE
4. JWT token includes: userId, tenantId, roles=[TENANT_ADMIN]
5. Frontend stores token + user info
6. User redirected to /dashboard
7. ProfileInfo shows: role = TENANT_ADMIN, tenantId = "..."
```

### Scenario 2: Super Admin Lock Tenant
```
1. Super Admin login (role = SUPER_ADMIN)
2. Navigate to /admin
3. See table of all tenants
4. Click "Khóa" on Tenant A
5. POST /api/admin/tenants/hungphat-stock/lock
   ├─ @RequireRole(SUPER_ADMIN) → PASS
   └─ TenantService.updateTenantStatus(LOCKED)
6. Update: Tenant.status = LOCKED
7. User of Tenant A tries to access /dashboard
8. GET /api/warehouse/inventory
   ├─ TenantAccessFilter extract tenantId = "hungphat-stock"
   ├─ Query Tenant > Status = LOCKED
   └─ Return 403 Forbidden
9. User sees: "Tenant locked or subscription expired"
```

### Scenario 3: Staff Limited Access
```
1. Tenant Admin invites staff@example.com → role = STAFF
2. Staff login
3. Try to access /finance/cost-price
   ├─ JWT has role = STAFF
   ├─ @RequireRole(ACCOUNTANT) check
   └─ STAFF ≠ ACCOUNTANT → 403 Forbidden
4. Staff can access /warehouse/inventory
   ├─ @RequireRole({STAFF, TENANT_ADMIN})
   ├─ STAFF is in list → PASS
   └─ Return inventory data
```

---

## VI. NEXT STEPS (Phase 2)

- [ ] Warehouse Layout Setup (Zones, Shelves, Bins CRUD)
- [ ] Product Management (SKU, Unit Conversion, Categories)
- [ ] Team Invitation System (Send invite link, Auto-assign role)
- [ ] Stock-In/Stock-Out Transactions
- [ ] Inventory Reports (Quantity, Valuation)
- [ ] Financial Reports (Cost Price, Profit/Loss)
- [ ] Audit Logging (Who did what when)
- [ ] Role Hierarchy (inherit parent role permissions)
- [ ] Permission-based Access (more granular than roles)
- [ ] Activity Logging & Search
- [ ] Refresh Token Implementation
- [ ] 2FA (Two-Factor Authentication)

---

## VII. DATABASE SCHEMA (MongoDB)

### Collections to Create

```javascript
// users collection (update existing)
db.createCollection("users")
db.users.createIndex({ email: 1 }, { unique: true })

// tenants collection (new)
db.createCollection("tenants")
db.tenants.createIndex({ tenantId: 1 }, { unique: true })
db.tenants.createIndex({ ownerEmail: 1 }, { unique: true })
db.tenants.createIndex({ status: 1 })
db.tenants.createIndex({ expiryDate: 1 })
```

---

**Status**: ✅ IMPLEMENTATION COMPLETE
**Phase**: 1.0 - Role-Based Access Control
**Date**: February 11, 2026
