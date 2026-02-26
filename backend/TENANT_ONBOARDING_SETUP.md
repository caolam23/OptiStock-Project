# TENANT ONBOARDING BACKEND SETUP

## 📋 Tổng Quan

Hệ thống Tenant Onboarding cho phép các user tạo kho mới, thiết lập master data, và mời các thành viên tham gia.

**3 Bước Chính:**
1. **Bước 1:** Tạo Tenant mới + gán role TENANT_ADMIN cho user
2. **Bước 2:** Thiết lập Master Data (Locations, Products, Unit Conversions)
3. **Bước 3:** Gửi lời mời thành viên

---

## 🗂️ Cấu Trúc Tệp

```
backend/src/main/java/com/optistock/backend/
├── model/
│   ├── Location.java              # Mô hình Kho/Kệ
│   ├── Product.java               # Mô hình Sản phẩm
│   ├── UnitConversion.java        # Mô hình Quy đổi đơn vị
│   └── Invitation.java            # Mô hình Lời mời
├── dto/
│   ├── LocationDTO.java
│   ├── ProductDTO.java
│   ├── UnitConversionDTO.java
│   ├── InvitationDTO.java
│   ├── TenantOnboardingRequest.java
│   ├── TenantOnboardingResponse.java
│   ├── CreateLocationRequest.java
│   ├── CreateProductRequest.java
│   ├── CreateUnitConversionRequest.java
│   └── SendInvitationRequest.java
├── repository/
│   ├── LocationRepository.java
│   ├── ProductRepository.java
│   ├── UnitConversionRepository.java
│   └── InvitationRepository.java
├── service/
│   ├── TenantOnboardingService.java
│   └── EmailService.java (cập nhật)
├── controller/
│   ├── TenantOnboardingController.java
│   └── TenantOnboarding_API_Documentation.java
├── util/
│   └── TenantOnboardingUtil.java
└── config/
    └── SecurityConfig.java (cập nhật)
```

---

## 🔧 Cấu Hình Cần Thiết

### 1. MongoDB

Đảm bảo MongoDB đang chạy:
```bash
# Windows
mongod

# Linux/Mac
brew services start mongodb-community
```

Kiểm tra trong `application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/optistock_db
```

### 2. Email Configuration

Cập nhật `application.properties` với Gmail SMTP:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=optistock53@gmail.com
spring.mail.password=btpg gaqv ojsb ylil
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 3. Security Configuration

`SecurityConfig.java` đã được cập nhật để cho phép:
- `/api/onboarding/**` - Endpoints onboarding (authenticated)

---

## 🚀 API Endpoints

### BƯỚC 1: Tạo Tenant

```
POST /api/onboarding/step1
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "companyName": "Kho Gia Dụng Hùng Phát",
  "businessType": "Retail",
  "phoneNumber": "0123456789",
  "website": "https://hungphat.com",
  "address": "123 Đường Lê Lợi, TP HCM",
  "taxId": "0123456789"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "✓ Tạo Tenant thành công",
  "data": {
    "tenantId": "65a1b2c3...",
    "tenantCode": "kho-gia-dung-hung-phat",
    "companyName": "Kho Gia Dụng Hùng Phát",
    "userRole": "TENANT_ADMIN",
    "step": 1
  }
}
```

### BƯỚC 2: Thiết lập Master Data

#### A. Tạo Locations & Products

```
POST /api/onboarding/step2/{tenantId}
Authorization: Bearer {JWT_TOKEN}

{
  "locations": [
    {
      "locationType": "WAREHOUSE",
      "name": "Kho Gia Dụng",
      "code": "WH001",
      "address": "123 Đường Lê Lợi"
    },
    {
      "locationType": "SHELF",
      "name": "Kệ A",
      "code": "SHELF_A"
    }
  ],
  "products": [
    {
      "productCode": "GD001",
      "productName": "Chậu gốm 20cm",
      "mainUnit": "Cái",
      "category": "Chậu"
    },
    {
      "productCode": "GD002",
      "productName": "Nước tưới cây 1L",
      "mainUnit": "Lít",
      "category": "Nước"
    }
  ]
}
```

#### B. Cấu hình Unit Conversion

```
POST /api/onboarding/unit-conversion/{tenantId}/{productId}
Authorization: Bearer {JWT_TOKEN}

{
  "fromUnit": "Thùng",
  "toUnit": "Chai",
  "factor": 24
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Cấu hình Unit Conversion thành công",
  "data": {
    "id": "65a1b2c3...",
    "fromUnit": "Thùng",
    "toUnit": "Chai",
    "conversionFactor": 24,
    "description": "1 Thùng = 24 Chai"
  }
}
```

### BƯỚC 3: Gửi Lời Mời

```
POST /api/onboarding/step3/{tenantId}
Authorization: Bearer {JWT_TOKEN}

{
  "invitations": [
    {
      "email": "staff@example.com",
      "role": "STAFF"
    },
    {
      "email": "accountant@example.com",
      "role": "ACCOUNTANT"
    },
    {
      "email": "manager@example.com",
      "role": "MANAGER"
    }
  ]
}
```

**Available Roles:**
- `TENANT_ADMIN` - Quản trị viên kho
- `STAFF` - Nhân viên kho
- `ACCOUNTANT` - Kế toán
- `MANAGER` - Quản lý kho

### Chấp Nhận Lời Mời

```
POST /api/onboarding/accept-invitation
Authorization: Bearer {JWT_TOKEN}

{
  "invitationCode": "INV-ABC123XYZ"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "✓ Chấp nhận lời mời thành công",
  "data": {
    "userEmail": "staff@example.com",
    "role": "STAFF",
    "tenantId": "65a1b2c3..."
  }
}
```

---

## 💻 Frontend Integration

### 1. Step 1 - Tạo Tenant

```javascript
const response = await fetch('http://localhost:8080/api/onboarding/step1', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    companyName: 'Kho Gia Dụng Hùng Phát',
    businessType: 'Retail',
    phoneNumber: '0123456789',
    website: 'https://hungphat.com',
    address: '123 Đường Lê Lợi',
    taxId: '0123456789'
  })
});

const data = await response.json();
const tenantId = data.data.tenantId;
```

### 2. Step 2 - Thiết lập Master Data

```javascript
const response = await fetch(`http://localhost:8080/api/onboarding/step2/${tenantId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    locations: [
      { locationType: 'WAREHOUSE', name: 'Kho', code: 'WH001' }
    ],
    products: [
      { productCode: 'GD001', productName: 'Chậu', mainUnit: 'Cái' }
    ]
  })
});
```

### 3. Step 3 - Gửi Lời Mời

```javascript
const response = await fetch(`http://localhost:8080/api/onboarding/step3/${tenantId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invitations: [
      { email: 'staff@example.com', role: 'STAFF' },
      { email: 'accountant@example.com', role: 'ACCOUNTANT' }
    ]
  })
});
```

### 4. Chấp Nhận Lời Mời

```javascript
// Lấy code từ URL
const params = new URLSearchParams(window.location.search);
const code = params.get('code'); // INV-ABC123XYZ

const response = await fetch('http://localhost:8080/api/onboarding/accept-invitation', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ invitationCode: code })
});
```

---

## 📧 Email Configuration

Khi gửi lời mời, user sẽ nhận email với link:
```
http://localhost:5173/accept-invitation?code=INV-ABC123XYZ
```

Email được gửi qua Gmail SMTP (đã cấu hình trong `application.properties`).

### Test Email (Local)

Nếu muốn test không gửi email thực, có thể modify `TenantOnboardingService.sendInvitationEmail()` để logs thay vì gửi.

---

## ✅ Validation Rules

### Tenant Onboarding:
- ✓ Company name không được rỗng
- ✓ Company name phải unique
- ✓ Tenant ID được generate tự động từ company name

### Location:
- ✓ Location type: `WAREHOUSE` hoặc `SHELF`
- ✓ Location code phải unique trong Tenant
- ✓ Name không được rỗng

### Product:
- ✓ Product code phải unique trong Tenant
- ✓ Product name không được rỗng
- ✓ Main unit không được rỗng

### Unit Conversion:
- ✓ Conversion factor phải > 0
- ✓ From unit và To unit không được rỗng

### Invitation:
- ✓ Email phải valid
- ✓ Role phải trong danh sách: TENANT_ADMIN, STAFF, ACCOUNTANT, MANAGER
- ✓ Lời mời hết hạn sau 7 ngày
- ✓ Không thể gửi lời mời cho user đã trong Tenant

---

## 🧪 Testing

### cURL Example:

```bash
# Step 1: Tạo Tenant
curl -X POST http://localhost:8080/api/onboarding/step1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Kho Test",
    "businessType": "Retail",
    "phoneNumber": "0123456789"
  }'

# Step 2: Thiết lập Master Data
curl -X POST http://localhost:8080/api/onboarding/step2/TENANT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      { "locationType": "WAREHOUSE", "name": "Kho", "code": "WH001" }
    ],
    "products": [
      { "productCode": "P001", "productName": "Product", "mainUnit": "Cái" }
    ]
  }'

# Step 3: Gửi Lời Mời
curl -X POST http://localhost:8080/api/onboarding/step3/TENANT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invitations": [
      { "email": "test@example.com", "role": "STAFF" }
    ]
  }'
```

---

## 🔐 Security

- Tất cả endpoints đều require JWT authentication
- CORS được cấu hình cho `http://localhost:5173`
- User chỉ có thể quản lý Tenant của họ (enforce qua service layer)
- Lời mời có mã code unique và hết hạn sau 7 ngày

---

## 📝 Database Collections

Các collection MongoDB được tạo tự động:
- `tenants` - Thông tin Tenant
- `users` - Thông tin User
- `locations` - Kho/Kệ
- `products` - Sản phẩm
- `unit_conversions` - Quy đổi đơn vị
- `invitations` - Lời mời

---

## 🐛 Troubleshooting

### Email không được gửi
- Kiểm tra `application.properties` có SMTP config không
- Kiểm tra network có thể kết nối gmail.com:587 không
- Kiểm tra logs console xem error message gì

### Tenant code bị trùng
- Sử dụng tên company khác hoặc thêm suffix

### JWT Token expires
- Frontend cần refresh token trước khi gọi API

---

## 📞 Support

Liên hệ team backend nếu có vấn đề về API hoặc logic.
