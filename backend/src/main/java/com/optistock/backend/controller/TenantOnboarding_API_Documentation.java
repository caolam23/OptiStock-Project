/**
 * TENANT ONBOARDING APIs Documentation
 * 
 * ========================================
 * BƯỚC 1: TẠO TENANT MỚI
 * ========================================
 * Endpoint: POST /api/onboarding/step1
 * Auth: JWT Token (Authenticated)
 * 
 * Request Body:
 * {
 *   "companyName": "Kho Gia Dụng Hùng Phát",
 *   "businessType": "Retail",
 *   "phoneNumber": "0123456789",
 *   "website": "https://hungphat.com",
 *   "address": "123 Đường Lê Lợi, TP HCM",
 *   "taxId": "0123456789"
 * }
 * 
 * Response:
 * {
 *   "status": "SUCCESS",
 *   "message": "✓ Tạo Tenant thành công",
 *   "data": {
 *     "message": "✓ Tạo Tenant thành công",
 *     "tenantId": "65a1b2c3d4e5f6g7h8i9j0k1",
 *     "tenantCode": "kho-gia-dung-hung-phat",
 *     "companyName": "Kho Gia Dụng Hùng Phát",
 *     "userRole": "TENANT_ADMIN",
 *     "step": 1
 *   },
 *   "timestamp": 1705123456789
 * }
 * 
 * ========================================
 * BƯỚC 2: THIẾT LẬP MASTER DATA
 * ========================================
 * Endpoint: POST /api/onboarding/step2/:tenantId
 * Auth: JWT Token (Authenticated)
 * 
 * Request Body:
 * {
 *   "locations": [
 *     {
 *       "locationType": "WAREHOUSE",
 *       "name": "Kho Gia Dụng",
 *       "code": "WH001",
 *       "address": "123 Đường Lê Lợi"
 *     },
 *     {
 *       "locationType": "SHELF",
 *       "name": "Kệ A",
 *       "code": "SHELF_A"
 *     },
 *     {
 *       "locationType": "SHELF",
 *       "name": "Kệ B",
 *       "code": "SHELF_B"
 *     }
 *   ],
 *   "products": [
 *     {
 *       "productCode": "GD001",
 *       "productName": "Chậu gốm 20cm",
 *       "mainUnit": "Cái",
 *       "category": "Chậu",
 *       "description": "Chậu gốm kích thước 20cm"
 *     },
 *     {
 *       "productCode": "GD002",
 *       "productName": "Nước tưới cây 1L",
 *       "mainUnit": "Lít",
 *       "category": "Nước",
 *       "description": "Nước tưới cây giúp cây tăng trưởng"
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "status": "SUCCESS",
 *   "message": "✓ Thiết lập Master Data thành công",
 *   "data": {
 *     "message": "✓ Thiết lập Master Data thành công",
 *     "step": 2,
 *     "locationsCreated": 3,
 *     "locations": [...],
 *     "productsCreated": 2,
 *     "products": [...]
 *   }
 * }
 * 
 * ========================================
 * CẤU HÌNH UNIT CONVERSION
 * ========================================
 * Endpoint: POST /api/onboarding/unit-conversion/:tenantId/:productId
 * Auth: JWT Token (Authenticated)
 * 
 * Request Body:
 * {
 *   "fromUnit": "Thùng",
 *   "toUnit": "Chai",
 *   "factor": 24
 * }
 * 
 * Ví dụ: 1 Thùng = 24 Chai
 * 
 * Response:
 * {
 *   "status": "SUCCESS",
 *   "message": "Cấu hình Unit Conversion thành công",
 *   "data": {
 *     "id": "65a1b2c3d4e5f6g7h8i9j0k1",
 *     "tenantId": "65a1b2c3d4e5f6g7h8i9j0k1",
 *     "productId": "65a1b2c3d4e5f6g7h8i9j0k2",
 *     "fromUnit": "Thùng",
 *     "toUnit": "Chai",
 *     "conversionFactor": 24,
 *     "description": "1 Thùng = 24 Chai"
 *   }
 * }
 * 
 * ========================================
 * BƯỚC 3: GỬI LỜI MỜI THÀNH VIÊN
 * ========================================
 * Endpoint: POST /api/onboarding/step3/:tenantId
 * Auth: JWT Token (Authenticated)
 * 
 * Request Body:
 * {
 *   "invitations": [
 *     {
 *       "email": "staff@example.com",
 *       "role": "STAFF"
 *     },
 *     {
 *       "email": "accountant@example.com",
 *       "role": "ACCOUNTANT"
 *     },
 *     {
 *       "email": "manager@example.com",
 *       "role": "MANAGER"
 *     }
 *   ]
 * }
 * 
 * Available Roles: TENANT_ADMIN, STAFF, ACCOUNTANT, MANAGER
 * 
 * Response:
 * {
 *   "status": "SUCCESS",
 *   "message": "✓ Gửi 3 lời mời thành công",
 *   "data": {
 *     "message": "✓ Gửi 3 lời mời thành công",
 *     "step": 3,
 *     "invitationsSent": 3,
 *     "invitations": [
 *       {
 *         "id": "65a1b2c3d4e5f6g7h8i9j0k1",
 *         "tenantId": "65a1b2c3d4e5f6g7h8i9j0k1",
 *         "invitedEmail": "staff@example.com",
 *         "role": "STAFF",
 *         "status": "PENDING",
 *         "expiresAt": "2024-01-20T10:30:00"
 *       },
 *       ...
 *     ]
 *   }
 * }
 * 
 * Email được gửi với link:
 * http://localhost:5173/accept-invitation?code=INV-ABC123XYZ
 * 
 * ========================================
 * CHẤP NHẬN LỜI MỜI
 * ========================================
 * Endpoint: POST /api/onboarding/accept-invitation
 * Auth: JWT Token (Authenticated)
 * 
 * Request Body:
 * {
 *   "invitationCode": "INV-ABC123XYZ"
 * }
 * 
 * OR Frontend có thể extract code từ URL query parameter:
 * http://localhost:5173/accept-invitation?code=INV-ABC123XYZ
 * const params = new URLSearchParams(window.location.search);
 * const code = params.get('code');
 * 
 * Response:
 * {
 *   "status": "SUCCESS",
 *   "message": "✓ Chấp nhận lời mời thành công",
 *   "data": {
 *     "message": "✓ Chấp nhận lời mời thành công",
 *     "userEmail": "staff@example.com",
 *     "role": "STAFF",
 *     "tenantId": "65a1b2c3d4e5f6g7h8i9j0k1"
 *   }
 * }
 * 
 * ========================================
 * ERROR HANDLING
 * ========================================
 * 
 * 400 Bad Request:
 * {
 *   "status": "ERROR",
 *   "message": "Tên công ty không được để trống",
 *   "data": null,
 *   "timestamp": 1705123456789
 * }
 * 
 * 401 Unauthorized:
 * - User không được xác thực (không có JWT token)
 * 
 * 409 Conflict:
 * - Tên công ty đã tồn tại
 * - Mã location hoặc product bị trùng
 * - User đã trong Tenant này
 * 
 * ========================================
 * FLOW EXAMPLE (Frontend Perspective)
 * ========================================
 * 
 * 1. User đăng nhập thành công -> lấy JWT token
 * 
 * 2. User bấm "Tạo Kho Mới" -> Gọi Step1 API
 *    POST /api/onboarding/step1
 *    Body: { "companyName": "Kho Gia Dụng Hùng Phát", ... }
 *    Response: tenantId = "65a1b2c3d4e5f6g7h8i9j0k1"
 * 
 * 3. User thiết lập Locations & Products -> Gọi Step2 API
 *    POST /api/onboarding/step2/65a1b2c3d4e5f6g7h8i9j0k1
 *    Body: { "locations": [...], "products": [...] }
 * 
 * 4. Nếu cần Unit Conversion -> Gọi Unit Conversion API
 *    POST /api/onboarding/unit-conversion/65a1b2c3d4e5f6g7h8i9j0k1/{productId}
 *    Body: { "fromUnit": "Thùng", "toUnit": "Chai", "factor": 24 }
 * 
 * 5. User gửi lời mời thành viên -> Gọi Step3 API
 *    POST /api/onboarding/step3/65a1b2c3d4e5f6g7h8i9j0k1
 *    Body: { "invitations": [...] }
 * 
 * 6. Thành viên được mời nhận được email với link
 *    http://localhost:5173/accept-invitation?code=INV-ABC123XYZ
 * 
 * 7. Thành viên đăng nhập và bấm "Accept Invitation"
 *    POST /api/onboarding/accept-invitation
 *    Body: { "invitationCode": "INV-ABC123XYZ" }
 * 
 * ========================================
 * NOTES:
 * ========================================
 * 
 * 1. JWT Token phải được gửi trong header:
 *    Authorization: Bearer {token}
 * 
 * 2. CORS được cấu hình cho localhost:5173
 * 
 * 3. Lời mời có hiệu lực trong 7 ngày
 * 
 * 4. Email được gửi tự động khi lời mời được tạo
 *    (Cần cấu hình SMTP trong application.properties)
 * 
 * 5. User có thể có nhiều roles trong một hoặc nhiều Tenants
 * 
 * 6. Lấy Current User từ JWT Token:
 *    - Spring Security sẽ tự động populate SecurityContextHolder
 *    - Có thể lấy từ SecurityContextHolder.getContext().getAuthentication().getPrincipal()
 */
