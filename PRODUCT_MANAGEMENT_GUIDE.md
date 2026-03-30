# 📦 Hướng dẫn hoàn thành chức năng Quản lý Sản phẩm cho MANAGER

**Tác giả**: OptiStock Development Team  
**Ngày tạo**: 11/03/2026  
**Phiên bản**: 1.0  
**Trạng thái**: ⏳ TODO - Cần implement ngay

---

## 🎯 Mục đích

Manager (Quản lý kho) cần có khả năng:
1. ✅ **Xem danh sách sản phẩm** - Liệt kê tất cả sản phẩm định áy
2. ✅ **Tạo sản phẩm mới** (thủ công) - Nhập từng cái một qua form
3. ✅ **Nhập khối sản phẩm** (CSV/Excel) - Import hàng loạt từ file
4. ✅ **Sửa sản phẩm** - Cập nhật thông tin
5. ✅ **Xóa sản phẩm** - Soft delete (giữ lịch sử)
6. ✅ **Filter & Tìm kiếm** - Tìm theo tên, mã, danh mục

---

## 📋 Trạng thái hiện tại

| Component | Status | Ghi chú |
|-----------|--------|---------|
| ProductRepository | ✅ Có | Đã tạo các method |
| ProductDTO | ✅ Có | Đầy đủ fields |
| Product Model | ✅ Có | Hoàn chỉnh |
| ProductService | ❌ KHÔNG | Cần tạo |
| ProductController | ❌ KHÔNG | Cần tạo |
| productApi.js | ❌ Trống | Cần viết |
| Products.jsx | ❌ Placeholder | Cần hoàn thành |

---

## 🛠️ Kiến trúc giải pháp

```
┌─────────────────────────────────────────────────────────┐
│                    MANAGER                              │
│              Products.jsx (Frontend UI)                 │
├─────────────────────────────────────────────────────────┤
│                   productApi.js                         │
│              (API calls to backend)                     │
├─────────────────────────────────────────────────────────┤
│                ProductController.java                   │
│           (REST API endpoints @RestController)          │
├─────────────────────────────────────────────────────────┤
│                ProductService.java                      │
│            (Business logic & validation)                │
├─────────────────────────────────────────────────────────┤
│             ProductRepository.java                      │
│           (MongoDB data access layer)                   │
├─────────────────────────────────────────────────────────┤
│               MongoDB (optistock_db)                    │
│              Collection: "products"                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Schema dữ liệu

### Product Collection (MongoDB)
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "tenantId": "tenant_001",
  "productCode": "SKU-001",
  "productName": "Nước ngọt Coca 1.5L",
  "category": "Đồ uống",
  "description": "Nước ngọt có gas, hộp 24 chai",
  "price": 25000,
  "cost": 15000,
  "mainUnit": "Chai",
  "currentStock": 150,
  "minStock": 30,
  "maxStock": 500,
  "supplier": "Coca Cola Vietnam",
  "isActive": true,
  "unitConversionIds": ["convId_001", "convId_002"],
  "createdAt": "2026-03-11T10:00:00Z",
  "updatedAt": "2026-03-11T10:00:00Z"
}
```

### ProductDTO (Data Transfer Object)
```java
public class ProductDTO {
    private String id;
    private String tenantId;
    private String productCode;           // SKU - UNIQUE per tenant
    private String productName;           // Tên sản phẩm
    private String category;              // Danh mục
    private String description;           // Mô tả chi tiết
    private Double price;                 // Giá bán
    private Double cost;                  // Giá vốn
    private String mainUnit;              // Đơn vị chính (Chai, Thùng,...)
    private Integer currentStock;         // Số lượng hiện tại
    private Integer minStock;             // Stock tối thiểu
    private Integer maxStock;             // Stock tối đa
    private String supplier;              // Nhà cung cấp
    private boolean active;               // Hoạt động hay không
    private List<String> unitConversionIds; // Quy đổi đơn vị
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 🔌 API Endpoints

### 1️⃣ **Lấy danh sách sản phẩm**
```
GET /api/v1/workspaces/{tenantId}/products
X-Workspace-Id: {tenantId}
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "prod_001",
    "productCode": "SKU-001",
    "productName": "Nước ngọt Coca 1.5L",
    "category": "Đồ uống",
    "price": 25000,
    "cost": 15000,
    "currentStock": 150,
    "mainUnit": "Chai",
    "minStock": 30,
    "maxStock": 500,
    "supplier": "Coca Cola Vietnam",
    "active": true,
    "createdAt": "2026-03-11T10:00:00Z"
  }
]
```

**Query Parameters** (optional):
```
?category=Đồ uống
?search=Coca
?active=true
?skip=0&limit=20
```

---

### 2️⃣ **Lấy chi tiết sản phẩm**
```
GET /api/v1/workspaces/{tenantId}/products/{productId}
X-Workspace-Id: {tenantId}

Response 200:
{
  "id": "prod_001",
  "productCode": "SKU-001",
  "productName": "Nước ngọt Coca 1.5L",
  "category": "Đồ uống",
  "description": "Nước ngọt có gas, hộp 24 chai",
  "price": 25000,
  "cost": 15000,
  "currentStock": 150,
  "minUnit": "Chai",
  "minStock": 30,
  "maxStock": 500,
  "supplier": "Coca Cola Vietnam",
  "unitConversions": [
    {
      "id": "conv_001",
      "fromUnit": "Chai",
      "toUnit": "Thùng",
      "rate": 24
    }
  ],
  "createdAt": "2026-03-11T10:00:00Z",
  "updatedAt": "2026-03-11T10:00:00Z"
}
```

---

### 3️⃣ **Tạo sản phẩm mới (Thủ công)**
```
POST /api/v1/workspaces/{tenantId}/products
X-Workspace-Id: {tenantId}
Content-Type: application/json

Request body:
{
  "productCode": "SKU-001",
  "productName": "Nước ngọt Coca 1.5L",
  "category": "Đồ uống",
  "description": "Nước ngọt có gas, hộp 24 chai",
  "price": 25000,
  "cost": 15000,
  "mainUnit": "Chai",
  "minStock": 30,
  "maxStock": 500,
  "supplier": "Coca Cola Vietnam"
}

Response 201:
{
  "id": "prod_001",
  "productCode": "SKU-001",
  "productName": "Nước ngọt Coca 1.5L",
  "currentStock": 0,
  "createdAt": "2026-03-11T10:00:00Z"
}

Error 400 (Bad Request):
{
  "success": false,
  "message": "Product code SKU-001 already exists in workspace"
}
```

**Validation**:
- `productCode`: REQUIRED, UNIQUE per workspace
- `productName`: REQUIRED, max 255 chars
- `category`: REQUIRED
- `price`: REQUIRED, > 0
- `cost`: REQUIRED, >= 0
- `mainUnit`: REQUIRED
- `minStock`: >= 0
- `maxStock`: > minStock

---

### 4️⃣ **Cập nhật sản phẩm**
```
PUT /api/v1/workspaces/{tenantId}/products/{productId}
X-Workspace-Id: {tenantId}
Content-Type: application/json

Request body:
{
  "productName": "Nước ngọt Coca 1.5L - Updated",
  "category": "Đồ uống có gas",
  "price": 26000,
  "cost": 15500,
  "minStock": 25,
  "maxStock": 600,
  "supplier": "Coca Cola Vietnam"
}

Response 200:
{
  "success": true,
  "message": "Product updated successfully",
  "data": {...}
}
```

**Lưu ý**: 
- ❌ KHÔNG cho sửa `productCode` (để tránh phá vỡ phiếu tồn tại)
- ✅ Cho sửa tất cả các field khác

---

### 5️⃣ **Xóa sản phẩm (Soft Delete)**
```
DELETE /api/v1/workspaces/{tenantId}/products/{productId}
X-Workspace-Id: {tenantId}

Response 200:
{
  "success": true,
  "message": "Product deleted successfully"
}

Error 400:
{
  "success": false,
  "message": "Cannot delete product with non-zero current stock (150). Export all items first."
}
```

**Quy tắc**:
- ✅ Cho xóa nếu `currentStock = 0`
- ❌ Nếu còn stock, yêu cầu xuất hết trước
- 🔄 Soft delete: `isActive = false, deletedAt = now`
- 📝 Giữ lịch sử (không xóa từ DB)

---

### 6️⃣ **Nhập khối sản phẩm (Bulk Import)**
```
POST /api/v1/workspaces/{tenantId}/products/bulk-import
X-Workspace-Id: {tenantId}
Content-Type: multipart/form-data

Parameters:
- file: CSV/Excel file
- skipHeader: true (nếu dòng đầu là header)

CSV format:
productCode,productName,category,price,cost,mainUnit,minStock,maxStock,supplier,description
SKU-001,Nước ngọt Coca 1.5L,Đồ uống,25000,15000,Chai,30,500,Coca Cola Vietnam,Nước có gas
SKU-002,Bia Heineken 330ml,Đồ uống,20000,10000,Chai,50,400,Heineken Vietnam,Bia nhập khẩu

Response 200:
{
  "success": true,
  "imported": 2,
  "skipped": 0,
  "errors": [],
  "message": "Imported 2 products successfully"
}

Response 207 (Partial Success):
{
  "success": false,
  "imported": 1,
  "skipped": 0,
  "errors": [
    {
      "row": 2,
      "productCode": "SKU-002",
      "error": "Price must be greater than 0"
    }
  ],
  "message": "Imported 1 product. 1 error occurred. See details above."
}
```

**File format accepted**:
- CSV (comma-separated)
- Excel (.xlsx)
- Max file size: 5 MB
- Max rows: 10,000

**Validate mỗi row**:
- productCode không trùng
- price > 0
- maxStock > minStock
- mainUnit không rỗng

---

## 💻 Frontend Implementation

### **File 1: Products.jsx (Main Page)**

```jsx
// File: frontend/src/pages/workspace/Products.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Table, Button, Modal, Form, Input, InputNumber, Select, Space,
    Card, Tag, Tooltip, Empty, Spin, Popconfirm, message,
    Upload, Drawer, Row, Col, SearchOutlined, PlusOutlined, DeleteOutlined,
    EditOutlined, ImportOutlined, DownloadOutlined
} from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import * as productApi from '../../api/productApi';
import styles from './WorkspacePage.module.css';
import s from './Products.module.css';

// ─── CATEGORIES ────────────────────────────────────────────────────────────
const CATEGORIES = [
    { label: '🥤 Đồ uống', value: 'Đồ uống' },
    { label: '🍔 Thực phẩm', value: 'Thực phẩm' },
    { label: '👕 Thời trang', value: 'Thời trang' },
    { label: '⚙️ Điện tử', value: 'Điện tử' },
    { label: '💊 Dược phẩm', value: 'Dược phẩm' },
];

const UNITS = [
    { label: 'Chai', value: 'Chai' },
    { label: 'Thùng', value: 'Thùng' },
    { label: 'Cái', value: 'Cái' },
    { label: 'Hộp', value: 'Hộp' },
    { label: 'Kg', value: 'Kg' },
    { label: 'Liter', value: 'Liter' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
const Products = () => {
    const { workspaceId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBulkImportDrawer, setShowBulkImportDrawer] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form references
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // Filter states
    const [filterCategory, setFilterCategory] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // ── LOAD PRODUCTS ───────────────────────────────────────────────────────
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productApi.getAllProducts(workspaceId, {
                category: filterCategory,
                search: searchText,
                skip: (pageNum - 1) * pageSize,
                limit: pageSize,
            });
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, filterCategory, searchText, pageNum, pageSize]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    // ── CREATE PRODUCT ──────────────────────────────────────────────────────
    const handleCreateProduct = async (values) => {
        try {
            const newProduct = await productApi.createProduct(workspaceId, values);
            message.success('Sản phẩm đã tạo thành công!');
            setShowCreateModal(false);
            createForm.resetFields();
            loadProducts();
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi tạo sản phẩm');
            console.error(err);
        }
    };

    // ── EDIT PRODUCT ────────────────────────────────────────────────────────
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        editForm.setFieldsValue(product);
        setShowEditModal(true);
    };

    const handleUpdateProduct = async (values) => {
        if (!editingProduct) return;
        try {
            await productApi.updateProduct(workspaceId, editingProduct.id, values);
            message.success('Sản phẩm đã cập nhật!');
            setShowEditModal(false);
            editForm.resetFields();
            setEditingProduct(null);
            loadProducts();
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi cập nhật sản phẩm');
        }
    };

    // ── DELETE PRODUCT ──────────────────────────────────────────────────────
    const handleDeleteProduct = async (productId) => {
        try {
            await productApi.deleteProduct(workspaceId, productId);
            message.success('Sản phẩm đã xóa!');
            loadProducts();
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi xóa sản phẩm');
        }
    };

    // ── BULK IMPORT ─────────────────────────────────────────────────────────
    const handleBulkImport = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await productApi.bulkImportProducts(workspaceId, formData);
            message.success(`Nhập thành công ${result.imported} sản phẩm!`);
            if (result.errors.length > 0) {
                message.warning(`${result.errors.length} sản phẩm có lỗi. Xem chi tiết bên dưới.`);
            }
            setShowBulkImportDrawer(false);
            loadProducts();
        } catch (err) {
            message.error('Lỗi nhập khối sản phẩm');
            console.error(err);
        }
        return false;
    };

    // ── TABLE COLUMNS ───────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Mã sản phẩm',
            dataIndex: 'productCode',
            key: 'productCode',
            width: 120,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <Tooltip title={record.description}>
                    {text}
                </Tooltip>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price?.toLocaleString()} đ`,
            width: 100,
        },
        {
            title: 'Vốn',
            dataIndex: 'cost',
            key: 'cost',
            render: (cost) => `${cost?.toLocaleString()} đ`,
            width: 100,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'currentStock',
            key: 'currentStock',
            render: (stock, record) => {
                let color = 'green';
                if (stock < record.minStock) color = 'red';
                else if (stock > record.maxStock) color = 'orange';
                return <Tag color={color}>{stock}</Tag>;
            },
            width: 80,
        },
        {
            title: 'Đơn vị',
            dataIndex: 'mainUnit',
            key: 'mainUnit',
            width: 80,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditProduct(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa sản phẩm?"
                            description={record.currentStock > 0
                                ? `⚠️ Sản phẩm còn ${record.currentStock} ${record.mainUnit}. Phải xuất hết trước.`
                                : 'Bạn có chắc chắn?'
                            }
                            onConfirm={() => handleDeleteProduct(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            disabled={record.currentStock > 0}
                        >
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                disabled={record.currentStock > 0}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // ── RENDER ──────────────────────────────────────────────────────────────
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>📦 Sản phẩm</h1>
                    <p className={styles.pageSubtitle}>
                        Quản lý danh mục sản phẩm, nhập khối và quy đổi đơn vị
                    </p>
                </div>
                <div className={styles.pageHeaderRight}>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setShowCreateModal(true)}
                        >
                            Thêm sản phẩm
                        </Button>
                        <Button
                            icon={<ImportOutlined />}
                            onClick={() => setShowBulkImportDrawer(true)}
                        >
                            Nhập từ Excel
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => {/* Download template */}}
                        >
                            Tải template
                        </Button>
                    </Space>
                </div>
            </div>

            {/* ── FILTER ─────────────────────────────────────────────────────── */}
            <Card className={s.filterCard}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Input.Search
                            placeholder="Tìm theo mã hoặc tên..."
                            onChange={(e) => setSearchText(e.target.value)}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Select
                            placeholder="Danh mục"
                            allowClear
                            onChange={setFilterCategory}
                            options={CATEGORIES}
                        />
                    </Col>
                </Row>
            </Card>

            {/* ── TABLE ──────────────────────────────────────────────────────── */}
            <Card loading={loading}>
                {products.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có sản phẩm nào"
                        style={{ marginTop: 40 }}
                    >
                        <Button type="primary" onClick={() => setShowCreateModal(true)}>
                            Tạo sản phẩm đầu tiên
                        </Button>
                    </Empty>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        pagination={{
                            current: pageNum,
                            pageSize: pageSize,
                            onChange: (page) => setPageNum(page),
                            onShowSizeChange: (_, size) => setPageSize(size),
                        }}
                    />
                )}
            </Card>

            {/* ── CREATE MODAL ─────────────────────────────────────────────────── */}
            <Modal
                title="Tạo sản phẩm mới"
                open={showCreateModal}
                onCancel={() => {
                    setShowCreateModal(false);
                    createForm.resetFields();
                }}
                onOk={() => createForm.submit()}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateProduct}
                >
                    <Form.Item
                        name="productCode"
                        label="Mã sản phẩm (SKU)"
                        rules={[
                            { required: true, message: 'Không được để trống' },
                            { pattern: /^[A-Z0-9\-]+$/, message: 'Chỉ chứa chữ, số và dấu gạch' }
                        ]}
                    >
                        <Input placeholder="VD: SKU-001" />
                    </Form.Item>

                    <Form.Item
                        name="productName"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                        <Input placeholder="VD: Nước ngọt Coca 1.5L" />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Chọn danh mục' }]}
                    >
                        <Select placeholder="Chọn danh mục" options={CATEGORIES} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={2} placeholder="Mô tả chi tiết sản phẩm" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item
                                name="price"
                                label="Giá bán"
                                rules={[
                                    { required: true, message: 'Không được để trống' },
                                    { type: 'number', min: 0, message: 'Phải >= 0' }
                                ]}
                            >
                                <InputNumber placeholder="25000" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item
                                name="cost"
                                label="Giá vốn"
                                rules={[
                                    { required: true, message: 'Không được để trống' },
                                    { type: 'number', min: 0, message: 'Phải >= 0' }
                                ]}
                            >
                                <InputNumber placeholder="15000" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="mainUnit"
                        label="Đơn vị chính"
                        rules={[{ required: true, message: 'Chọn đơn vị' }]}
                    >
                        <Select placeholder="Chọn đơn vị" options={UNITS} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item
                                name="minStock"
                                label="Tồn kho tối thiểu"
                                initialValue={0}
                            >
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item
                                name="maxStock"
                                label="Tồn kho tối đa"
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const min = getFieldValue('minStock');
                                            if (!value || !min || value > min) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Max phải > Min'));
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="supplier"
                        label="Nhà cung cấp"
                    >
                        <Input placeholder="VD: Coca Cola Vietnam" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── EDIT MODAL ──────────────────────────────────────────────────── */}
            <Modal
                title={`Chỉnh sửa: ${editingProduct?.productName}`}
                open={showEditModal}
                onCancel={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    editForm.resetFields();
                }}
                onOk={() => editForm.submit()}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateProduct}
                >
                    {/* NOTE: productCode CANNOT be edited */}
                    <Form.Item label="Mã sản phẩm (Không thể sửa)">
                        <Input value={editingProduct?.productCode} disabled />
                    </Form.Item>

                    <Form.Item
                        name="productName"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Không được để trống' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true }]}
                    >
                        <Select options={CATEGORIES} />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item name="price" label="Giá bán">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name="cost" label="Giá vốn">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item name="minStock" label="Stock Min">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name="maxStock" label="Stock Max">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="supplier" label="Nhà cung cấp">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── BULK IMPORT DRAWER ─────────────────────────────────────────── */}
            <Drawer
                title="Nhập sản phẩm từ Excel"
                placement="right"
                onClose={() => setShowBulkImportDrawer(false)}
                open={showBulkImportDrawer}
                width={500}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <h4>📋 Hướng dẫn:</h4>
                        <ul>
                            <li>Download template dưới đây</li>
                            <li>Nhập dữ liệu sản phẩm vào file</li>
                            <li>Upload file CSV hoặc Excel</li>
                            <li>Hệ thống sẽ kiểm tra và import</li>
                        </ul>
                    </div>

                    <Button
                        type="dashed"
                        block
                        onClick={() => downloadTemplate()}
                    >
                        ⬇️ Download Template
                    </Button>

                    <Upload
                        accept=".csv,.xlsx,.xls"
                        maxCount={1}
                        beforeUpload={handleBulkImport}
                    >
                        <Button type="primary" block>
                            ⬆️ Upload file
                        </Button>
                    </Upload>

                    <Card size="small">
                        <p><strong>📝 Format CSV:</strong></p>
                        <code style={{ fontSize: '11px' }}>
                            productCode,productName,category,price,cost,mainUnit,minStock,maxStock,supplier,description
                        </code>
                        <p style={{ marginTop: 10 }}><strong>📌 Lưu ý:</strong></p>
                        <ul style={{ fontSize: '12px', marginBottom: 0 }}>
                            <li>Mã sản phẩm không được trùng</li>
                            <li>Giá phải > 0, Vốn phải >= 0</li>
                            <li>Max Stock phải > Min Stock</li>
                            <li>Max 10,000 hàng, file max 5MB</li>
                        </ul>
                    </Card>
                </Space>
            </Drawer>
        </div>
    );
};

export default Products;
```

---

### **File 2: productApi.js (API Client)**

```javascript
// File: frontend/src/api/productApi.js

import axiosClient from './axiosClient';

const h = (workspaceId) => ({ headers: { 'X-Workspace-Id': workspaceId } });

// ── GET ALL PRODUCTS ────────────────────────────────────────────────────────
export const getAllProducts = (tenantId, params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return axiosClient
        .get(`/v1/workspaces/${tenantId}/products${queryStr ? '?' + queryStr : ''}`, h(tenantId))
        .then(r => r.data);
};

// ── GET PRODUCT DETAIL ──────────────────────────────────────────────────────
export const getProduct = (tenantId, productId) => {
    return axiosClient
        .get(`/v1/workspaces/${tenantId}/products/${productId}`, h(tenantId))
        .then(r => r.data);
};

// ── CREATE PRODUCT ──────────────────────────────────────────────────────────
/**
 * @param {string} tenantId
 * @param {{
 *   productCode: string,
 *   productName: string,
 *   category: string,
 *   description: string,
 *   price: number,
 *   cost: number,
 *   mainUnit: string,
 *   minStock: number,
 *   maxStock: number,
 *   supplier: string
 * }} data
 */
export const createProduct = (tenantId, data) => {
    return axiosClient
        .post(`/v1/workspaces/${tenantId}/products`, data, h(tenantId))
        .then(r => r.data);
};

// ── UPDATE PRODUCT ──────────────────────────────────────────────────────────
export const updateProduct = (tenantId, productId, data) => {
    return axiosClient
        .put(`/v1/workspaces/${tenantId}/products/${productId}`, data, h(tenantId))
        .then(r => r.data);
};

// ── DELETE PRODUCT ──────────────────────────────────────────────────────────
export const deleteProduct = (tenantId, productId) => {
    return axiosClient
        .delete(`/v1/workspaces/${tenantId}/products/${productId}`, h(tenantId))
        .then(r => r.data);
};

// ── BULK IMPORT PRODUCTS ────────────────────────────────────────────────────
/**
 * @param {string} tenantId
 * @param {FormData} formData - contains 'file' key
 */
export const bulkImportProducts = (tenantId, formData) => {
    return axiosClient
        .post(`/v1/workspaces/${tenantId}/products/bulk-import`, formData, {
            headers: {
                'X-Workspace-Id': tenantId,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(r => r.data);
};

// ── DOWNLOAD TEMPLATE ───────────────────────────────────────────────────────
export const downloadTemplate = () => {
    return axiosClient
        .get('/v1/products/template', {
            responseType: 'blob',
            headers: { 'Content-Type': 'text/csv' }
        })
        .then(r => {
            const url = window.URL.createObjectURL(new Blob([r.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product-template.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        });
};
```

---

## 🔨 Backend Implementation

### **File 1: ProductService.java**

```java
// File: backend/src/main/java/com/optistock/backend/service/ProductService.java

package com.optistock.backend.service;

import com.optistock.backend.dto.ProductDTO;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.Product;
import com.optistock.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ── GET ALL PRODUCTS ────────────────────────────────────────────────────
    public List<Product> getAllProducts(String tenantId, String category, String search) {
        List<Product> products = productRepository.findByTenantId(tenantId);

        // Filter by category
        if (category != null && !category.isEmpty()) {
            products = products.stream()
                .filter(p -> category.equals(p.getCategory()))
                .collect(Collectors.toList());
        }

        // Search by code or name
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            products = products.stream()
                .filter(p -> p.getProductCode().toLowerCase().contains(searchLower) ||
                        p.getProductName().toLowerCase().contains(searchLower))
                .collect(Collectors.toList());
        }

        return products;
    }

    // ── GET PRODUCT BY ID ───────────────────────────────────────────────────
    public Product getProduct(String tenantId, String productId) {
        return productRepository.findById(productId)
            .filter(p -> tenantId.equals(p.getTenantId()))
            .orElseThrow(() -> new AuthException("Sản phẩm không tìm thấy"));
    }

    // ── CREATE PRODUCT ──────────────────────────────────────────────────────
    public Product createProduct(String tenantId, ProductDTO dto) {
        // Validate
        if (dto.getProductCode() == null || dto.getProductCode().isBlank()) {
            throw new AuthException("Mã sản phẩm không được để trống");
        }
        if (!dto.getProductCode().matches("^[A-Z0-9\\-]+$")) {
            throw new AuthException("Mã sản phẩm chỉ chứa chữ, số và dấu gạch");
        }
        if (productRepository.existsByTenantIdAndProductCode(tenantId, dto.getProductCode())) {
            throw new AuthException("Mã sản phẩm " + dto.getProductCode() + " đã tồn tại");
        }
        if (dto.getPrice() == null || dto.getPrice() <= 0) {
            throw new AuthException("Giá bán phải lớn hơn 0");
        }
        if (dto.getMaxStock() != null && dto.getMinStock() != null && 
            dto.getMaxStock() <= dto.getMinStock()) {
            throw new AuthException("Max stock phải lớn hơn Min stock");
        }

        // Build product
        Product product = new Product();
        product.setTenantId(tenantId);
        product.setProductCode(dto.getProductCode());
        product.setProductName(dto.getProductName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCost(dto.getCost() != null ? dto.getCost() : 0.0);
        product.setMainUnit(dto.getMainUnit());
        product.setCurrentStock(0);
        product.setMinStock(dto.getMinStock() != null ? dto.getMinStock() : 0);
        product.setMaxStock(dto.getMaxStock());
        product.setSupplier(dto.getSupplier());
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        return productRepository.save(product);
    }

    // ── UPDATE PRODUCT ──────────────────────────────────────────────────────
    public Product updateProduct(String tenantId, String productId, ProductDTO dto) {
        Product product = getProduct(tenantId, productId);

        // NOTE: productCode CANNOT be changed
        if (dto.getProductName() != null) product.setProductName(dto.getProductName());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getCost() != null) product.setCost(dto.getCost());
        if (dto.getMainUnit() != null) product.setMainUnit(dto.getMainUnit());
        if (dto.getMinStock() != null) product.setMinStock(dto.getMinStock());
        if (dto.getMaxStock() != null) product.setMaxStock(dto.getMaxStock());
        if (dto.getSupplier() != null) product.setSupplier(dto.getSupplier());

        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    // ── DELETE PRODUCT (SOFT DELETE) ────────────────────────────────────────
    public void deleteProduct(String tenantId, String productId) {
        Product product = getProduct(tenantId, productId);

        if (product.getCurrentStock() != null && product.getCurrentStock() > 0) {
            throw new AuthException(
                "Không thể xóa sản phẩm có tồn kho (" + product.getCurrentStock() + 
                " " + product.getMainUnit() + "). Phải xuất hết trước."
            );
        }

        product.setActive(false);
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    // ── BULK IMPORT ──────────────────────────────────────────────────────────
    public ImportResult bulkImport(String tenantId, MultipartFile file) {
        ImportResult result = new ImportResult();

        try {
            String content = new String(file.getBytes());
            String[] lines = content.split("\n");

            int imported = 0;
            for (int i = 1; i < lines.length; i++) { // Skip header row
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                try {
                    ProductDTO dto = parseCSVLine(line);
                    createProduct(tenantId, dto);
                    imported++;
                } catch (Exception e) {
                    result.getErrors().add(new ImportError(i + 1, e.getMessage()));
                }
            }
            result.setImported(imported);
        } catch (Exception e) {
            throw new AuthException("Lỗi đọc file: " + e.getMessage());
        }

        return result;
    }

    // ── PARSE CSV LINE ──────────────────────────────────────────────────────
    private ProductDTO parseCSVLine(String line) {
        String[] fields = line.split(",");
        if (fields.length < 9) {
            throw new IllegalArgumentException("Dòng không đủ fields");
        }

        ProductDTO dto = new ProductDTO();
        dto.setProductCode(fields[0].trim());
        dto.setProductName(fields[1].trim());
        dto.setCategory(fields[2].trim());
        dto.setPrice(Double.parseDouble(fields[3].trim()));
        dto.setCost(Double.parseDouble(fields[4].trim()));
        dto.setMainUnit(fields[5].trim());
        dto.setMinStock(Integer.parseInt(fields[6].trim()));
        dto.setMaxStock(Integer.parseInt(fields[7].trim()));
        dto.setSupplier(fields[8].trim());
        if (fields.length > 9) {
            dto.setDescription(fields[9].trim());
        }

        return dto;
    }

    // ── IMPORT RESULT CLASS –────────────────────────────────────────────────
    public static class ImportResult {
        private int imported = 0;
        private int skipped = 0;
        private List<ImportError> errors = new java.util.ArrayList<>();

        // Getters & Setters
        public int getImported() { return imported; }
        public void setImported(int imported) { this.imported = imported; }
        public int getSkipped() { return skipped; }
        public void setSkipped(int skipped) { this.skipped = skipped; }
        public List<ImportError> getErrors() { return errors; }
        public void setErrors(List<ImportError> errors) { this.errors = errors; }
    }

    public static class ImportError {
        private int row;
        private String error;

        public ImportError(int row, String error) {
            this.row = row;
            this.error = error;
        }

        public int getRow() { return row; }
        public String getError() { return error; }
    }
}
```

---

### **File 2: ProductController.java**

```java
// File: backend/src/main/java/com/optistock/backend/controller/ProductController.java

package com.optistock.backend.controller;

import com.optistock.backend.dto.ProductDTO;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.Product;
import com.optistock.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ── GET ALL PRODUCTS ────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @PathVariable String tenantId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        try {
            List<Product> products = productService.getAllProducts(tenantId, category, search);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET PRODUCT DETAIL ──────────────────────────────────────────────────
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(
            @PathVariable String tenantId,
            @PathVariable String productId) {
        try {
            Product product = productService.getProduct(tenantId, productId);
            return ResponseEntity.ok(product);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // ── CREATE PRODUCT ──────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createProduct(
            @PathVariable String tenantId,
            @RequestBody ProductDTO dto) {
        try {
            Product created = productService.createProduct(tenantId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── UPDATE PRODUCT ──────────────────────────────────────────────────────
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable String tenantId,
            @PathVariable String productId,
            @RequestBody ProductDTO dto) {
        try {
            Product updated = productService.updateProduct(tenantId, productId, dto);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sản phẩm đã cập nhật",
                "data", updated
            ));
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── DELETE PRODUCT ──────────────────────────────────────────────────────
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable String tenantId,
            @PathVariable String productId) {
        try {
            productService.deleteProduct(tenantId, productId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sản phẩm đã xóa"
            ));
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── BULK IMPORT ──────────────────────────────────────────────────────────
    @PostMapping("/bulk-import")
    public ResponseEntity<?> bulkImport(
            @PathVariable String tenantId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File trống"));
            }

            ProductService.ImportResult result = productService.bulkImport(tenantId, file);

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.getErrors().isEmpty());
            response.put("imported", result.getImported());
            response.put("skipped", result.getSkipped());
            response.put("errors", result.getErrors());

            if (result.getErrors().isEmpty()) {
                response.put("message", "Nhập thành công " + result.getImported() + " sản phẩm");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Nhập " + result.getImported() + " sản phẩm. " + 
                    result.getErrors().size() + " lỗi xảy ra.");
                return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
```

---

## 📋 CSV Template Format

**File name**: `product-template.csv`

```csv
productCode,productName,category,price,cost,mainUnit,minStock,maxStock,supplier,description
SKU-001,Nước ngọt Coca 1.5L,Đồ uống,25000,15000,Chai,30,500,Coca Cola Vietnam,Nước ngọt có gas
SKU-002,Bia Heineken 330ml,Đồ uống,20000,10000,Chai,50,400,Heineken Vietnam,Bia nhập khẩu
SKU-003,Cơm gà teriyaki,Thực phẩm,35000,18000,Hộp,20,200,Bếp Nhật Bản,Cơm gà tương nước
SKU-004,Áo T-shirt nam,Thời trang,150000,75000,Cái,10,100,Vietnam Apparel,100% cotton
SKU-005,Laptop Asus Vivobook,Điện tử,15000000,10000000,Cái,2,20,Asus Vietnam,Intel i5 Gen 11
```

---

## ✅ Checklist triển khai

### Backend
- [ ] Tạo `ProductService.java`
- [ ] Tạo `ProductController.java`
- [ ] Thêm quyền kiểm tra (chỉ MANAGER/OWNER)
- [ ] Thêm audit logging (mỗi khi tạo/sửa/xóa)
- [ ] Thêm unit tests

### Frontend
- [ ] Tạo `Products.jsx` (hoàn chỉnh)
- [ ] Tạo `productApi.js`
- [ ] Tạo `Products.module.css`
- [ ] Thêm route trong `AppRouter.jsx` (nếu chưa có)
- [ ] Thêm menu item trong `Sidebar.jsx`
- [ ] Test create/update/delete/bulk import

### Validation
- [ ] Mã sản phẩm unique
- [ ] Giá > 0
- [ ] Max stock > Min stock
- [ ] File upload max 5MB
- [ ] CSV format valid

---

## 🎯 Tài liệu liên quan

1. **Product Model**: `backend/src/main/java/.../model/Product.java`
2. **Product DTO**: `backend/src/main/java/.../dto/ProductDTO.java`
3. **Product Repository**: `backend/src/main/java/.../repository/ProductRepository.java`
4. **Authentication**: Bearer token in `Authorization` header
5. **Permissions**: Chỉ MANAGER hoặc OWNER được tạo/sửa/xóa sản phẩm

---

**Document created**: 2026-03-11  
**Document version**: 1.0  
**Status**: ⏳ Ready for implementation
