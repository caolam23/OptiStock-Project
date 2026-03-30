# 📋 Phân Tích Chi Tiết Chức Năng MANAGER - OptiStock

**Ngày phân tích**: 11/03/2026  
**Tác giả**: System Analysis  
**Phiên bản**: 1.0

---

## 📑 MỤC LỤC

1. [Tổng quan vai trò MANAGER](#tổng-quan-vai-trò-manager)
2. [Chức năng MANAGER hiện tại](#chức-năng-manager-hiện-tại)
3. [Chi tiết từng chức năng](#chi-tiết-từng-chức-năng)
4. [Chức năng đề xuất mới](#chức-năng-đề-xuất-mới)
5. [Lộ trình triển khai](#lộ-trình-triển-khai)
6. [API Endpoints cần thêm](#api-endpoints-cần-thêm)

---

## 🎯 Tổng quan vai trò MANAGER

### Đặc điểm
- **Mục đích**: Quản lý hoạt động dạo hàng ngày của kho hàng
- **Cấp độ**: Trung cấp (giữa OWNER và STAFF)
- **Phạm vi quyết định**: Tạo các phiếu, giao nhiệm vụ cho STAFF, duyệt kết quả

### Quyền hạn cơ bản
```
┌─────────────────────────────────────────┐
│         MANAGER WORKSPACE ROLES          │
├─────────────────────────────────────────┤
│ ✅ Quản lý sản phẩm (CRUD)               │
│ ✅ Quản lý vị trí kho (CRUD)             │
│ ✅ Tạo phiếu nhập/xuất                  │
│ ✅ Tạo phiếu kiểm kê                    │
│ ✅ Duyệt hasil kiểm kê                  │
│ ✅ Giao nhiệm vụ cho STAFF              │
│ ✅ Quản lý members (STAFF/ACCOUNTANT)   │
│ ✅ Xem báo cáo                          │
│ ✅ Xem lịch sử phiếu & kiểm kê          │
│ ❌ Xem tài chính (chỉ OWNER/ACCOUNTANT) │
│ ❌ Quản lý settings (chỉ OWNER)         │
│ ❌ Quản lý audit log (chỉ OWNER)        │
│ ❌ Xóa workspace (chỉ OWNER)            │
└─────────────────────────────────────────┘
```

---

## ✅ Chức năng MANAGER hiện tại

### **Tóm tắt nhanh**

| # | Chức năng | Frontend | Backend | Status |
|---|-----------|----------|---------|--------|
| 1 | Xem sản phẩm | Products.jsx | ProductRepository | ✅ Hoạt động |
| 2 | Tạo sản phẩm | Products.jsx | ProductService | ✅ Hoạt động |
| 3 | Sửa sản phẩm | Products.jsx | ProductService | ✅ Hoạt động |
| 4 | Xóa sản phẩm | Products.jsx | ProductService | ✅ Hoạt động |
| 5 | Xem vị trí | Locations.jsx | LocationRepository | ✅ Hoạt động |
| 6 | Tạo vị trí | Locations.jsx | LocationService | ✅ Hoạt động |
| 7 | Sửa vị trí | Locations.jsx | LocationService | ✅ Hoạt động |
| 8 | Xóa vị trí | Locations.jsx | LocationService | ✅ Hoạt động |
| 9 | Xem phiếu nhập/xuất | Inventory.jsx | ManagerVoucherController | ✅ Hoạt động |
| 10 | Chi tiết phiếu | ProcessVoucher.jsx | ManagerVoucherController | ✅ Hoạt động |
| 11 | Tạo phiếu mới | CreateVoucherModal.jsx | ManagerVoucherService | ✅ Hoạt động |
| 12 | Filter phiếu | Inventory.jsx | Frontend only | ✅ Hoạt động |
| 13 | Xem kiểm kê | Stocktake.jsx | ManagerStocktakeController | ✅ Hoạt động |
| 14 | Chi tiết kiểm kê | StocktakeDetail.jsx | ManagerStocktakeController | ✅ Hoạt động |
| 15 | Duyệt kiểm kê | StocktakeDetail.jsx | ManagerStocktakeService | ✅ Hoạt động |
| 16 | Xem members | Personnel.jsx | PersonnelService | ✅ Hoạt động |
| 17 | Mời members | Personnel.jsx | PersonnelService | ✅ Hoạt động (nhưng giới hạn) |
| 18 | Sửa role members | Personnel.jsx | PersonnelService | ✅ Hoạt động (nhưng giới hạn) |
| 19 | Xóa members | Personnel.jsx | PersonnelService | ✅ Hoạt động (nhưng giới hạn) |
| 20 | Xem báo cáo | Reports.jsx | ReportService | ⏳ Placeholder |
| 21 | Xem tổng quan | Overview.jsx | WorkspaceService | ⏳ Placeholder |

---

## 📌 Chi tiết từng chức năng

### **A. QUẢN LÝ SẢN PHẨM (Product Management)**

#### ✅ 1. Xem danh sách sản phẩm
- **Trang**: `/workspace/:workspaceId/products`
- **Component**: `Products.jsx`
- **UI**: DataTable hiển thị tất cả sản phẩm
- **Hiển thị**: 
  - Mã sản phẩm (SKU)
  - Tên sản phẩm
  - Danh mục
  - Tồn kho hiện tại
  - Giá bán
  - Giá vốn
  - Đơn vị tính
  - Min/Max stock
- **Filter**: Theo danh mục, trạng thái (active/inactive)
- **Search**: Theo mã/tên sản phẩm

#### ✅ 2. Tạo sản phẩm mới
- **Endpoint**: `POST /api/v1/workspaces/{tenantId}/products`
- **Input**:
  ```json
  {
    "productCode": "SKU-LP-001",
    "productName": "Nước ngọt Coca 1.5L",
    "category": "Đồ uống",
    "description": "Nước ngọt có gas",
    "mainUnit": "Chai",
    "price": 25000,
    "cost": 15000,
    "minStock": 50,
    "maxStock": 500,
    "supplier": "Tập đoàn Coca Cola"
  }
  ```
- **Validation**:
  - SKU không được trùng trong workspace
  - Giá bán > 0
  - Giá vốn > 0
  - Min stock >= 0, Max stock > Min stock
- **Notification**: Thêm thành công → refresh danh sách

#### ✅ 3. Cập nhật sản phẩm
- **Endpoint**: `PUT /api/v1/workspaces/{tenantId}/products/{productId}`
- **Cho phép thay đổi**: Tên, danh mục, giá, min/max stock, supplier
- **KHÔNG cho thay đổi**: Product Code (SKU) - để tránh lỗi trong phiếu tồn tại
- **Cảnh báo**: Nếu thay đổi price/cost → liên hệ kế toán

#### ✅ 4. Xóa sản phẩm (Soft Delete)
- **Endpoint**: `DELETE /api/v1/workspaces/{tenantId}/products/{productId}`
- **Cơ chế**: Soft delete (isActive = false, deletedAt = now)
- **Lợi ích**: Giữ lịch sử phiếu cũ, không phá vỡ dữ liệu
- **Điều kiện**:
  - Không cho xóa nếu vẫn có tồn kho > 0 (phải xuất hết trước)
  - Có lựa chọn "Force delete" nếu muốn (lưu ý dữ liệu cũ)

---

### **B. QUẢN LÝ VỊ TRÍ KÊNH (Location Management)**

#### ✅ 5. Xem danh sách vị trí
- **Trang**: `/workspace/:workspaceId/locations`
- **Component**: `Locations.jsx`
- **Hiển thị**:
  - Tên vị trí (Kho A, Kệ B1, Quầy bán...)
  - Loại vị trí (STORAGE, DISPLAY, REPAIR, INSPECTION, STAGING)
  - Công suất (capacity)
  - Số lượng hiện tại (currentCount)
  - Trạng thái (active/inactive)
  - Mô tả

#### ✅ 6. Tạo vị trí mới
- **Endpoint**: `POST /api/v1/workspaces/{tenantId}/locations`
- **Input**:
  ```json
  {
    "name": "Kho lạnh B2",
    "code": "STORAGE-B2",
    "type": "STORAGE",
    "capacity": 1000,
    "description": "Kho lạnh bảo quản thực phẩm đông lạnh"
  }
  ```
- **Loại vị trí cho phép**:
  - `STORAGE`: Kho lưu trữ (nơi để hàng chính)
  - `DISPLAY`: Quầy bán (nơi bán hàng)
  - `REPAIR`: Kho sửa chữa
  - `INSPECTION`: Vị trí kiểm tra chất lượng
  - `STAGING`: Vị trí chuẩn bị

#### ✅ 7. Cập nhật vị trí
- **Cho phép thay đổi**: Tên, capacity, mô tả, trạng thái
- **KHÔNG thay đổi**: Code (để không phá vỡ phiếu cũ)

#### ✅ 8. Xóa vị trí (Soft Delete)
- **Điều kiện**:
  - Không cho xóa nếu vẫn có hàng (currentCount > 0)
  - Không cho xóa nếu vẫn có phiếu kiểm kê chưa hoàn tát

---

### **C. QUẢN LÝ PHIẾU NHẬP/XUẤT (Stock Voucher Management)**

#### ✅ 9. Xem danh sách phiếu
- **Trang**: `/workspace/:workspaceId/inventory`
- **Component**: `Inventory.jsx`
- **Hiển thị**: 
  - Mã phiếu (PN-001, PX-055...)
  - Tiêu đề/Ghi chú
  - Loại (INBOUND, OUTBOUND, TRANSFER)
  - Trạng thái (PENDING, PROCESSING, COMPLETED, CANCELLED)
  - Priority (HIGH, NORMAL, LOW)
  - Ngày tạo
  - STAFF được giao
  - Tiến độ (X/Y items completed)

#### ✅ 10. Xem chi tiết phiếu
- **Route**: `/workspace/:workspaceId/voucher/:voucherId`
- **Component**: `ProcessVoucher.jsx`
- **Cho MANAGER xem**:
  - Danh sách SP cần xử lý
  - Số lượng dự kiến
  - Số lượng đã quét (nếu STAFF đang xử lý)
  - Tiến độ hoàn tất
  - Người được giao
  - Người đã xử lý

#### ✅ 11. Tạo phiếu nhập/xuất mới
- **Modal**: `CreateVoucherModal.jsx`
- **Endpoint**: `POST /api/v1/manager/vouchers`
- **Quy trình**:
  ```
  MANAGER click "Tạo phiếu mới"
    ↓
  Chọn loại: INBOUND (Nhập) / OUTBOUND (Xuất)
    ↓
  Nhập tiêu đề: "Nhập hàng từ NCC A"
    ↓
  Chọn priority: HIGH/NORMAL/LOW
    ↓
  Chọn sản phẩm (có thể chọn nhiều)
    ├─ Mã sản phẩm
    ├─ Tên sản phẩm
    └─ Số lượng dự kiến
    ↓
  Chọn STAFF xử lý (assign)
    ↓
  Ghi chú thêm (nếu cần)
    ↓
  Submit → Tạo StockVoucher record
    ↓
  Status: PENDING
    ↓
  SSE Notification gửi cho STAFF
    ↓
  ✅ Thành công
  ```

- **Mã phiếu tự động**:
  - INBOUND: `PN-001, PN-002, ...` (Phiếu Nhập)
  - OUTBOUND: `PX-001, PX-002, ...` (Phiếu Xuất)

#### ✅ 12. Lọc & Tìm kiếm phiếu
- **Filter theo**:
  - Loại: INBOUND / OUTBOUND / TRANSFER
  - Trạng thái: PENDING / PROCESSING / COMPLETED / CANCELLED
  - Priority: HIGH / NORMAL / LOW
  - STAFF được giao
- **Search**: Theo mã phiếu, tiêu đề

---

### **D. QUẢN LÝ KIỂM KÊ (Stocktake Management)**

#### ✅ 13. Xem danh sách phiếu kiểm kê
- **Trang**: `/workspace/:workspaceId/stocktake`
- **Component**: `Stocktake.jsx`
- **Hiển thị**:
  - Mã phiếu (KK-001, KK-002...)
  - Tiêu đề
  - Vị trí cần kiểm kê
  - Trạng thái (PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED)
  - STAFF được giao
  - Ngày tạo
  - Ngày hoàn tát (nếu có)

#### ✅ 14. Xem chi tiết phiếu kiểm kê
- **Route**: `/workspace/:workspaceId/stocktake/:ticketId`
- **Component**: `StocktakeDetail.jsx`
- **MANAGER thấy**:
  - Danh sách sản phẩm cần kiểm kê
  - `systemQuantity` (số lượng trong hệ thống)
  - `actualQuantity` (số lượng STAFF đếm được - nếu đã submit)
  - `discrepancy` (chênh lệch = actual - system)
  - Ghi chú của STAFF (nếu có)

#### ✅ 15. Duyệt kiểm kê (Approve/Reject)
- **Endpoint**: `PUT /api/v1/manager/stocktakes/{ticketId}/approve`
- **Function**:
  - MANAGER xem chi tiết chênh lệch
  - Có 2 lựa chọn:
    - **APPROVE**: 
      - Status → APPROVED
      - Cập nhật `Product.currentStock = actualQuantity`
      - Tạo audit log ("Kiểm kê được duyệt bởi Manager A")
      - Gửi thông báo cho STAFF
    - **REJECT**:
      - Status → REJECTED
      - Gửi lại cho STAFF với ghi chú ("Kiểm tra lại kệ A, có chênh lệch quá lớn")
      - STAFF phải đếm lại từ đầu

---

### **E. QUẢN LÝ NHÂN SỰ (Personnel Management)**

#### ✅ 16. Xem danh sách members
- **Trang**: `/workspace/:workspaceId/personnel`
- **Component**: `Personnel.jsx`
- **Hiển thị**:
  - Email
  - Tên đầy đủ
  - Role hiện tại (OWNER, MANAGER, STAFF, ACCOUNTANT, SALE)
  - Ngày tham gia
  - Avatar

#### ✅ 17. Mời members mới (với giới hạn)
- **Endpoint**: `POST /api/v1/workspaces/{tenantId}/personnel/invitations`
- **QUY TẮC** (Đặc biệt cho MANAGER):
  ```
  ┌─────────────────────────────────────┐
  │   MANAGER có thể mời:                │
  ├─────────────────────────────────────┤
  │ ✅ STAFF       (Nhân viên kho)       │
  │ ✅ ACCOUNTANT  (Kế toán)             │
  │ ✅ SALE        (Bán hàng)            │
  │ ❌ MANAGER     (Không thể mời)       │
  │ ❌ OWNER       (Không thể mời)       │
  └─────────────────────────────────────┘
  ```
- **Quy trình**:
  - Nhập email người được mời
  - Chọn role từ dropdown (chỉ STAFF/ACCOUNTANT/SALE)
  - Gửi lời mời → Email với link `/accept-invitation?code=...`

#### ✅ 18. Sửa role members (với giới hạn)
- **Endpoint**: `PUT /api/v1/workspaces/{tenantId}/personnel/members/{memberId}`
- **QUY TẮC**:
  ```
  ┌──────────────────────────────────────────────┐
  │ MANAGER chỉ được đổi role cho:               │
  ├──────────────────────────────────────────────┤
  │ ✅ STAFF     → ACCOUNTANT / SALE / STAFF     │
  │ ✅ ACCOUNTANT → STAFF / SALE / ACCOUNTANT    │
  │ ✅ SALE      → STAFF / ACCOUNTANT / SALE     │
  │ ❌ Không được đổi OWNER / MANAGER            │
  └──────────────────────────────────────────────┘
  ```

#### ✅ 19. Xóa members (với giới hạn)
- **Endpoint**: `DELETE /api/v1/workspaces/{tenantId}/personnel/members/{memberId}`
- **QUY TẮC**:
  ```
  ┌──────────────────────────────────────────┐
  │ MANAGER có thể xóa:                      │
  ├──────────────────────────────────────────┤
  │ ✅ STAFF, ACCOUNTANT, SALE               │
  │ ❌ Không thể xóa MANAGER / OWNER         │
  │ ❌ Không thể tự xóa bản thân            │
  └──────────────────────────────────────────┘
  ```

---

### **F. XEM BÁO CÁO & TỔNG QUAN**

#### ✅ 20. Xem Tổng quan (Overview)
- **Trang**: `/workspace/:workspaceId/overview`
- **Component**: `Overview.jsx`
- **MANAGER thấy**:
  - 📦 Tổng số sản phẩm
  - 📊 Tồn kho hiện tại
  - 🔄 Số phiếu nhập/xuất trong ngày
  - ⚠️ Sản phẩm có tồn kho thấp (< minStock)
  - 🚨 Sản phẩm quá tồn (> maxStock)
  - ⏳ Phiếu chờ xử lý
  - 🔍 Kiểm kê chờ duyệt
- **Target**: Nhanh nhất, một cái nhìn toàn bộ

#### ✅ 21. Xem Báo cáo (Reports)
- **Trang**: `/workspace/:workspaceId/reports`
- **Component**: `Reports.jsx` (Hiện chỉ là placeholder)
- **MANAGER thấy**:
  - Biểu đồ nhập/xuất hàng (theo ngày/tuần/tháng)
  - Sản phẩm bán chạy nhất
  - Sản phẩm chậm bán
  - Chi phí kho (turn-over rate)
  - Báo cáo kiểm kê (độ chính xác)

---

## 🆕 Chức năng đề xuất mới

### **Danh sách 10+ chức năng hợp lý cho MANAGER**

| # | Chức năng | Độ ưu tiên | Độ phức tạp | Ảnh hưởng |
|---|-----------|-----------|-----------|---------|
| 1 | Tạo phiếu kiểm kê | 🔴 Cao | ⭐⭐⭐ | Cao |
| 2 | Sửa/Hủy phiếu (PENDING) | 🔴 Cao | ⭐⭐ | Trung |
| 3 | Lịch sử phiếu (Audit Log) | 🟠 Trung | ⭐⭐ | Thấp |
| 4 | Báo cáo Staff Performance | 🟠 Trung | ⭐⭐⭐ | Trung |
| 5 | Cảnh báo Stock (Auto Alert) | 🟠 Trung | ⭐⭐ | Cao |
| 6 | Template phiếu | 🟡 Thấp | ⭐⭐⭐ | Trung |
| 7 | Bulk import sản phẩm | 🟡 Thấp | ⭐⭐⭐ | Trung |
| 8 | Điểm danh Staff | 🟡 Thấp | ⭐ | Thấp |
| 9 | Dự báo tồn kho (AI) | 🟢 Thấp | ⭐⭐⭐⭐ | Cao |
| 10 | Export báo cáo PDF/Excel | 🟡 Thấp | ⭐⭐ | Trung |
| 11 | Quản lý ca làm việc | 🟡 Thấp | ⭐⭐ | Trung |
| 12 | Yêu cầu không gian lưu trữ | 🟠 Trung | ⭐⭐ | Cao |

---

## 📌 Chi tiết 10 chức năng đề xuất

### **1. 🔴 Tạo phiếu kiểm kê (CREATE STOCKTAKE)**
**Status**: TODO (Cần implement ngay)  
**Độ ưu tiên**: NGAY LẬP TỨC

#### Mô tả
Manager tạo phiếu kiểm kê cho một vị trí cụ thể để STAFF đi đếm hàng.

#### Endpoint cần thêm
```
POST /api/v1/manager/stocktakes
Authorization: Bearer {token}
X-Workspace-Id: {tenantId}

Request body:
{
  "title": "Kiểm kê Kho A - Tầng 1",
  "locationId": "loc_001",
  "description": "Kiểm kê hàng sau khi nhập",
  "assignedTo": "staff_user_id"
}

Response:
{
  "id": "ticket_001",
  "ticketCode": "KK-001",
  "title": "Kiểm kê Kho A - Tầng 1",
  "locationCode": "STORAGE-A",
  "items": [
    {
      "productId": "prod_001",
      "productCode": "SKU-LP-001",
      "productName": "Nước ngọt 1.5L",
      "systemQuantity": 150
    }
  ],
  "status": "PENDING",
  "assignedTo": "staff_user_id",
  "createdAt": "2026-03-11T10:00:00Z"
}
```

#### Frontend
```jsx
// Page: /workspace/:workspaceId/stocktake
// Component: CreateStocktakeModal.jsx
<Button type="primary" onClick={() => setShowModal(true)}>
  📋 Tạo phiếu kiểm kê
</Button>

// Form:
- Tiêu đề (required)
- Chọn vị trí (dropdown)
- Chọn STAFF (dropdown)
- Submit → API POST
```

#### Logic Backend

**File**: `ManagerStocktakeService.java`

```java
public StocktakeTicket createTicket(String tenantId, String userId, CreateStocktakeRequest req) {
    // 1. Validate
    Location location = locationRepository.findById(req.getLocationId())
        .orElseThrow(() -> new AuthException("Vị trí không tìm thấy"));
    
    // 2. Lấy tất cả product có stock tại location này
    List<Product> products = productRepository.findByTenantId(tenantId);
    
    // 3. Tạo StocktakeItem cho mỗi sản phẩm
    List<StocktakeItem> items = products.stream()
        .map(p -> StocktakeItem.builder()
            .productId(p.getId())
            .productCode(p.getProductCode())
            .productName(p.getProductName())
            .systemQuantity(p.getCurrentStock())
            .actualQuantity(null) // STAFF nhập sau
            .build())
        .collect(Collectors.toList());
    
    // 4. Tạo ticket
    String ticketCode = "KK-" + String.format("%03d", countTickets(tenantId) + 1);
    StocktakeTicket ticket = StocktakeTicket.builder()
        .tenantId(tenantId)
        .ticketCode(ticketCode)
        .title(req.getTitle())
        .locationCode(location.getCode())
        .items(items)
        .assignedTo(req.getAssignedTo())
        .createdBy(userId)
        .status("PENDING")
        .createdAt(LocalDateTime.now())
        .build();
    
    // 5. Save & publish SSE event
    StocktakeTicket saved = stocktakeTicketRepository.save(ticket);
    publishEvent("stocktake_assigned", saved);
    
    return saved;
}
```

#### Không ảnh hưởng tới
- ✅ OWNER: Vẫn có quyền tạo phiếu kiểm kê
- ✅ STAFF: Chỉ xem phiếu được giao, không ảnh hưởng
- ✅ ACCOUNTANT: Không liên quan
- ✅ SALE: Không liên quan

---

### **2. 🔴 Sửa/Hủy phiếu nhập/xuất (PENDING)**
**Status**: TODO (Cần implement)  
**Độ ưu tiên**: CAO

#### Mô tả
Manager sửa lại phiếu chưa giao cho STAFF hoặc hủy nó.

#### Endpoint cần thêm
```
PUT /api/v1/manager/vouchers/{voucherId}
DELETE /api/v1/manager/vouchers/{voucherId}
```

#### Luật
- ✅ Chỉ được sửa/hủy phiếu ở trạng thái `PENDING`
- ❌ Không được sửa/hủy nếu trạng thái là `PROCESSING`, `COMPLETED`, `CANCELLED`
- ✅ Khi hủy → tạo audit log

#### Code mẫu
```java
@PutMapping("/{voucherId}")
public ResponseEntity<?> updateVoucher(
    @PathVariable String voucherId,
    @RequestHeader(value = "X-Workspace-Id") String tenantId,
    @RequestBody CreateVoucherRequest req) {
    
    StockVoucher voucher = managerVoucherService.getVoucher(tenantId, voucherId);
    
    if (!"PENDING".equals(voucher.getStatus())) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Chỉ được sửa phiếu ở trạng thái PENDING"));
    }
    
    StockVoucher updated = managerVoucherService.updateVoucher(tenantId, voucherId, req);
    return ResponseEntity.ok(updated);
}

@DeleteMapping("/{voucherId}")
public ResponseEntity<?> deleteVoucher(
    @PathVariable String voucherId,
    @RequestHeader(value = "X-Workspace-Id") String tenantId) {
    
    StockVoucher voucher = managerVoucherService.getVoucher(tenantId, voucherId);
    
    if (!"PENDING".equals(voucher.getStatus())) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Chỉ được hủy phiếu ở trạng thái PENDING"));
    }
    
    managerVoucherService.deleteVoucher(tenantId, voucherId);
    return ResponseEntity.ok(Map.of("message", "Phiếu đã hủy"));
}
```

---

### **3. 🟠 Lịch sử phiếu & Kiểm kê (Audit Log cho Manager)**
**Status**: TODO  
**Độ ưu tiên**: TRUNG BỘ

#### Mô tả
Manager xem lịch sử chi tiết một phiếu/kiểm kê (thay vì chỉ xem toàn bộ audit log như OWNER)

#### Endpoint cần thêm
```
GET /api/v1/manager/vouchers/{voucherId}/history
GET /api/v1/manager/stocktakes/{ticketId}/history

Response:
[
  {
    "timestamp": "2026-03-11T10:15:00Z",
    "action": "CREATED",
    "who": "Manager A",
    "details": {
      "type": "INBOUND",
      "title": "Nhập hàng từ NCC"
    }
  },
  {
    "timestamp": "2026-03-11T10:20:00Z",
    "action": "STATUS_CHANGED",
    "who": "Staff B",
    "from": "PENDING",
    "to": "PROCESSING"
  },
  {
    "timestamp": "2026-03-11T15:30:00Z",
    "action": "ITEM_SCANNED",
    "who": "Staff B",
    "item": "SKU-001",
    "quantity": 50
  }
]
```

---

### **4. 🟠 Báo cáo Hiệu suất STAFF**
**Status**: TODO  
**Độ ưu tiên**: TRUNG BỘ

#### Mô tả
Manager xem thống kê về STAFF (ai làm nhanh, ai chính xác nhất)

#### Metrics
```json
{
  "staffId": "staff_001",
  "staffName": "Nguyễn Văn A",
  "totalVouchersCompleted": 45,
  "totalStocktakesCompleted": 12,
  "avgTimePerVoucher": "45 phút",
  "avgAccuracy": "98.5%",
  "errorRate": "1.5%",
  "rating": "⭐⭐⭐⭐⭐"
}
```

#### Endpoint
```
GET /api/v1/manager/staff-performance?tenantId={tenantId}&startDate={}&endDate={}
```

---

### **5. 🟠 Cảnh báo Tồn kho Tự động (Stock Alert)**
**Status**: TODO  
**Độ ưu tiên**: TRUNG BỘ

#### Mô tả
Manager cấu hình cảnh báo khi tồn kho quá thấp hoặc quá cao

#### Features
```
1. Tự động theo dõi minStock & maxStock
   - Alert 1: Tồn kho <= minStock (màu đỏ)
   - Alert 2: Tồn kho >= maxStock (màu cam)

2. Gửi thông báo
   - Email cho Manager
   - Notification trên Dashboard
   - Optional: SMS

3. Trigger hành động
   - Suggest "Nhập hàng" nếu thiếu
   - Suggest "Xuất kho" nếu thừa
```

#### Endpoint
```
POST /api/v1/manager/alerts/stock
PUT /api/v1/manager/alerts/{alertId}
GET /api/v1/manager/alerts?tenantId={}
```

---

### **6. 🟡 Template Phiếu**
**Status**: TODO  
**Độ ưu tiên**: THẤP

#### Mô tả
Manager tạo template phiếu để tái sử dụng

#### Ví dụ
```json
{
  "templateName": "Nhập hàng định kỳ từ NCC A",
  "type": "INBOUND",
  "priority": "NORMAL",
  "items": [
    { "productCode": "SKU-001", "quantity": 100 },
    { "productCode": "SKU-002", "quantity": 200 }
  ]
}
```

#### Sử dụng
```
Manager click "Tạo từ template"
  ↓
Chọn template
  ↓
Tự động fill items
  ↓
Chỉnh sửa nếu cần
  ↓
Submit
```

---

### **7. 🟡 Nhập khối sản phẩm (Bulk Import)**
**Status**: TODO  
**Độ ưu tiên**: THẤP

#### Mô tả
Manager import danh sách sản phẩm từ CSV/Excel thay vì nhập từng cái

#### File mẫu
```
productCode,productName,category,price,cost,mainUnit,minStock,maxStock
SKU-001,Nước ngọt 1.5L,Đồ uống,25000,15000,Chai,50,500
SKU-002,Cơm hộp,Thực phẩm,30000,18000,Cái,30,300
```

#### Endpoint
```
POST /api/v1/manager/products/import
Content-Type: multipart/form-data

Response:
{
  "imported": 100,
  "errors": [
    { "row": 5, "error": "Email không hợp lệ" }
  ]
}
```

---

### **8. 🟡 Điểm danh STAFF**
**Status**: TODO  
**Độ ưu tiên**: THẤP

#### Mô tả
Manager ghi nhận STAFF có mặt/vắng trong ngày

#### Endpoint
```
POST /api/v1/manager/attendance
{
  "date": "2026-03-11",
  "staffId": "staff_001",
  "status": "PRESENT", // PRESENT, ABSENT, LATE, EARLY_LEAVE
  "note": "Đi công tác khách hàng"
}
```

---

### **9. 🟢 Dự báo tồn kho (AI Forecast)**
**Status**: TODO  
**Độ ưu tiên**: THẤP (nhưng Impact CAO)

#### Mô tả
Hệ thống dự báo tồn kho trong 7 ngày tới dựa trên lịch sử

#### Endpoint
```
GET /api/v1/manager/forecast?tenantId={}&days=7

Response:
[
  {
    "date": "2026-03-18",
    "productId": "prod_001",
    "predictedStock": 45,
    "riskLevel": "WARNING", // OK, WARNING, CRITICAL
    "recommendation": "Cần nhập hàng"
  }
]
```

---

### **10. 🟡 Export báo cáo (PDF/Excel)**
**Status**: TODO  
**Độ ưu tiên**: THẤP

#### Mô tả
Manager xuất báo cáo phiếu, kiểm kê ra PDF/Excel

#### Endpoint
```
GET /api/v1/manager/reports/vouchers/export?format=PDF&startDate=&endDate=

Response: Tải file PDF
```

---

### **11. 🟡 Quản lý Ca làm việc**
**Status**: TODO  
**Độ ưu tiên**: THẤP

#### Mô tả
Manager lễn ca làm việc cho STAFF

#### Features
```
- Ca 1 (6:00 - 14:00)
- Ca 2 (14:00 - 22:00)
- Ca 3 (22:00 - 06:00)
- Gán STAFF vào ca
- Tính lương theo ca
```

---

### **12. 🟠 Yêu cầu không gian lưu trữ**
**Status**: TODO  
**Độ ưu tiên**: TRUNG BỘ

#### Mô tả
Khi tồn kho quá cao, Manager yêu cầu không gian lưu trữ thêm

#### Workflow
```
Manager click "Yêu cầu kho thêm"
  ↓
Nhập số lượng cần
  ↓
Gửi yêu cầu tới OWNER
  ↓
OWNER duyệt
  ↓
Thông báo lại Manager
```

---

## 📊 Lộ trình triển khai

### **Phase 1 - NGAY LẬP TỨC (2-3 tuần)**
- [ ] Tạo phiếu kiểm kê (Feature #1)
- [ ] Sửa/Hủy phiếu (Feature #2)
- [ ] Lịch sử phiếu tại Manager (Feature #3)

### **Phase 2 - QUỸ 1 Tháng**
- [ ] Báo cáo STAFF Performance (Feature #4)
- [ ] Cảnh báo tồn kho (Feature #5)
- [ ] Yêu cầu kho thêm (Feature #12)

### **Phase 3 - Tháng tiếp theo**
- [ ] Template phiếu (Feature #6)
- [ ] Nhập khối sản phẩm (Feature #7)
- [ ] Điểm danh STAFF (Feature #8)
- [ ] Export báo cáo (Feature #10)

### **Phase 4 - Tương lai**
- [ ] Dự báo tồn kho AI (Feature #9)
- [ ] Quản lý ca làm việc (Feature #11)

---

## 🔌 API Endpoints cần thêm

### **Manager Stocktake API**
```
POST   /api/v1/manager/stocktakes
GET    /api/v1/manager/stocktakes
GET    /api/v1/manager/stocktakes/{id}
PUT    /api/v1/manager/stocktakes/{id}
DELETE /api/v1/manager/stocktakes/{id}
GET    /api/v1/manager/stocktakes/{id}/history
```

### **Manager Voucher API (Extended)**
```
PUT    /api/v1/manager/vouchers/{id}           [UPDATE]
DELETE /api/v1/manager/vouchers/{id}           [DELETE]
GET    /api/v1/manager/vouchers/{id}/history   [HISTORY]
```

### **Manager Reports API**
```
GET /api/v1/manager/reports/staff-performance
GET /api/v1/manager/reports/inventory-status
GET /api/v1/manager/reports/export?format=PDF
```

### **Manager Alerts API**
```
POST   /api/v1/manager/alerts/stock
GET    /api/v1/manager/alerts
PUT    /api/v1/manager/alerts/{id}
DELETE /api/v1/manager/alerts/{id}
```

### **Manager Forecast API**
```
GET /api/v1/manager/forecast?days=7&tenantId={}
```

---

## ✅ Tóm tắt

### **Chức năng MANAGER hiện tại**
- ✅ 21 chức năng đã xây dựng và hoạt động
- ✅ UI/Frontend đã hoàn chỉnh
- ✅ Backend API đã triển khai
- ⏳ Một số chỗ chỉ là placeholder (Reports, Overview)

### **Chức năng đề xuất**
- 🎯 12 chức năng hợp lý & thực tế
- 🎯 Không ảnh hưởng tới vai trò khác
- 🎯 Tăng hiệu quả quản lý kho
- 🎯 Giúp MANAGER ra quyết định tốt hơn

### **Tiếp theo**
1. Hoàn thành Feature #1 (Tạo kiểm kê) - đây là TODO chưa làm
2. Implement Feature #2 & #3 (Sửa/Hủy & Lịch sử)
3. Sau đó theo Phase 2, 3, 4

---

**Document created**: 2026-03-11  
**Last updated**: 2026-03-11  
**Version**: 1.0
