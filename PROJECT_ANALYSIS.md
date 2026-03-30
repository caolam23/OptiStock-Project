# OptiStock - Tài liệu Phân Tích Chi Tiết Dự Án

**Ngày cập nhật:** 11/03/2026  
**Phiên bản dự án:** 0.0.1-SNAPSHOT

---

## 📋 MỤC LỤC

1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
3. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
4. [Các vai trò & Quyền hạn](#các-vai-trò--quyền-hạn)
5. [Luồng hoạt động chính](#luồng-hoạt-động-chính)
6. [Các chức năng chi tiết](#các-chức-năng-chi-tiết)
7. [Cấu trúc dữ liệu](#cấu-trúc-dữ-liệu)
8. [API Endpoints](#api-endpoints)

---

## 🎯 Tổng quan dự án

**OptiStock** là một **hệ thống quản lý kho hàng đa tenant (Multi-Tenant)** được thiết kế để hỗ trợ các doanh nghiệp từ các ngành khác nhau (FMCG, điện tử, thời trang, dược phẩm, thực phẩm...) quản lý tồn kho, kiểm kê, nhập/xuất hàng một cách hiệu quả.

### 🎪 Đặc điểm chính:

- **Multi-Tenant Architecture**: Mỗi doanh nghiệp (Tenant/Workspace) là hoàn toàn độc lập
- **Role-Based Access Control (RBAC)**: 5 vai trò khác nhau với quyền hạn riêng biệt
- **Real-time Operations**: Hỗ trợ SSE (Server-Sent Events) cho cập nhật realtime
- **Barcode Scanning**: Tích hợp quét mã barcode (QR/Barcode) để tăng tốc độ xử lý
- **Industry Templates**: Tự động tạo cấu trúc kho dựa trên template của ngành
- **Email Notifications**: Gửi OTP, lời mời, thông báo qua email

---

## 🛠️ Công nghệ sử dụng

### **Backend**
```
- Framework: Spring Boot 3.2.2
- Language: Java 17
- Database: MongoDB (NoSQL)
- Security: Spring Security + JWT (JSON Web Tokens)
- Email: Gmail SMTP
- OAuth: Google OAuth2 (SSO)
- Build Tool: Maven
- Port: 8080
```

### **Frontend**
```
- Framework: React 19.2.0
- Build Tool: Vite
- Router: React Router v7.13.0
- UI Library: Ant Design (antd) v5.0.0
- HTTP Client: Axios v1.13.5
- QR/Barcode: html5-qrcode v2.3.8
- Auth: JWT Decode v4.0.0, Google OAuth
- CSS: CSS Modules + Local CSS
- Port: 5173 (dev)
```

### **Database**
```
- MongoDB Local: mongodb://localhost:27017/optistock_db
- Collections: users, tenants, products, locations, stock_vouchers, 
              stocktake_tickets, invitations, unit_conversions, ...
```

---

## 🏗️ Kiến trúc hệ thống

### **Kiến trúc Backend (Spring Boot MVC)**

```
backend/
├── controller/          # REST API Endpoints
│   ├── AuthController              (xác thực, đăng nhập, quên mật khẩu)
│   ├── WorkspaceController         (quản lý workspace/tenant)
│   ├── TenantOnboardingControllerV2 (khởi tạo workspace mới)
│   ├── PersonnelController         (quản lý nhân sự)
│   ├── ManagerVoucherController    (quản lý phiếu nhập/xuất)
│   ├── ManagerStocktakeController  (quản lý kiểm kê)
│   ├── StaffVoucherController      (Staff xử lý phiếu)
│   ├── StaffStocktakeController    (Staff xử lý kiểm kê)
│   ├── InvitationController        (quản lý lời mời)
│   └── AdminController             (quản lý toàn hệ thống)
│
├── service/             # Business Logic
│   ├── AuthService                 (xác thực, JWT)
│   ├── WorkspaceService            (truy vấn workspace)
│   ├── TenantService               (tạo/cập nhật tenant)
│   ├── TenantOnboardingServiceV2   (onboarding workflow)
│   ├── PersonnelService            (quản lý members)
│   ├── PersonnelEventService       (SSE events)
│   ├── ManagerVoucherService       (logic phiếu)
│   ├── StaffVoucherService         (xử lý phiếu)
│   ├── ManagerStocktakeService     (tạo kiểm kê)
│   ├── StaffStocktakeService       (xử lý kiểm kê)
│   ├── EmailService                (gửi email)
│   └── InvitationService           (lời mời)
│
├── model/               # JPA/MongoDB Entities
│   ├── User                        (đăng ký, đăng nhập)
│   ├── Tenant                      (workspace/doanh nghiệp)
│   ├── TenantMember                (thành viên trong workspace)
│   ├── TenantSettings              (cấu hình workspace)
│   ├── Product                     (sản phẩm)
│   ├── Location                    (kho/kệ/vị trí)
│   ├── StockVoucher                (phiếu nhập/xuất/điều chuyển)
│   ├── VoucherItem                 (chi tiết item trong phiếu)
│   ├── StocktakeTicket             (phiếu kiểm kê)
│   ├── StocktakeItem               (chi tiết item kiểm kê)
│   ├── Invitation                  (lời mời thành viên)
│   ├── UnitConversion              (quy đổi đơn vị)
│   └── User.AuthProvider           (LOCAL, GOOGLE)
│
├── repository/          # MongoDB Data Access Layer
│   ├── UserRepository
│   ├── TenantRepository
│   ├── ProductRepository
│   ├── LocationRepository
│   ├── StockVoucherRepository
│   ├── StocktakeTicketRepository
│   ├── InvitationRepository
│   └── UnitConversionRepository
│
├── dto/                 # Data Transfer Objects
│   ├── AuthRequest/Response
│   ├── WorkspaceResponseDTO
│   ├── TenantOnboardingRequestV2/ResponseV2
│   ├── CreateVoucherRequest
│   ├── StocktakeTicketDTO
│   ├── ProductDTO
│   ├── LocationDTO
│   ├── InvitationDTO
│   └── ...
│
├── exception/           # Custom Exceptions
│   ├── AuthException
│   ├── UserNotFoundException
│   └── ...
│
├── security/            # Security Configuration
│   ├── SecurityConfig   (JWT, CORS, CSRF)
│   ├── annotation/      (@RequireRole, @IsAdmin)
│   └── aspect/          (Role checking)
│
├── config/              # Application Configuration
│   ├── SecurityConfig
│   ├── IndustryTemplateConfig  (template mẫu theo ngành)
│   ├── AdminDataInitializer    (khởi tạo dữ liệu)
│   └── StaffDataSeeder
│
├── util/                # Utilities
│   ├── JwtUtils         (tạo/verify JWT token)
│   ├── EmailUtils
│   └── ...
│
└── OptistockBackendApplication.java  (Main entry point)
```

### **Kiến trúc Frontend (React + Vite)**

```
frontend/src/
├── pages/               # Page Components (Trang)
│   ├── Login/           (Đăng nhập)
│   ├── Register/        (Đăng ký)
│   ├── ForgotPassword/  (Quên mật khẩu)
│   ├── Dashboard/       (Chọn workspace)
│   ├── AdminDashboard/  (Super Admin)
│   ├── TenantOnboarding/ (Khởi tạo workspace)
│   └── workspace/       (Trang trong workspace)
│       ├── Overview.jsx         (Tổng quan)
│       ├── Products.jsx         (Quản lý sản phẩm)
│       ├── Locations.jsx        (Quản lý kho/vị trí)
│       ├── Inventory.jsx        (Nhập/Xuất kho)
│       ├── Stocktake.jsx        (Kiểm kê)
│       ├── StocktakeDetail.jsx  (Chi tiết kiểm kê)
│       ├── Finance.jsx          (Tài chính)
│       ├── Reports.jsx          (Báo cáo)
│       ├── Orders.jsx           (Đơn hàng)
│       ├── Customers.jsx        (Khách hàng)
│       ├── Personnel.jsx        (Quản lý nhân sự)
│       ├── StaffTasks.jsx       (Công việc của Staff)
│       ├── ProcessVoucher.jsx   (Xử lý phiếu)
│       ├── AuditLog.jsx         (Lịch sử hành động)
│       ├── Settings.jsx         (Cấu hình workspace)
│       └── ...
│
├── components/          # Reusable Components
│   ├── ProtectedRoute.jsx          (Kiểm tra JWT)
│   ├── RoleBasedRoute.jsx           (Kiểm tra vai trò global)
│   ├── WorkspaceRoleRoute.jsx       (Kiểm tra vai trò workspace)
│   ├── CameraScanner.jsx            (Quét barcode)
│   ├── ProfileInfo.jsx              (Thông tin profile)
│   └── Common/Layout/...
│
├── layouts/             # Layout Components
│   ├── WorkspaceLayout.jsx    (Bố cục chính + Sidebar + TopBar)
│   ├── Sidebar.jsx            (Menu điều hướng)
│   └── TopBar.jsx             (Thanh trên)
│
├── context/             # React Context API
│   └── AuthContext.jsx        (Quản lý auth state global)
│
├── api/                 # API Client (Axios)
│   ├── axiosClient.js         (Base config)
│   ├── authApi.js             (Auth endpoints)
│   ├── workspaceApi.js        (Workspace endpoints)
│   ├── productApi.js          (Product endpoints)
│   ├── staffApi.js            (Staff endpoints)
│   ├── managerApi.js          (Manager endpoints)
│   ├── adminApi.js            (Admin endpoints)
│   ├── invitationApi.js       (Invitation endpoints)
│   └── tenantApi.js           (Tenant endpoints)
│
├── routes/              # Router Config
│   └── AppRouter.jsx    (Định nghĩa tất cả routes)
│
├── utils/               # Utility Functions
├── styles/              # Global CSS
└── main.jsx             (Entry point)
```

---

## 👥 Các vai trò & Quyền hạn

### **Cấp độ Hệ thống**

#### **1. SUPER_ADMIN** (Admin toàn hệ thống)
- Quản lý tất cả tenants trong hệ thống
- Xem danh sách users, tenants
- Thống kê toàn hệ thống
- Hủy/khôi phục workspaces
- **Endpoint**: `/api/admin/*`

### **Cấp độ Workspace (Tenant)**

| Vai trò | Quyền hạn | Áp dụng cho |
|--------|-----------|-----------|
| **OWNER** | <ul><li>Quản lý toàn bộ workspace</li><li>Thêm/xóa members</li><li>Xem tất cả báo cáo & tài chính</li><li>Cập nhật cài đặt workspace</li><li>Xóa workspace</li></ul> | Người tạo workspace |
| **MANAGER** | <ul><li>Tạo/cập nhật phiếu nhập/xuất</li><li>Tạo phiếu kiểm kê</li><li>Quản lý members (trừ OWNER)</li><li>Xem báo cáo</li><li>Duyệt kết quả kiểm kê</li></ul> | Quản lý hàng ngày |
| **ACCOUNTANT** | <ul><li>Xem tài chính & báo cáo</li><li>Xem khách hàng</li><li>Không thay đổi dữ liệu kho</li></ul> | Kế toán |
| **SALE** | <ul><li>Xem đơn hàng & khách hàng</li><li>Tạo/cập nhật đơn hàng</li><li>Xem tồn kho (đơn giản)</li></ul> | Bán hàng |
| **STAFF** | <ul><li>Xử lý phiếu nhập/xuất</li><li>Thực hiện kiểm kê</li><li>Quét barcode hàng hóa</li><li>Chỉ xem nhiệm vụ được giao</li></ul> | Nhân viên kho |

**Quyền hạn chi tiết theo trang:**

| Trang | OWNER | MANAGER | ACCOUNTANT | SALE | STAFF |
|-------|-------|---------|-----------|------|-------|
| Overview | ✅ | ✅ | ✅ | ✅ | ❌ |
| Products | ✅ | ✅ | ❌ | ❌ | ❌ |
| Locations | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inventory (Nhập/Xuất) | ✅ | ✅ | ❌ | ❌ | ✅ |
| Stocktake (Kiểm kê) | ✅ | ✅ | ❌ | ❌ | ✅ |
| Finance | ✅ | ❌ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Orders | ✅ | ❌ | ❌ | ✅ | ❌ |
| Customers | ✅ | ❌ | ✅ | ✅ | ❌ |
| Personnel | ✅ | ✅ | ❌ | ❌ | ❌ |
| Staff Tasks | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit Log | ✅ | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔄 Luồng hoạt động chính

### **1. Luồng Xác thực (Authentication)**

```
┌─────────────────────────────────────────────────────────┐
│ User truy cập trang web                                 │
└──────────────────┬──────────────────────────────────────┘
                   ↓
        ┌──────────────────────┐
        │ Đã login? (JWT token)│
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
        │ Các tùy chọn:        │
        │ 1. Register          │
        │ 2. Login             │
        │ 3. Reset Password    │
        └──────────┬───────────┘
                   ↓
   ┌───────────────┴───────────────┐
   ↓                               ↓
REGISTER                          LOGIN
   ↓                               ↓
Tạo tài khoản         Nhập email & password
   ↓                               ↓
Lưu vào MongoDB       Kiểm tra password
   ↓                               ↓
Email verification    Tạo JWT Token
   ↓                               ↓
   └───────────────┬───────────────┘
                   ↓
           ┌───────────────┐
           │ JWT Token     │
           │ (lưu local)   │
           └───────┬───────┘
                   ↓
           ┌───────────────────┐
           │ Chuyển tới:       │
           │ - Dashboard       │
           │  (chọn workspace) │
           └───────────────────┘

QUÊN MẬT KHẨU:
  1. User nhập email
  2. Hệ thống gửi OTP qua Gmail
  3. User nhập OTP + mật khẩu mới
  4. Cập nhật password, login lại
```

### **2. Luồng Khởi tạo Workspace (Tenant Onboarding)**

```
┌────────────────────────────────────────────────┐
│ User click "Create Workspace" từ Dashboard     │
└────────────────────┬───────────────────────────┘
                     ↓
      ┌──────────────────────────────┐
      │ Điền thông tin Workspace:    │
      │ - Tên Workspace              │
      │ - Ngành hàng (FMCG, điện tử) │
      │ - Vị trí (locations)         │
      │ - Lời mời (invites)          │
      └──────────────────┬───────────┘
                         ↓
         ┌──────────────────────────┐
         │ Xác nhận thông tin        │
         └──────────────┬────────────┘
                        ↓
        ┌───────────────────────────────┐
        │ Tạo Tenant (MongoDB)          │
        │ - Tạo Tenant record           │
        │ - Thêm user hiện tại làm OWNER│
        │ - Load Industry Template      │
        └──────────────┬────────────────┘
                       ↓
    ┌──────────────────────────────────┐
    │ Tải Industry Template (Locations) │
    │ VD: FMCG → Khu A, Khu B, Khu C    │
    │ VD: Electronics → Storage A, B, C │
    └──────────────┬───────────────────┘
                   ↓
    ┌─────────────────────────────────┐
    │ Tạo các Location mặc định       │
    │ (Lưu vào MongoDB)               │
    └──────────────┬──────────────────┘
                   ↓
    ┌─────────────────────────────────┐
    │ Gửi lời mời email (nếu có)      │
    │ - Tạo Invitation records        │
    │ - Gửi email với link            │
    └──────────────┬──────────────────┘
                   ↓
    ┌─────────────────────────────────┐
    │ ✅ Workspace đã sẵn sàng         │
    │ User được add làm OWNER          │
    └─────────────────────────────────┘
```

### **3. Luồng Quản lý Nhân sự (Personnel Management)**

```
┌────────────────────────────────────────┐
│ OWNER/MANAGER vào Personnel Management │
└─────────────────┬──────────────────────┘
                  ↓
         ┌────────────────────────┐
         │ Xem danh sách members  │
         │ - Tên, email, role     │
         │ - Ngày tham gia        │
         └────────────┬───────────┘
                      ↓
      ┌───────────────────────────────┐
      │ Các hành động:                │
      │ 1. Mời member mới             │
      │ 2. Cập nhật role              │
      │ 3. Xóa member                 │
      └───────────┬───────────────────┘
                  ↓
      ┌──────────────────────┐
      │ Mời member (Invite)  │
      │ - Nhập email         │
      │ - Chọn role          │
      └──────────┬───────────┘
                 ↓
   ┌─────────────────────────────────┐
   │ Tạo Invitation record           │
   │ - Status: PENDING               │
   │ - Hết hạn: 7 ngày               │
   │ - Tạo invitationCode token      │
   └──────────────┬──────────────────┘
                  ↓
   ┌─────────────────────────────────┐
   │ Gửi email lời mời               │
   │ Link: /accept-invitation?code=.. │
   └──────────────┬──────────────────┘
                  ↓
   ┌────────────────────────────────┐
   │ User mới click link trong email │
   └──────────────┬─────────────────┘
                  ↓
   ┌────────────────────────────────┐
   │ Hệ thống:                      │
   │ - Verify invitationCode        │
   │ - Thêm user vào TenantMembers  │
   │ - Cập nhật Invitation status   │
   │   thành ACCEPTED               │
   └──────────────┬─────────────────┘
                  ↓
   ┌────────────────────────────────┐
   │ ✅ Member được add vào workspace│
   └────────────────────────────────┘
```

### **4. Luồng Quản lý Phiếu Nhập/Xuất (Stock Voucher)**

```
┌──────────────────────────────────────┐
│ MANAGER tạo phiếu nhập/xuất          │
└──────────────────┬───────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Điền thông tin phiếu:        │
    │ - Loại: INBOUND/OUTBOUND/... │
    │ - Tiêu đề                    │
    │ - Chọn sản phẩm & số lượng    │
    │ - Chỉ định STAFF xử lý       │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Tạo StockVoucher:            │
    │ - Mã phiếu: PN-001, PX-055    │
    │ - Status: PENDING            │
    │ - Tạo VoucherItem cho mỗi SP  │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Giao cho STAFF:              │
    │ - Phiếu được assign          │
    │ - STAFF nhận được thông báo  │
    │   (qua SSE events)           │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ STAFF xử lý phiếu:           │
    │ 1. Bấm "Bắt đầu"             │
    │    → Status: PROCESSING      │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ STAFF quét barcode:          │
    │ - Quét từng sản phẩm         │
    │ - Hệ thống công dồn số lượng │
    │ - VoucherItem.quantityActual │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ STAFF bấm "Hoàn tất":        │
    │ → Status: COMPLETED          │
    │ → completedAt: lưu thời gian  │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Hệ thống cập nhật:           │
    │ - Product.currentStock       │
    │ - Cập nhật inventory entry   │
    │ - Tạo audit log              │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ ✅ Phiếu hoàn tất            │
    │ Kho được cập nhật            │
    └──────────────────────────────┘
```

### **5. Luồng Kiểm kê Hàng (Stocktake)**

```
┌──────────────────────────────────────┐
│ MANAGER tạo phiếu kiểm kê            │
└──────────────────┬───────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Chọn:                        │
    │ - Location (vị trí cần kê)    │
    │ - Danh sách sản phẩm          │
    │ - Giao cho STAFF             │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Tạo StocktakeTicket:         │
    │ - Mã phiếu: KK-001, KK-002... │
    │ - Status: PENDING            │
    │ - Tạo StocktakeItem          │
    │   (chỉ lưu systemQuantity)    │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ STAFF nhận phiếu:            │
    │ - Status: PENDING            │
    │ - STAFF xem số lượng hệ thống │
    │   (systemQuantity)            │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ STAFF đến vị trí kên:        │
    │ 1. Bấm "Bắt đầu"             │
    │    → Status: IN_PROGRESS      │
    │ 2. Đếm số lượng thực tế       │
    │    bằng mắt (không quét BRC) │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ STAFF nhập số lượng thực tế:  │
    │ - Nhập actualQuantity         │
    │ - Thêm ghi chú (nếu cần)      │
    │ - Bấm "Gửi báo cáo"          │
    │    → Status: SUBMITTED        │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ Hệ thống tính toán:          │
    │ Chênh lệch = actual - system  │
    │ Nếu chênh lệch > 0: Thiếu    │
    │ Nếu chênh lệch < 0: Thừa     │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ MANAGER xem & duyệt:         │
    │ - Xem chi tiết chênh lệch     │
    │ 2 tùy chọn:                  │
    │ A) Duyệt (APPROVED)          │
    │    → Cập nhật currentStock   │
    │ B) Từ chối (REJECTED)        │
    │    → Yêu cầu STAFF đếm lại   │
    └──────────────┬────────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ ✅ Kiểm kê hoàn tất          │
    │ Kho được đồng bộ              │
    └──────────────────────────────┘
```

---

## 📦 Các chức năng chi tiết

### **A. Xác thực & Tài khoản (Authentication)**

#### **1.1 Đăng ký (Register)**
- **Endpoint**: `POST /api/auth/register`
- **Input**: Email, Password, Full Name, Phone Number
- **Output**: JWT Token, User Info, Roles
- **Chi tiết**:
  - Kiểm tra email chưa tồn tại
  - Hash mật khẩu bằng BCrypt
  - Ghi Auth Provider = LOCAL
  - Tạo User record trong MongoDB
  - Trả về JWT Token & User info

#### **1.2 Đăng nhập (Login)**
- **Endpoint**: `POST /api/auth/login`
- **Input**: Email, Password
- **Output**: JWT Token, User Info, Workspace List, Roles
- **Chi tiết**:
  - Kiểm tra email tồn tại
  - Validate password
  - Tạo JWT Token (hết hạn sau 24h)
  - Trả về user info + danh sách workspace
  - Lưu token vào localStorage (frontend)

#### **1.3 Google Login (SSO)**
- **Endpoint**: `POST /api/auth/google-login`
- **Input**: Google ID Token
- **Output**: JWT Token, User Info
- **Chi tiết**:
  - Verify Google token
  - Tìm hoặc tạo User
  - Ghi Auth Provider = GOOGLE
  - Trả về JWT Token

#### **1.4 Quên mật khẩu (Forgot Password)**
- **Endpoint**: `POST /api/auth/forgot-password`
- **Input**: Email
- **Output**: Message "OTP sent"
- **Chi tiết**:
  - Tạo OTP ngẫu nhiên (6 chữ số)
  - Lưu resetOtp + resetOtpExpiry (15 phút) vào User
  - Gửi OTP qua Gmail SMTP
  - Frontend hiển thị form nhập OTP

#### **1.5 Đặt lại mật khẩu (Reset Password)**
- **Endpoint**: `POST /api/auth/reset-password`
- **Input**: Email, OTP, New Password
- **Output**: Message "Password reset successful"
- **Chi tiết**:
  - Verify OTP (không hết hạn, đúng)
  - Cập nhật password mới
  - Xóa resetOtp, resetOtpExpiry
  - Trả về JWT Token mới

### **B. Quản lý Workspace (Workspace Management)**

#### **2.1 Lấy danh sách Workspace của User**
- **Endpoint**: `GET /api/v1/workspaces/my-workspaces`
- **Output**: List<WorkspaceResponseDTO>
- **Chi tiết**:
  - Truy vấn từ Tenant.members (userId)
  - Sắp xếp theo lastAccessed (mới nhất trước)
  - Trả về: id, name, industryCode, userRole, lastAccessed
  - Bỏ qua các workspace bị xóa (status = DELETED)

#### **2.2 Lấy chi tiết Workspace**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}`
- **Output**: Workspace details + members + statistics
- **Chi tiết**:
  - Kiểm tra quyền (user phải là member)
  - Trả về Tenant info + danh sách members
  - Tính toán số liệu (total products, total inventory, ...)

### **C. Khởi tạo Workspace (Tenant Onboarding)**

#### **3.1 Tạo Workspace mới**
- **Endpoint**: `POST /api/v1/onboarding/tenant`
- **Input**: TenantOnboardingRequestV2
  ```json
  {
    "tenantName": "Hung Phat Store",
    "industryCode": "fmcg",
    "locations": [
      { "name": "Kho A", "type": "STORAGE" },
      { "name": "Quầy bán", "type": "DISPLAY" }
    ],
    "invites": [
      { "email": "manager@example.com", "role": "MANAGER" },
      { "email": "staff@example.com", "role": "STAFF" }
    ]
  }
  ```
- **Output**: TenantOnboardingResponseV2
  ```json
  {
    "tenantId": "hung-phat-store",
    "tenantName": "Hung Phat Store",
    "message": "Workspace created successfully",
    "workspaceUrl": "/workspace/64a8c9d2f1e4b5a3c9f2d1e4"
  }
  ```
- **Chi tiết**:
  - Validate input (tên, ngành hàng, locations, invites)
  - Tạo Tenant record
  - Thêm user hiện tại làm OWNER
  - Load Industry Template (locations mặc định)
  - Ghi đè hoặc thêm locations từ request
  - Tạo Invitation records cho danh sách mời
  - Gửi email lời mời
  - Trả về tenantId & workspace URL

### **D. Quản lý Nhân sự (Personnel Management)**

#### **4.1 Lấy danh sách Members**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/personnel/members`
- **Output**: List<MemberDTO>
  ```json
  [
    {
      "id": "user_id",
      "email": "manager@example.com",
      "fullName": "Manager Name",
      "role": "MANAGER",
      "joinedAt": "2026-03-01T10:00:00Z"
    }
  ]
  ```
- **Chi tiết**:
  - Lấy từ Tenant.members (TenantMember list)
  - Lấy thông tin user từ User collection
  - Sắp xếp theo role (OWNER → MANAGER → ACCOUNTANT → SALE → STAFF)

#### **4.2 Lấy danh sách Invitation chưa duyệt**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/personnel/invitations`
- **Output**: List<InvitationDTO>
- **Chi tiết**:
  - Lấy từ Invitation collection (status = PENDING)
  - Sắp xếp theo createdAt (mới nhất trước)
  - Hiển thị thời gian hết hạn

#### **4.3 Gửi lời mời (Invite Member)**
- **Endpoint**: `POST /api/v1/workspaces/{tenantId}/personnel/invitations`
- **Input**:
  ```json
  {
    "email": "newmember@example.com",
    "role": "MANAGER"
  }
  ```
- **Output**: InvitationDTO
- **Chi tiết**:
  - Verify quyền (chỉ OWNER hoặc MANAGER)
  - Kiểm tra email chưa là member
  - Tạo invitation code (random token)
  - Lưu Invitation record (status = PENDING, expires = +7 ngày)
  - Gửi email với link: `/accept-invitation?code={invitationCode}`
  - Phát sự kiện SSE để thông báo realtime

#### **4.4 Chấp nhận lời mời (Accept Invitation)**
- **Endpoint**: `GET /api/v1/accept-invitation?code={invitationCode}`
- **Output**: Message "Invitation accepted" + redirect to workspace
- **Chi tiết**:
  - Verify invitationCode có hiệu lực
  - Kiểm tra invitation chưa hết hạn
  - Tìm user theo email (hoặc tạo user baru nếu chưa có)
  - Thêm user vào TenantMember với role từ invitation
  - Cập nhật Invitation status = ACCEPTED
  - Phát sự kiện SSE

#### **4.5 Cập nhật role Member**
- **Endpoint**: `PUT /api/v1/workspaces/{tenantId}/personnel/members/{memberId}`
- **Input**: `{ "role": "ACCOUNTANT" }`
- **Output**: Updated MemberDTO
- **Chi tiết**:
  - Kiểm tra quyền (OWNER có thể thay đổi tất cả, MANAGER chỉ thay đổi STAFF/ACCOUNTANT/SALE)
  - Cập nhật TenantMember.role
  - Phát sự kiện SSE

#### **4.6 Xóa Member**
- **Endpoint**: `DELETE /api/v1/workspaces/{tenantId}/personnel/members/{memberId}`
- **Output**: Message "Member removed"
- **Chi tiết**:
  - Kiểm tra quyền
  - Không cho xóa OWNER
  - Xóa từ Tenant.members array
  - Phát sự kiện SSE

### **E. Quản lý Sản phẩm (Product Management)**

#### **5.1 Danh sách Sản phẩm**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/products`
- **Output**: List<ProductDTO>
  ```json
  [
    {
      "id": "prod_001",
      "productCode": "SKU-PROD-001",
      "productName": "Nước ngọt 1.5L",
      "category": "Đồ uống",
      "mainUnit": "Thùng",
      "currentStock": 150,
      "minStock": 10,
      "maxStock": 500,
      "price": 25000,
      "cost": 15000
    }
  ]
  ```
- **Chi tiết**:
  - Liệt kê tất cả sản phẩm của workspace
  - Hiển thị tồn kho hiện tại
  - Cảnh báo nếu tồn kho < minStock

#### **5.2 Tạo/Cập nhật Sản phẩm**
- **Endpoint**: 
  - `POST /api/v1/workspaces/{tenantId}/products`
  - `PUT /api/v1/workspaces/{tenantId}/products/{productId}`
- **Input**: ProductDTO
- **Output**: Created/Updated ProductDTO
- **Chi tiết**:
  - Validate productCode unique trong workspace
  - Tạo/cập nhật Product record
  - Lưu unit conversions (nếu có)

#### **5.3 Xóa Sản phẩm**
- **Endpoint**: `DELETE /api/v1/workspaces/{tenantId}/products/{productId}`
- **Output**: Message "Product deleted"
- **Chi tiết**:
  - Soft delete (isActive = false, deletedAt = now)
  - Không xóa từ database

### **F. Quản lý Vị trí/Kho (Location Management)**

#### **6.1 Danh sách Vị trí**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/locations`
- **Output**: List<LocationDTO>
  ```json
  [
    {
      "id": "loc_001",
      "name": "Kho A (Tầng 1)",
      "type": "STORAGE",
      "capacity": 500,
      "currentCount": 180,
      "isActive": true
    }
  ]
  ```
- **Chi tiết**:
  - Liệt kê tất cả location của workspace
  - Types: STORAGE, DISPLAY, REPAIR, STAGING, INSPECTION, etc.

#### **6.2 Tạo/Cập nhật Vị trí**
- **Endpoint**: 
  - `POST /api/v1/workspaces/{tenantId}/locations`
  - `PUT /api/v1/workspaces/{tenantId}/locations/{locationId}`

### **G. Quản lý Phiếu Nhập/Xuất (Stock Voucher Management)**

#### **7.1 Danh sách Phiếu (Manager view)**
- **Endpoint**: `GET /api/v1/manager/vouchers`
- **Output**: List<StockVoucher>
- **Chi tiết**:
  - Liệt kê tất cả phiếu
  - Filter theo status (PENDING, PROCESSING, COMPLETED, CANCELLED)
  - Filter theo priority, type, assigned staff

#### **7.2 Chi tiết Phiếu**
- **Endpoint**: `GET /api/v1/manager/vouchers/{voucherId}`
- **Output**: StockVoucher + VoucherItem list
- **Chi tiết**:
  - Hiển thị thông tin phiếu
  - Danh sách item với systemQuantity và actualQuantity

#### **7.3 Tạo Phiếu**
- **Endpoint**: `POST /api/v1/manager/vouchers`
- **Input**: CreateVoucherRequest
  ```json
  {
    "type": "INBOUND",
    "title": "Nhập hàng từ NCC A",
    "priority": "NORMAL",
    "items": [
      {
        "productId": "prod_001",
        "quantityExpected": 100,
        "unit": "Thùng"
      }
    ],
    "assignedTo": "staff_user_id"
  }
  ```
- **Output**: StockVoucher
- **Chi tiết**:
  - Tạo StockVoucher record (status = PENDING)
  - Tạo VoucherItem cho mỗi sản phẩm
  - Assign cho STAFF
  - Phát sự kiện SSE để thông báo STAFF

#### **7.4 STAFF nhận Phiếu**
- **Endpoint**: `GET /api/v1/staff/vouchers` (danh sách được giao)
- **Output**: List<StockVoucher> (assignedTo = current user)
- **Chi tiết**:
  - Lọc phiếu được giao cho STAFF
  - Sắp xếp theo priority, createAt

#### **7.5 STAFF bắt đầu xử lý (Start Processing)**
- **Endpoint**: `PUT /api/v1/staff/vouchers/{voucherId}/start`
- **Output**: Updated StockVoucher
- **Chi tiết**:
  - Cập nhật status = PROCESSING
  - Ghi startedAt = now
  - Phát sự kiện SSE

#### **7.6 STAFF quét Barcode**
- **Endpoint**: `POST /api/v1/staff/vouchers/{voucherId}/items/{itemId}/scan`
- **Input**: `{ "barcode": "123456789" }`
- **Output**: Scanned item info + updated count
- **Chi tiết**:
  - Tìm product theo barcode
  - Tăng VoucherItem.quantityActual lên 1
  - Trả về item info mới
  - Nếu quét xong tất cả items → hiển thị "Ready to complete"

#### **7.7 STAFF hoàn tất Phiếu**
- **Endpoint**: `PUT /api/v1/staff/vouchers/{voucherId}/complete`
- **Output**: Updated StockVoucher
- **Chi tiết**:
  - Cập nhật status = COMPLETED
  - Ghi completedAt = now
  - **Cập nhật Product.currentStock**:
    - INBOUND: currentStock += quantityActual
    - OUTBOUND: currentStock -= quantityActual
    - TRANSFER: Trừ từ source location, thêm vào destination
  - Tạo audit log entry
  - Phát sự kiện SSE

### **H. Quản lý Kiểm kê (Stocktake Management)**

#### **8.1 Danh sách Phiếu Kiểm kê (Manager view)**
- **Endpoint**: `GET /api/v1/manager/stocktakes`
- **Output**: List<StocktakeTicket>
- **Chi tiết**:
  - Liệt kê tất cả phiếu kiểm kê
  - Filter theo status, location, assigned staff

#### **8.2 Tạo Phiếu Kiểm kê**
- **Endpoint**: `POST /api/v1/manager/stocktakes`
- **Input**:
  ```json
  {
    "locationId": "loc_001",
    "title": "Kiểm kê Kho A - Tầng 1",
    "assignedTo": "staff_user_id"
  }
  ```
- **Output**: StocktakeTicket
- **Chi tiết**:
  - Tạo StocktakeTicket record (status = PENDING)
  - Lấy danh sách product tại location đó
  - Tạo StocktakeItem cho mỗi product
    - Lưu systemQuantity (từ Product.currentStock)
    - Không lưu actualQuantity (để STAFF nhập)
  - Assign cho STAFF
  - Phát sự kiện SSE

#### **8.3 STAFF nhận Phiếu Kiểm kê**
- **Endpoint**: `GET /api/v1/staff/stocktakes`
- **Output**: List<StocktakeTicket>
- **Chi tiết**:
  - Liệt kê phiếu được giao
  - Hiển thị systemQuantity, location info

#### **8.4 STAFF xem chi tiết Phiếu**
- **Endpoint**: `GET /api/v1/staff/stocktakes/{ticketId}`
- **Output**: StocktakeTicket + StocktakeItem list
- **Chi tiết**:
  - Hiển thị location, systemQuantity, danh sách product
  - Không hiển thị systemQuantity ở giao diện (chỉ sau khi submit)

#### **8.5 STAFF bắt đầu kiểm kê (Start)**
- **Endpoint**: `PUT /api/v1/staff/stocktakes/{ticketId}/start`
- **Output**: Updated StocktakeTicket
- **Chi tiết**:
  - Cập nhật status = IN_PROGRESS
  - Ghi startedAt = now

#### **8.6 STAFF nhập số lượng thực tế**
- **Endpoint**: `PUT /api/v1/staff/stocktakes/{ticketId}/items/{itemId}`
- **Input**: `{ "actualQuantity": 145 }`
- **Output**: Updated StocktakeItem
- **Chi tiết**:
  - Lưu actualQuantity
  - Tính chênh lệch = actualQuantity - systemQuantity
  - Hiển thị kết quả cho STAFF

#### **8.7 STAFF gửi báo cáo (Submit)**
- **Endpoint**: `PUT /api/v1/staff/stocktakes/{ticketId}/submit`
- **Output**: Updated StocktakeTicket
- **Chi tiết**:
  - Cập nhật status = SUBMITTED
  - Ghi submittedAt = now, submittedBy = current user
  - Phát sự kiện SSE để thông báo MANAGER

#### **8.8 MANAGER duyệt Kiểm kê**
- **Endpoint**: `PUT /api/v1/manager/stocktakes/{ticketId}/approve`
- **Input**: `{ "action": "APPROVE" }` hoặc `{ "action": "REJECT", "reason": "..." }`
- **Output**: Updated StocktakeTicket
- **Chi tiết**:
  - Nếu APPROVE:
    - Cập nhật status = APPROVED
    - **Cập nhật Product.currentStock** theo actualQuantity
    - Tạo audit log
  - Nếu REJECT:
    - Cập nhật status = REJECTED
    - Gửi lại cho STAFF với ghi chú
  - Phát sự kiện SSE

### **I. Financial & Reporting**

#### **9.1 Xem Tài chính**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/finance`
- **Output**: Financial Summary
  ```json
  {
    "totalRevenue": 5000000,
    "totalCost": 2000000,
    "totalProfit": 3000000,
    "currentInventoryValue": 500000,
    "monthlyRevenue": [...],
    "categoryBreakdown": [...]
  }
  ```

#### **9.2 Báo cáo Kho**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/reports/inventory`
- **Output**: Inventory status report
  - Tổng product
  - Tổng stock value
  - Sản phẩm có tồn kho thấp (< minStock)
  - Sản phẩm quá tồn (> maxStock)

#### **9.3 Lịch sử thay đổi (Audit Log)**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/audit-logs`
- **Output**: List<AuditLogEntry>
- **Chi tiết**:
  - Ghi lại tất cả hành động thay đổi dữ liệu
  - Khi nào, ai, là gì, trước/sau

### **J. Real-time Notifications (SSE)**

#### **10.1 Subscribe to Events**
- **Endpoint**: `GET /api/v1/workspaces/{tenantId}/personnel/events`
- **Protocol**: Server-Sent Events (SSE)
- **Output**: Realtime event stream
  ```javascript
  const eventSource = new EventSource(
    `/api/v1/workspaces/${tenantId}/personnel/events`,
    { withCredentials: true }
  );
  
  eventSource.addEventListener('member_added', (event) => {
    const data = JSON.parse(event.data);
    console.log('New member:', data);
  });
  
  eventSource.addEventListener('invitation_sent', (event) => {
    const data = JSON.parse(event.data);
    console.log('Invitation sent:', data);
  });
  
  eventSource.addEventListener('voucher_assigned', (event) => {
    const data = JSON.parse(event.data);
    console.log('New voucher:', data);
  });
  ```
- **Events**:
  - `member_added`: Member mới được thêm
  - `member_removed`: Member bị xóa
  - `member_role_updated`: Role thay đổi
  - `invitation_sent`: Lời mời được gửi
  - `voucher_assigned`: Phiếu được giao
  - `stocktake_assigned`: Kiểm kê được giao
  - `voucher_completed`: Phiếu hoàn tất
  - `stocktake_submitted`: Kiểm kê được gửi

---

## 📊 Cấu trúc dữ liệu

### **Database Schema (MongoDB)**

#### **1. Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  phoneNumber: String,
  roles: [String], // ["SUPER_ADMIN"] for system admin, [] for regular users
  provider: String, // "LOCAL" or "GOOGLE"
  googleId: String (if OAuth),
  avatar: String,
  isActive: Boolean,
  resetOtp: String,
  resetOtpExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **2. Tenants Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String (unique), // e.g., "hung-phat-store"
  name: String, // "Hung Phat Store"
  ownerEmail: String,
  phoneNumber: String,
  industryCode: String, // "fmcg", "electronics", etc.
  subscriptionPlan: String, // "FREE", "BASIC", "PRO", "ENTERPRISE"
  startDate: Date,
  expiryDate: Date,
  status: String, // "ACTIVE", "INACTIVE", "DELETED"
  website: String,
  address: String,
  taxId: String,
  settings: ObjectId (reference to TenantSettings),
  members: [
    {
      userId: String (ObjectId),
      role: String, // "OWNER", "MANAGER", "ACCOUNTANT", "SALE", "STAFF"
      joinedAt: Date,
      lastAccessedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (if deleted)
}
```

#### **3. Products Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  productCode: String (unique per tenant),
  productName: String,
  category: String,
  description: String,
  price: Number,
  cost: Number,
  mainUnit: String, // "Chai", "Thùng", "Cái", etc.
  currentStock: Number,
  minStock: Number,
  maxStock: Number,
  supplier: String,
  isActive: Boolean,
  unitConversionIds: [ObjectId],
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (if soft deleted)
}
```

#### **4. Locations Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  name: String, // "Kho A (Tầng 1)"
  code: String,
  type: String, // "STORAGE", "DISPLAY", "REPAIR", "STAGING", "INSPECTION"
  capacity: Number,
  currentCount: Number,
  isActive: Boolean,
  description: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

#### **5. StockVouchers Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  voucherCode: String (auto-generated),
  type: String, // "INBOUND", "OUTBOUND", "TRANSFER"
  status: String, // "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"
  title: String,
  priority: String, // "LOW", "NORMAL", "HIGH"
  destination: String,
  notes: String,
  items: [
    {
      productId: ObjectId,
      quantityExpected: Number,
      quantityActual: Number,
      unit: String
    }
  ],
  assignedTo: String (User ID),
  processedBy: String (User ID),
  createdBy: String (User ID),
  createdAt: Date,
  updatedAt: Date,
  startedAt: Date,
  completedAt: Date
}
```

#### **6. StocktakeTickets Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  ticketCode: String (auto-generated),
  title: String,
  status: String, // "PENDING", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED"
  locationCode: String,
  items: [
    {
      productId: ObjectId,
      systemQuantity: Number, // Từ Product.currentStock
      actualQuantity: Number, // Staff nhập (null cho đến khi submit)
      discrepancy: Number // actualQuantity - systemQuantity (tính sau khi submit)
    }
  ],
  assignedTo: String (User ID),
  submittedBy: String (User ID),
  createdBy: String (User ID),
  approvedBy: String (User ID),
  createdAt: Date,
  updatedAt: Date,
  startedAt: Date,
  submittedAt: Date,
  approvedAt: Date
}
```

#### **7. Invitations Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  invitedEmail: String,
  invitedByUserId: String,
  role: String, // "OWNER", "MANAGER", "ACCOUNTANT", "SALE", "STAFF"
  status: String, // "PENDING", "ACCEPTED", "REJECTED", "EXPIRED"
  invitationCode: String (unique token),
  expiresAt: Date, // +7 days from creation
  acceptedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **8. UnitConversions Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  productId: ObjectId,
  fromUnit: String, // "Chai"
  toUnit: String, // "Thùng"
  conversionRate: Number, // 24 (1 thùng = 24 chai)
  createdAt: Date,
  updatedAt: Date
}
```

#### **9. TenantSettings Collection**
```javascript
{
  _id: ObjectId,
  tenantId: String,
  warehouseName: String,
  currency: String, // "VND", "USD"
  dateFormat: String,
  timezone: String,
  defaultLanguage: String,
  maxUploadSize: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### **Base URL**
```
Backend: http://localhost:8080
Frontend: http://localhost:5173
```

### **Authentication APIs**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Đăng ký | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/google-login` | Google SSO | ❌ |
| POST | `/api/auth/forgot-password` | Gửi OTP | ❌ |
| POST | `/api/auth/reset-password` | Reset password | ❌ |

### **Workspace APIs**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/workspaces/my-workspaces` | Danh sách workspace | ✅ | All |
| GET | `/api/v1/workspaces/{tenantId}` | Chi tiết workspace | ✅ | Member |
| POST | `/api/v1/onboarding/tenant` | Tạo workspace mới | ✅ | Auth User |
| GET | `/api/v1/workspaces/{tenantId}/personnel/members` | Danh sách members | ✅ | Member |
| GET | `/api/v1/workspaces/{tenantId}/personnel/invitations` | Danh sách lời mời | ✅ | Member |
| POST | `/api/v1/workspaces/{tenantId}/personnel/invitations` | Gửi lời mời | ✅ | OWNER, MANAGER |
| PUT | `/api/v1/workspaces/{tenantId}/personnel/members/{id}` | Cập nhật role | ✅ | OWNER, MANAGER |
| DELETE | `/api/v1/workspaces/{tenantId}/personnel/members/{id}` | Xóa member | ✅ | OWNER, MANAGER |
| GET | `/api/v1/accept-invitation` | Chấp nhận lời mời | ✅ | Auth User |
| GET | `/api/v1/workspaces/{tenantId}/personnel/events` | SSE events | ✅ | Member |

### **Product APIs**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/workspaces/{tenantId}/products` | Danh sách sản phẩm | ✅ | Member |
| GET | `/api/v1/workspaces/{tenantId}/products/{id}` | Chi tiết sản phẩm | ✅ | Member |
| POST | `/api/v1/workspaces/{tenantId}/products` | Tạo sản phẩm | ✅ | OWNER, MANAGER |
| PUT | `/api/v1/workspaces/{tenantId}/products/{id}` | Cập nhật sản phẩm | ✅ | OWNER, MANAGER |
| DELETE | `/api/v1/workspaces/{tenantId}/products/{id}` | Xóa sản phẩm | ✅ | OWNER, MANAGER |

### **Location APIs**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/workspaces/{tenantId}/locations` | Danh sách vị trí | ✅ | Member |
| GET | `/api/v1/workspaces/{tenantId}/locations/{id}` | Chi tiết vị trí | ✅ | Member |
| POST | `/api/v1/workspaces/{tenantId}/locations` | Tạo vị trí | ✅ | OWNER, MANAGER |
| PUT | `/api/v1/workspaces/{tenantId}/locations/{id}` | Cập nhật vị trí | ✅ | OWNER, MANAGER |
| DELETE | `/api/v1/workspaces/{tenantId}/locations/{id}` | Xóa vị trí | ✅ | OWNER, MANAGER |

### **Stock Voucher APIs (Manager)**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/manager/vouchers` | Danh sách phiếu | ✅ | OWNER, MANAGER |
| GET | `/api/v1/manager/vouchers/{id}` | Chi tiết phiếu | ✅ | OWNER, MANAGER |
| POST | `/api/v1/manager/vouchers` | Tạo phiếu | ✅ | OWNER, MANAGER |
| PUT | `/api/v1/manager/vouchers/{id}` | Cập nhật phiếu | ✅ | OWNER, MANAGER |
| DELETE | `/api/v1/manager/vouchers/{id}` | Hủy phiếu | ✅ | OWNER, MANAGER |

### **Stock Voucher APIs (Staff)**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/staff/vouchers` | Danh sách phiếu được giao | ✅ | STAFF |
| GET | `/api/v1/staff/vouchers/{id}` | Chi tiết phiếu | ✅ | STAFF |
| PUT | `/api/v1/staff/vouchers/{id}/start` | Bắt đầu xử lý | ✅ | STAFF |
| POST | `/api/v1/staff/vouchers/{id}/items/{itemId}/scan` | Quét barcode | ✅ | STAFF |
| PUT | `/api/v1/staff/vouchers/{id}/complete` | Hoàn tất phiếu | ✅ | STAFF |

### **Stocktake APIs**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/manager/stocktakes` | Danh sách kiểm kê | ✅ | OWNER, MANAGER |
| POST | `/api/v1/manager/stocktakes` | Tạo phiếu kiểm kê | ✅ | OWNER, MANAGER |
| GET | `/api/v1/staff/stocktakes` | Danh sách được giao | ✅ | STAFF |
| GET | `/api/v1/staff/stocktakes/{id}` | Chi tiết phiếu | ✅ | STAFF |
| PUT | `/api/v1/staff/stocktakes/{id}/start` | Bắt đầu kiểm kê | ✅ | STAFF |
| PUT | `/api/v1/staff/stocktakes/{id}/items/{itemId}` | Nhập số lượng | ✅ | STAFF |
| PUT | `/api/v1/staff/stocktakes/{id}/submit` | Gửi báo cáo | ✅ | STAFF |
| PUT | `/api/v1/manager/stocktakes/{id}/approve` | Duyệt kiểm kê | ✅ | OWNER, MANAGER |

### **Finance APIs**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/workspaces/{tenantId}/finance` | Tài chính | ✅ | OWNER, ACCOUNTANT |
| GET | `/api/v1/workspaces/{tenantId}/reports/inventory` | Báo cáo kho | ✅ | OWNER, MANAGER, ACCOUNTANT |
| GET | `/api/v1/workspaces/{tenantId}/audit-logs` | Lịch sử | ✅ | OWNER, MANAGER, ACCOUNTANT, SALE |

### **Admin APIs**

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/admin/tenants` | Danh sách tenants | ✅ | SUPER_ADMIN |
| GET | `/api/admin/users` | Danh sách users | ✅ | SUPER_ADMIN |
| PUT | `/api/admin/tenants/{id}/status` | Cập nhật trạng thái | ✅ | SUPER_ADMIN |

---

## 🔐 Security Features

1. **JWT Authentication**
   - Token hết hạn 24 giờ
   - Mỗi request gửi JWT trong header: `Authorization: Bearer {token}`
   - Backend verify JWT trước khi xử lý

2. **Password Security**
   - Hash bằng BCrypt (mạnh)
   - Quên password → OTP qua email
   - OTP hết hạn 15 phút

3. **CORS Configuration**
   - Frontend (http://localhost:5173) được phép gọi Backend
   - Credentials (cookies, headers) được cho phép

4. **Role-Based Access Control (RBAC)**
   - Kiểm tra role trước khi xử lý
   - Không cho phép vượt quyền hạn

5. **Audit Logging**
   - Ghi lại tất cả hành động thay đổi dữ liệu
   - Khi nào, ai, làm gì, trước/sau

---

## 📱 Frontend Routes

```
/                           → Redirect to /login
/login                      → Login page
/register                   → Register page
/forgot-password            → Forgot password page
/accept-invitation?code=... → Accept invitation page
/dashboard                  → Workspace selector
/onboarding                 → Create new workspace

/workspace/:workspaceId              → Workspace layout
/workspace/:workspaceId/overview     → Overview page
/workspace/:workspaceId/products     → Products page
/workspace/:workspaceId/locations    → Locations page
/workspace/:workspaceId/inventory    → Inventory (Nhập/Xuất)
/workspace/:workspaceId/stocktake    → Stocktake page
/workspace/:workspaceId/finance      → Finance page
/workspace/:workspaceId/reports      → Reports page
/workspace/:workspaceId/orders       → Orders page
/workspace/:workspaceId/customers    → Customers page
/workspace/:workspaceId/personnel    → Personnel management
/workspace/:workspaceId/staff-tasks  → Staff tasks (for STAFF only)
/workspace/:workspaceId/audit-log    → Audit log
/workspace/:workspaceId/settings     → Settings

/admin                      → Super Admin dashboard
```

---

## 🚀 Quy trình Deploy

### **Local Development**

**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Chạy trên http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Chạy trên http://localhost:5173
```

**Database:**
```bash
# MongoDB phải chạy trên http://localhost:27017
# Database: optistock_db
```

---

## 📝 Tóm tắt Chức năng

| Tính năng | Mô tả |
|-----------|-------|
| **Authentication** | Đăng ký, đăng nhập, quên mật khẩu, Google OAuth |
| **Workspace Management** | Tạo workspace mới, chọn workspace, quản lý members |
| **Product Management** | Quản lý sản phẩm, categories, unit conversions |
| **Location Management** | Quản lý kho, kệ, vị trí, capacity tracking |
| **Stock Voucher** | Tạo phiếu nhập/xuất, quét barcode, cập nhật kho |
| **Stocktake** | Tạo phiếu kiểm kê, đếm hàng, duyệt kết quả |
| **Financial** | Xem tài chính, báo cáo giá trị kho |
| **Reporting** | Báo cáo kho, lịch sử, thống kê |
| **Real-time Notifications** | SSE events, thông báo member, phiếu, kiểm kê |
| **Audit Logging** | Ghi lại tất cả hành động |
| **Role-Based Access** | 5 vai trò với quyền hạn khác nhau |

---

## 📞 Contact & Support

- **Project**: OptiStock - Inventory Management System
- **Version**: 0.0.1-SNAPSHOT
- **Backend Port**: 8080
- **Frontend Port**: 5173
- **Database**: MongoDB (mongodb://localhost:27017/optistock_db)

---

**Document created**: 2026-03-11
**Last updated**: 2026-03-11
