# Hệ Thống Phân Quyền OptiStock (Role-Based Access Control)

## Tổng Quan

Hệ thống phân quyền OptiStock hỗ trợ Multi-tenancy với các cấp độ quyền hạn khác nhau:

### Các Role Chính

1. **SUPER_ADMIN** - Quản trị viên toàn hệ thống
   - Quản lý tất cả tenants
   - Khóa/Mở khóa tenant
   - Gia hạn dịch vụ
   - Xem thống kê toàn hệ thống
   - Đường dẫn: `/api/admin/**`

2. **TENANT_ADMIN** - Quản trị viên kho (chủ kho)
   - Quản lý thành viên trong kho
   - Cấu hình sơ đồ kho
   - Xem báo cáo chi tiết
   - Cấu hình sản phẩm
   - Đường dẫn: `/api/tenant/**`

3. **STAFF** - Nhân viên kho
   - Nhập/Xuất hàng
   - Xem tồn kho
   - Không thể xóa kho, không thể xem giá vốn
   - Đường dẫn: `/api/warehouse/**`

4. **ACCOUNTANT** - Kế toán
   - Xem báo cáo tài chính
   - Xem giá vốn
   - Không thể nhập/xuất hàng
   - Đường dẫn: `/api/finance/**`

---

## Cấu Trúc Backend

### 1. Enums
- **UserRole** - Định nghĩa các role có sẵn
- **TenantStatus** - Trạng thái tenant (ACTIVE, LOCKED, SUSPENDED, INACTIVE)

### 2. Models
- **User** - Người dùng hệ thống
  - `id`: MongoDB ID
  - `email`: Email duy nhất
  - `password`: Mật khẩu hash
  - `fullName`: Tên đầy đủ
  - `roles`: Set<String> chứa các role
  - `tenantId`: ID của tenant mà user thuộc về
  - `isActive`: Trạng thái hoạt động
  - `googleId`: Google ID nếu dùng SSO
  - `avatar`: URL avatar
  - `resetOtp`: OTP reset password
  - `resetOtpExpiry`: Thời gian hết hạn OTP

- **Tenant** - Công ty/Kho
  - `id`: MongoDB ID
  - `tenantId`: Unique slug (ví dụ: "hungphat-stock")
  - `companyName`: Tên công ty
  - `ownerEmail`: Email chủ kho (owner)
  - `subscriptionPlan`: Gói dịch vụ (FREE, BASIC, PRO, ENTERPRISE)
  - `status`: TenantStatus
  - `expiryDate`: Ngày hết hạn dịch vụ
  - `startDate`: Ngày bắt đầu dịch vụ

### 3. Security Filters
- **JwtAuthenticationFilter** - Xác thực JWT và extract roles
- **TenantAccessFilter** - Kiểm tra tenant status (lock/active)

### 4. Custom Annotations
- **@RequireRole** - Yêu cầu role cụ thể để truy cập method
  ```java
  @GetMapping("/tenants")
  @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền")
  public ResponseEntity<?> getAllTenants() { ... }
  ```

- **@RequireTenantAccess** - Kiểm tra quyền truy cập tenant

### 5. Services
- **AuthService** - Xử lý đăng ký, đăng nhập, reset password
- **TenantService** - Quản lý lifecycle tenant
- **JwtUtils** - Tạo/Verify JWT token với role info

### 6. Controllers
- **AuthController** - Authentication/Authorization
- **AdminController** - Admin/Tenant management

---

## Cấu Trúc Frontend

### 1. Auth Context
```javascript
const {
  user,           // Thông tin user cơ bản
  userId,         // User ID
  tenantId,       // Tenant ID
  roles,          // Mảng roles
  token,          // JWT token
  
  // Helper functions
  hasRole(roleName),      // Kiểm tra có role cụ thể
  isSuperAdmin(),         // Là Super Admin?
  isTenantAdmin(),        // Là Tenant Admin?
  isStaff(),              // Là Staff?
  isAccountant(),         // Là Accountant?
  
  // Methods
  login(email, password),
  register(formData),
  googleLogin(token),
  logout(),
} = useAuth();
```

### 2. Components
- **RoleBasedRoute** - Bảo vệ route dựa trên role
  ```jsx
  <RoleBasedRoute 
    allowedRoles={['SUPER_ADMIN']} 
    element={<AdminDashboard />} 
  />
  ```

- **ProfileInfo** - Hiển thị thông tin user
- **AdminDashboard** - Dashboard quản lý

---

## Flow Hoạt Động

### 1. Đăng Ký Người Dùng Mới (Google SSO)
```
User click "Đăng nhập Google"
    ↓
Frontend gửi Google Token tới Backend
    ↓
Backend verify token với Google API
    ↓
Nếu user mới:
  - Tạo User object
  - Tạo Tenant mặc định (name + "'s Warehouse")
  - Gán role TENANT_ADMIN cho user
  - Lưu tenantId vào user
    ↓
Generate JWT token chứa: email, userId, tenantId, roles
    ↓
Frontend lưu token + user info vào localStorage
    ↓
User được login tự động vào dashboard của kho
```

### 2. Kiểm Tra Quyền Truy Cập
```
User gửi request API kèm JWT token
    ↓
TenantAccessFilter check:
  - Token valid?
  - Tenant bị lock? → Return 403 Forbidden
  - Subscription còn hạn? → Return 403 Forbidden
    ↓
JwtAuthenticationFilter extract roles từ token
    ↓
Spring Security set authorities = roles
    ↓
RoleAuthorizationAspect check @RequireRole annotation
    ↓
Nếu user có role → Proceed
Nếu không → Throw AuthException (403 Forbidden)
```

### 3. Super Admin Khóa Tenant
```
Super Admin vào /admin/tenants
    ↓
Xem danh sách tất cả tenants
    ↓
Click "Khóa" button trên tenant A
    ↓
POST /api/admin/tenants/{tenantId}/lock
    ↓
Backend update Tenant.status = LOCKED
    ↓
Lần sau, người dùng của Tenant A gửi request:
  - TenantAccessFilter check → status is LOCKED
  - Return 403 error
  - User không thể truy cập bất kỳ API nào (ngoài auth)
```

---

## JWT Token Structure

Token chứa các claim sau:
```json
{
  "sub": "user@email.com",        // Subject (email)
  "userId": "507f1f77bcf86cd799439011",
  "tenantId": "hungphat-stock",
  "roles": ["TENANT_ADMIN", "STAFF"],  // Array of roles
  "fullName": "Nguyễn Hùng",
  "iat": 1630700800,
  "exp": 1630787200
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google-login` - Đăng nhập Google
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu
- `GET /api/auth/verify-token` - Verify token

### Admin Management (Super Admin Only)
- `GET /api/admin/tenants` - Xem danh sách tenants
- `GET /api/admin/tenants/{id}` - Xem chi tiết tenant
- `POST /api/admin/tenants/{tenantId}/lock` - Khóa tenant
- `POST /api/admin/tenants/{tenantId}/unlock` - Mở khóa tenant
- `POST /api/admin/tenants/{tenantId}/renew` - Gia hạn dịch vụ
- `GET /api/admin/my-tenant` - Xem thông tin kho của mình

---

## Cách Sử Dụng

### Backend - Bảo Vệ API với Role
```java
@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {
  
  // Chỉ STAFF và TENANT_ADMIN mới access được
  @GetMapping("/inventory")
  @RequireRole(value = {UserRole.STAFF, UserRole.TENANT_ADMIN})
  public ResponseEntity<?> getInventory() { ... }
  
  // Chỉ TENANT_ADMIN mới thêm sản phẩm
  @PostMapping("/products")
  @RequireRole(value = UserRole.TENANT_ADMIN)
  public ResponseEntity<?> addProduct() { ... }
  
  // Chỉ ACCOUNTANT mới xem giá vốn
  @GetMapping("/cost-price")
  @RequireRole(value = UserRole.ACCOUNTANT)
  public ResponseEntity<?> getCostPrice() { ... }
}
```

### Frontend - Hiển thị Dựa Trên Role
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isSuperAdmin, isTenantAdmin, hasRole } = useAuth();
  
  return (
    <div>
      {isSuperAdmin() && (
        <button>Quản lý tất cả tenants</button>
      )}
      
      {isTenantAdmin() && (
        <button>Quản lý nhân viên</button>
      )}
      
      {hasRole('ACCOUNTANT') && (
        <div>Báo cáo tài chính</div>
      )}
    </div>
  );
}
```

### Frontend - Bảo Vệ Route
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<RoleBasedRoute element={<Dashboard />} />} />
  <Route path="/admin" element={
    <RoleBasedRoute 
      allowedRoles={['SUPER_ADMIN']} 
      element={<AdminDashboard />} 
    />
  } />
</Routes>
```

---

## Xử Lý Lỗi

### 403 Forbidden (Tenant Locked)
```json
{
  "success": false,
  "message": "Tenant locked or subscription expired"
}
```
**Giải pháp**: Super Admin cần mở khóa tenant hoặc gia hạn dịch vụ

### 403 Forbidden (Insufficient Privilege)
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập chức năng này"
}
```
**Giải pháp**: Tenant Admin cần gán quyền cho user hoặc user không được phép truy cập

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "message": "Token is invalid"
}
```
**Giải pháp**: User cần đăng nhập lại

---

## Test Scenarios

### Scenario 1: Super Admin Quản Lý Tenants
1. Tạo tài khoản Super Admin (manual): role = "SUPER_ADMIN"
2. Login với Super Admin account
3. Truy cập `/admin/dashboard`
4. Xem danh sách tất cả tenants
5. Click "Khóa" tenant → Tenant bị locked
6. User của tenant khóc không thể gửi request → 403 Forbidden

### Scenario 2: User Mới Google Signup
1. Click "Đăng nhập Google"
2. Đăng nhập Gmail
3. Backend tự động tạo Tenant + gán role TENANT_ADMIN
4. User được redirect tới Dashboard (kho của mình)
5. Có thể mời STAFF/ACCOUNTANT khác

### Scenario 3: STAFF Nhập Hàng
1. TENANT_ADMIN mời STAFF vào kho
2. STAFF đăng nhập
3. Có thể truy cập `/warehouse/inventory` (STAFF role)
4. Không thể truy cập `/finance/cost-price` (chỉ ACCOUNTANT)
5. Không thể xóa kho hoặc ngắt dịch vụ

---

## Best Practices

1. **Luôn kiểm tra role trên Backend** - Không dựa vào frontend check
2. **Sử dụng JWT claims** cho role - Tránh query DB mỗi request
3. **Implement Role Hierarchy** nếu cần - SUPER_ADMIN > TENANT_ADMIN > STAFF/ACCOUNTANT
4. **Log Authorization Failures** - Giúp debug và security audit
5. **Refresh token** periodically - Implement refresh token logic sau
6. **Validate Tenant Access** - Đảm bảo user chỉ access data của tenant của họ

---

## TODO (Phase 2 - Phát triển sau)

- [ ] Role Hierarchy (SUPER_ADMIN inherit all permissions)
- [ ] Custom Roles (Tenant Admin tạo custom roles)
- [ ] Permission-based Access (thay vì role-based)
- [ ] Audit Log (ghi lại ai làm gì khi)
- [ ] IP Whitelisting (chỉ allow IP cụ thể)
- [ ] Two-Factor Authentication (2FA)
- [ ] Session Management (logout everywhere, active sessions list)
- [ ] API Rate Limiting per role
- [ ] Feature Flags per subscription plan
