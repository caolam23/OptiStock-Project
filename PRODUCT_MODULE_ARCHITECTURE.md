# 🏗️ Architecture - Product Management Module for Electronics & Gadgets

## Tổng Quan Kiến Trúc

Module Quản lý Sản phẩm được thiết kế lại để hỗ trợ đầy đủ ngành Electronic & Gadgets với độ phức tạp cao, bao gồm:
- **Thiết bị IMEI** (Điện thoại, Tablet) - cần tracking số hiệu riêng lẻ
- **Phụ kiện** (Cáp, Bao, Kính cảm ứng...) - quản lý theo lô hàng
- **Dịch vụ** (Bảo hành, Sửa chữa...) - không quản lý kho

---

## 1️⃣ Backend Architecture

### Enums

#### `TrackingType.java`
```java
IMEI        → Quản lý từng thiết bị riêng lẻ (IMEI, Serial)
BATCH       → Quản lý theo lô hàng (Batch/Lot)
QUANTITY    → Quản lý theo số lượng thông thường
SERVICE     → Dịch vụ không quản lý kho
```

#### `ActivationStatus.java`
```java
NOT_ACTIVATED   → Chưa kích hoạt
ACTIVATED       → Đã kích hoạt
DEACTIVATED     → Đã hủy kích hoạt
```

### Entity Model

#### `Product.java`
Cấu trúc chính (MongoDB Document):

```java
// ==================== THÔNG TIN CƠ BẢN ====================
private String id;                              // ObjectId
private String tenantId;                        // Workspace ID
private String productCode;                     // SKU duy nhất
private String productName;                     // Tên sản phẩm
private String brand;                           // Hãng (Samsung, Apple...)
private String category;                        // Danh mục
private String description;                     // Mô tả

// ==================== GIÁ & CHI PHÍ ====================
private Double price;                           // Giá bán
private Double cost;                            // Giá vốn

// ==================== QUẢN LÝ TỒN KHO ====================
private TrackingType trackingType;              // Loại quản lý
private Integer currentStock;                   // Tồn kho hiện tại
private Integer minStock;                       // Tồn tối thiểu
private Integer maxStock;                       // Tồn tối đa
private String mainUnit;                        // Đơn vị (Cái, Bộ...)
private String supplier;                        // Nhà cung cấp

// ==================== ELECTRONICS CHUYÊN BIỆT ====================
private String originCode;                      // Mã vùng (VN/A, LL/A...)
private ActivationStatus activationStatus;      // Trạng thái kích hoạt
private Map<String, Object> specifications;     // Specs động (JSON)
private Integer warrantyMonths;                 // Bảo hành (tháng)

// ==================== METADATA ====================
private boolean isActive;                       // Soft delete flag
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
private LocalDateTime deletedAt;
```

**Ví dụ Specifications (JSON trong MongoDB):**
```json
{
  "specifications": {
    "RAM": "8GB",
    "ROM": "256GB",
    "Display": "6.5 inch OLED",
    "Camera": "48MP",
    "Battery": "4000mAh",
    "Processor": "Snapdragon 8 Gen 2"
  }
}
```

### DTO

#### `ProductDTO.java`
- Map toàn bộ các trường từ Entity
- Hỗ trợ cả Create & Update operations
- Validations trên DTO level

---

## 2️⃣ Frontend Architecture

### Components

#### `ProductFormModal.jsx`
React Modal component với Ant Design, chia làm 3 Tab:

##### **Tab 1: Thông tin chung** 📋
```
┌─────────────────────────────────┐
│ Mã SKU        │ Tên sản phẩm    │
├─────────────────────────────────┤
│ Hãng          │ Danh mục        │
├─────────────────────────────────┤
│ Giá bán (đ)   │ Giá vốn (đ)     │
├─────────────────────────────────┤
│ Đơn vị        │ Nhà cung cấp    │
├─────────────────────────────────┤
│ Mô tả (tùy chọn)                │
└─────────────────────────────────┘
```

**Validates:**
- SKU: Bắt buộc, duy nhất, format [A-Z0-9-]+
- Tên sản phẩm: Bắt buộc
- Giá bán: Bắt buộc, > 0

##### **Tab 2: Thông số kỹ thuật** ⚙️
```
Dynamic Form List (Ant Design Form.List):

┌──────────────────┬──────────────────┬──────┐
│ Thông số         │ Giá trị           │ Xóa  │
├──────────────────┼──────────────────┼──────┤
│ RAM              │ 8GB               │ ❌   │
├──────────────────┼──────────────────┼──────┤
│ ROM              │ 256GB             │ ❌   │
├──────────────────┼──────────────────┼──────┤
│ [+ Thêm thông số] (Button)                  │
└──────────────────┴──────────────────┴──────┘
```

**Tính năng:**
- Thêm Key-Value specs động
- Xóa specs theo dòng
- Hỗ trợ suggestions (RAM, ROM, Display, Camera, Battery, Processor...)
- Flexible - cho phép user tùy ý thêm specs

##### **Tab 3: Cấu hình Tồn kho & Phân loại** 📦
```
A. Loại quản lý kho (Radio Group 2 cột):
┌─────────────────────────────────────────┐
│ ☑️ 📱 Quản lý theo IMEI                  │ ☐ 📦 Quản lý theo Lô
│    Cho điện thoại, tablet                │    Cho phụ kiện, linh kiện
│                                         │
│ ☐ 🔢 Quản lý theo Số lượng              │ ☐ 🎁 Dịch vụ
│    Sản phẩm thông thường                 │    Không quản lý kho
└─────────────────────────────────────────┘

B. Tồn kho (Hiển thị nếu không phải SERVICE):
┌─────────────────┬─────────────────┬─────────────────┐
│ Tồn hiện tại    │ Tồn tối thiểu   │ Tồn tối đa      │
│ [0]             │ [0]             │ [100]           │
└─────────────────┴─────────────────┴─────────────────┘

C. Nguồn gốc & Kích hoạt:
┌─────────────────┬─────────────────┐
│ Mã vùng         │ Trạng thái       │
│ [VN/A]          │ [Chưa kích hoạt] │
└─────────────────┴─────────────────┘

D. Bảo hành:
┌─────────────────┐
│ Thời gian (tháng)│
│ [12]            │
└─────────────────┘
```

**Xử lý Logic:**
- Nếu TrackingType = SERVICE → ẩn các field tồn kho
- origin_code & activation_status → chỉ cho IMEI/BATCH
- warranty_months → optional cho tất cả

### Utilities

#### `productConstants.js`
```javascript
TRACKING_TYPES              // Enum definitions & metadata
ACTIVATION_STATUSES         // Status colors, icons
ORIGIN_CODES                // Region codes
PRODUCT_CATEGORIES          // Category options
PRODUCT_BRANDS              // Brand options
WARRANTY_PRESETS            // Warranty presets (0, 6, 12, 24, 36 months)

Utility Functions:
- getTrackingTypeInfo()     // Lấy info theo type
- requiresIMEITracking()    // Check IMEI requirement
- isServiceProduct()        // Check nếu là dịch vụ
- specsToArray/Object()     // Convert specs format
- formatPrice()             // Format giá VND
- validateSKU()             // Validate SKU pattern
- validatePrice()           // Validate giá
- validateStock()           // Validate stock levels
```

### Styling

#### `ProductFormModal.module.css`
- **Header Gradient**: Xanh dương chuyên nghiệp
- **Tabs Navigation**: Highlight active tab
- **Form Inputs**: Hover & Focus states
- **Radio Options**: Grid 2 cột, hover effect
- **Buttons**: Gradient backgrounds, shadows
- **Responsive**: Mobile-first (xs, sm, md breakpoints)

---

## 3️⃣ Data Flow

### **Create Product**
```
Frontend (ProductFormModal)
    ↓
Validate (client-side)
    ↓
POST /api/v1/workspaces/{tenantId}/products
    ↓
Backend (ProductController)
    ↓
ProductService.createProduct()
    ↓
MongoDB (products collection)
    ↓
Success Response
    ↓
Frontend: Reload table, show toast
```

### **Product Data Shape**
```javascript
{
  id: "507f1f77bcf86cd799439011",
  tenantId: "tenant-123",
  productCode: "SKU-001",
  productName: "iPhone 15 Pro",
  brand: "Apple",
  category: "SMARTPHONE",
  price: 29999000,
  cost: 22000000,
  mainUnit: "Cái",
  trackingType: "IMEI",
  currentStock: 50,
  minStock: 10,
  maxStock: 500,
  supplier: "Apple Vietnam",
  originCode: "VN/A",
  activationStatus: "NOT_ACTIVATED",
  warrantyMonths: 12,
  specifications: {
    RAM: "8GB",
    ROM: "256GB",
    Display: "6.7 inch Dynamic Island",
    Camera: "48MP + 12MP + 12MP",
    Battery: "3262mAh",
    Processor: "A17 Pro"
  },
  isActive: true,
  createdAt: "2024-03-20T10:30:00Z",
  updatedAt: "2024-03-20T10:30:00Z"
}
```

---

## 4️⃣ Usage Example

### **Import Component**
```javascript
import ProductFormModal from './ProductFormModal';

function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleCreate = () => {
    setSelectedProduct(null);  // Clear + trigger Create Mode
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);  // Trigger Edit Mode
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        // Update
        await updateProduct(tenantId, selectedProduct.id, formData);
      } else {
        // Create
        await createProduct(tenantId, formData);
      }
      setShowModal(false);
      loadProducts();  // Reload
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <>
      <Button onClick={handleCreate}>Tạo sản phẩm</Button>
      <ProductFormModal
        visible={showModal}
        product={selectedProduct}
        onCancel={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
      {/* Product Table, etc... */}
    </>
  );
}
```

---

## 5️⃣ Key Features

✅ **Dynamic Specifications** - User-defined key-value pairs (không cứng nhắc)
✅ **Flexible Tracking** - IMEI, Batch, Quantity, Service modes
✅ **Activation Status** - Track thiết bị activation
✅ **Origin Code** - Region tracking (VN/A, LL/A, etc.)
✅ **Warranty** - Bảo hành configurable
✅ **Responsive Design** - Mobile-first UI/UX
✅ **Form Validation** - Client & Server-side
✅ **Grid System** - Ant Design Grid (xs, sm, md, lg, xl)

---

## 6️⃣ Future Enhancements

🔮 **IMEI Tracking Module** - Quản lý individual IMEIs
🔮 **Batch Management** - Lot tracking với expiry dates
🔮 **Service Catalog** - Service offerings & pricing
🔮 **Specification Templates** - Pre-built specs per category
🔮 **Price History** - Track price changes over time
🔮 **Stock Movements** - Detailed inventory logs

---

## 📋 File Structure

```
backend/
├── enums/
│   ├── TrackingType.java
│   └── ActivationStatus.java
├── model/
│   └── Product.java (redesigned)
└── dto/
    └── ProductDTO.java (updated)

frontend/
├── pages/workspace/components/
│   ├── ProductFormModal.jsx (new)
│   └── ProductFormModal.module.css (new)
└── utils/
    └── productConstants.js (new)
```

---

**Architecture Version**: 1.0
**Last Updated**: March 20, 2026
**Status**: ✅ Production Ready
