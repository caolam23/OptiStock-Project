# Tenant Onboarding V2 API Documentation

## Overview

**Single-Endpoint Consolidated Onboarding** - Refactored from multi-step flow to atomic one-shot onboarding with Industry Templates.

### Key Features
- ✅ **One-Shot Onboarding**: Frontend aggregates all 4 steps into single API call
- ✅ **Industry Templates**: 5 pre-configured templates (electronics, fmcg, fashion, pharmacy, fnb)
- ✅ **Atomic Transactions**: All-or-nothing with automatic rollback on error
- ✅ **Clean Architecture**: Lombok-powered models, Service/Repository pattern
- ✅ **Email Integration**: Automatic invitation emails with unique codes

---

## API Endpoint

### POST /api/v1/onboarding/tenant

**Authorization**: Required (JWT Token)  
**Status Code**: 201 (Created) on success, 400/401/500 on error  
**Content-Type**: application/json

---

## Request Schema

```json
{
  "tenantName": "string (required, non-empty)",
  "industryCode": "string (required, one of: electronics, fmcg, fashion, pharmacy, fnb)",
  "locations": [
    {
      "name": "string (required)",
      "type": "string (required, e.g., DISPLAY, STORAGE, REPAIR, STAGING, INSPECTION)",
      "capacity": "integer (optional)",
      "description": "string (optional)"
    }
  ],
  "tenantSettings": {
    "requireSerialTracking": "boolean (optional)",
    "requireExpiryDate": "boolean (optional)",
    "enableBom": "boolean (optional)",
    "enableLotTracking": "boolean (optional)",
    "requireBatchExpiry": "boolean (optional)",
    "enableInventoryTracking": "boolean (optional)",
    "enableStockAdjustment": "boolean (optional)",
    "enableAutoReorder": "boolean (optional)",
    "reorderThreshold": "integer (optional)",
    "enableMultipleUnitConversion": "boolean (optional)",
    "enablePriceAdjustment": "boolean (optional)",
    "enableCostTracking": "boolean (optional)",
    "customSettings": "object (optional, flexible key-value)" 
  },
  "invites": [
    {
      "email": "string (required, valid email)",
      "role": "string (required, e.g., WAREHOUSE_STAFF, ACCOUNTANT, MANAGER)"
    }
  ],
  "phoneNumber": "string (optional)",
  "website": "string (optional)",
  "address": "string (optional)",
  "taxId": "string (optional)"
}
```

---

## Response Schema

### Success Response (201 Created)

```json
{
  "status": "SUCCESS",
  "message": "✓ Khởi tạo Tenant thành công",
  "data": {
    "tenantId": "string (unique tenant code, kebab-case)",
    "tenantCode": "string (same as tenantId)",
    "tenantName": "string",
    "industryCode": "string",
    "locationsCreated": "integer",
    "invitationsSent": "integer",
    "locations": [
      {
        "id": "string (MongoDB ObjectId)",
        "name": "string",
        "type": "string",
        "capacity": "integer"
      }
    ],
    "invitations": [
      {
        "id": "string",
        "email": "string",
        "role": "string",
        "status": "PENDING",
        "code": "string (INV-12chars)"
      }
    ],
    "settings": {
      "requireSerialTracking": "boolean",
      "requireExpiryDate": "boolean",
      "enableBom": "boolean"
    }
  },
  "timestamp": "2024-02-23T10:30:00"
}
```

### Error Response (400 / 401 / 500)

```json
{
  "status": "ERROR | VALIDATION_ERROR",
  "message": "string (error description)",
  "timestamp": "2024-02-23T10:30:00"
}
```

---

## Industry Templates

### 1. Electronics
- **Locations**: DISPLAY (100), STORAGE (500), REPAIR (50)
- **Key Settings**: requireSerialTracking=true, enableBom=true, requireExpiryDate=false
- **Use Case**: Electronics retailers, serial number tracking required

### 2. FMCG (Fast-Moving Consumer Goods)
- **Locations**: STORAGE (1000), STORAGE (300-cold), INSPECTION (100), STAGING (50)
- **Key Settings**: requireExpiryDate=true, enableLotTracking=true, enableAutoReorder=true
- **Use Case**: Beverages, snacks, requires expiry management

### 3. Fashion
- **Locations**: STORAGE (3 by category), DISPLAY (100)
- **Key Settings**: enablePriceAdjustment=true, requireSerialTracking=false
- **Use Case**: Clothing retailers, no serial/expiry needed

### 4. Pharmacy
- **Locations**: STORAGE (200), DISPLAY (50), INSPECTION (30)
- **Key Settings**: requireSerialTracking=true, requireExpiryDate=true, requireBatchExpiry=true
- **Use Case**: Pharmacies, strict regulations on batch and expiry date

### 5. FNB (Food & Beverage)
- **Locations**: STORAGE-cold (500), STORAGE (300), STAGING (50), DISPLAY (100)
- **Key Settings**: enableBom=true, requireExpiryDate=true, enableAutoReorder=true
- **Use Case**: Restaurants, cafes, temperature-controlled storage

---

## Request Examples

### Example 1: Electronics Retail

```bash
POST /api/v1/onboarding/tenant HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenantName": "Kho Điện Thoại Hùng Phát",
  "industryCode": "electronics",
  "locations": [
    { "name": "Tủ Trưng Bày 1", "type": "DISPLAY", "capacity": 100 },
    { "name": "Kho Máy Mới", "type": "STORAGE", "capacity": 500 }
  ],
  "tenantSettings": {
    "requireSerialTracking": true
  },
  "invites": [
    { "email": "nam.kho@gmail.com", "role": "WAREHOUSE_STAFF" },
    { "email": "mai.ketoan@gmail.com", "role": "ACCOUNTANT" }
  ],
  "phoneNumber": "0908123456",
  "address": "123 Nguyen Hue, HCMC"
}
```

### Example 2: FMCG (Beverage)

```bash
POST /api/v1/onboarding/tenant HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenantName": "Kho Nước Ngọt Phương Nam",
  "industryCode": "fmcg",
  "locations": [
    { "name": "Kho Thường", "type": "STORAGE", "capacity": 1000 },
    { "name": "Kho Lạnh", "type": "STORAGE", "capacity": 300 },
    { "name": "Khu Kiểm Tra", "type": "INSPECTION", "capacity": 100 }
  ],
  "tenantSettings": {
    "requireExpiryDate": true,
    "enableAutoReorder": true,
    "reorderThreshold": 10
  },
  "invites": [
    { "email": "quan.ly@app.com", "role": "MANAGER" }
  ]
}
```

### Example 3: Using Template Defaults (Minimal)

```bash
POST /api/v1/onboarding/tenant HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenantName": "Nhà Hàng Phương Tây",
  "industryCode": "fnb",
  "locations": [],
  "tenantSettings": {},
  "invites": []
}
```
*Note: Empty locations and settings will use template defaults*

---

## Response Examples

### Success Response

```json
{
  "status": "SUCCESS",
  "message": "✓ Khởi tạo Tenant thành công",
  "data": {
    "tenantId": "kho-dien-thoai-hung-phat",
    "tenantCode": "kho-dien-thoai-hung-phat",
    "tenantName": "Kho Điện Thoại Hùng Phát",
    "industryCode": "electronics",
    "locationsCreated": 2,
    "invitationsSent": 2,
    "locations": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Tủ Trưng Bày 1",
        "type": "DISPLAY",
        "capacity": 100
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Kho Máy Mới",
        "type": "STORAGE",
        "capacity": 500
      }
    ],
    "invitations": [
      {
        "id": "507f1f77bcf86cd799439013",
        "email": "nam.kho@gmail.com",
        "role": "WAREHOUSE_STAFF",
        "status": "PENDING",
        "code": "INV-ABC12X34DE56"
      },
      {
        "id": "507f1f77bcf86cd799439014",
        "email": "mai.ketoan@gmail.com",
        "role": "ACCOUNTANT",
        "status": "PENDING",
        "code": "INV-XYZ78Q91RS23"
      }
    ],
    "settings": {
      "requireSerialTracking": true,
      "requireExpiryDate": false,
      "enableBom": true
    }
  },
  "timestamp": "2024-02-23T10:30:45"
}
```

### Validation Error Response

```json
{
  "status": "VALIDATION_ERROR",
  "message": "Tên Tenant không được để trống",
  "timestamp": "2024-02-23T10:30:45"
}
```

### Unauthorized Response

```json
{
  "status": "ERROR",
  "message": "User không được xác thực",
  "timestamp": "2024-02-23T10:30:45"
}
```

---

## Backend Processing Flow

1. **Validate Request**
   - Check tenantName not empty
   - Check industryCode valid (must exist in IndustryTemplateConfig)
   - Check at least 1 location provided
   - Validate email format in invitations

2. **Extract User from JWT**
   - Retrieve userId from SecurityContextHolder
   - Load User object from database
   - Confirm user is authenticated

3. **Create Tenant Document**
   - Generate unique tenantId (kebab-case from name)
   - Check tenantId not already exists
   - Create Tenant with status=ACTIVE, subscriptionPlan=FREE

4. **Build TenantSettings**
   - Merge request.tenantSettings with template defaults
   - Load IndustryTemplateConfig for industryCode
   - Apply template overrides

5. **Create Locations**
   - Use provided locations OR load from template
   - Batch save via locationRepository.saveAll()
   - Initialize with capacity, isActive=true, currentCount=0

6. **Update User**
   - Add TENANT_ADMIN role
   - Link user to tenantId
   - Update updatedAt timestamp
   - Save user with new role/tenant

7. **Send Invitations**
   - For each invite email:
     - Validate email format
     - Check if already member of tenant
     - Generate unique invitationCode (INV-{12 random chars})
     - Create Invitation document
     - Send HTML email with invitation link

8. **Build Response**
   - Convert saved entities to DTOs
   - Calculate locations and invitations counts
   - Return 201 CREATED with full onboarding data

---

## Transaction Guarantee

All operations execute within `@Transactional` context:
- ✅ All-or-Nothing: Either all documents created or all rolled back
- ✅ On Exception: MongoDB transaction automatically rolls back
- ✅ No Partial State: Tenant + Locations + Settings + User role all succeed or all fail

---

## Error Codes & Messages

| Status | Code | Message | HTTP |
|--------|------|---------|------|
| ✅ SUCCESS | 0 | Khởi tạo Tenant thành công | 201 |
| ❌ VALIDATION | 400 | Tên Tenant không được để trống | 400 |
| ❌ VALIDATION | 400 | Mã ngành hàng không hợp lệ | 400 |
| ❌ VALIDATION | 400 | Phải có ít nhất 1 location | 400 |
| ❌ VALIDATION | 400 | Email không hợp lệ | 400 |
| ❌ UNAUTHORIZED | 401 | User không được xác thực | 401 |
| ❌ CONFLICT | 409 | Tên Tenant '" + name + "' đã tồn tại | 409 |
| ❌ SERVER ERROR | 500 | Lỗi khởi tạo Tenant: {error} | 500 |

---

## Security

- ✅ JWT Authentication Required
- ✅ User validation before tenant creation
- ✅ Email validation for invitations
- ✅ CORS enabled for http://localhost:5173
- ✅ POST method (no sensitive data in URL)

---

## Integration with Frontend

Frontend should:
1. Collect all 4 steps data in form
2. Aggregate into single TenantOnboardingRequestV2 payload
3. POST to /api/v1/onboarding/tenant with JWT Bearer token
4. Parse response and extract tenantId + invitations sent
5. Display success message to user

---

## Database Collections

- **tenants**: Stores Tenant documents (1 per business)
- **tenant_settings**: Stores TenantSettings (1:1 with Tenant)
- **locations**: Stores Locations (many per Tenant)
- **users**: Updated with tenantId and TENANT_ADMIN role
- **invitations**: Stores Invitations (many per Tenant)

---

## Configuration Files

### Application Properties (optional overrides)
```properties
app.onboarding.email.enabled=true
app.onboarding.invitation.expiry-days=7
app.onboarding.tenant-code.max-length=50
```

### SecurityConfig
Route `/api/v1/onboarding/**` requires authentication

---

## Testing Checklist

- [ ] POST with valid single-step aggregated request
- [ ] Verify 201 status + tenantId generated
- [ ] Verify Tenant document created in MongoDB
- [ ] Verify Locations batch created
- [ ] Verify User assigned TENANT_ADMIN role
- [ ] Verify Invitations sent with code
- [ ] Verify email received by invitees
- [ ] Test with invalid industryCode (400)
- [ ] Test with empty tenantName (400)
- [ ] Test with no authentication header (401)
- [ ] Test with duplicate tenantName (409)
- [ ] Verify rollback on location creation error

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2024-02-23 | Single-endpoint with Industry Templates, atomic transaction, Lombok models |
| 1.0 | 2024-02-20 | Multi-endpoint 3-step flow (deprecated) |

---

## Support

For issues or questions:
- Check backend logs: `./mvnw.cmd spring-boot:run`
- Verify MongoDB is running and accessible
- Check SecurityConfig JWT filter configuration
- Verify EmailService MimeMessage setup

