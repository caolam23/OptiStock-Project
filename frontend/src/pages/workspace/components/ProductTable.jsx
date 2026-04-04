import React, { useState } from 'react';
import { Spin, Tooltip, Tag, Dropdown, Modal, Pagination } from 'antd';
import { 
    MoreOutlined, 
    CheckCircleFilled, 
    CloseCircleFilled, 
    WarningFilled, 
    EditOutlined, 
    DeleteOutlined, 
    InboxOutlined,
    EyeOutlined 
} from '@ant-design/icons';
import styles from './ProductTable.module.css';

const ProductTable = ({ 
    products = [], 
    loading = false, 
    onEdit = null, 
    onDelete = null,
    onView = null,
    pagination = null,
    industryType = 'ELECTRONICS'
}) => {
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    /**
     * ✅ HELPER: Format specifications từ object hoặc array, lấy 2-3 giá trị đầu
     * @param {Object|Array} specs - Object hoặc Array of specifications
     * @returns {string} Formatted string "256GB • 8GB RAM • Đen Titan"
     */
    const formatSpecifications = (specs) => {
        if (!specs) return '';
        
        let specArray = [];
        
        // Handle Object format: { "Dung lượng": "256GB", "RAM": "8GB" }
        if (typeof specs === 'object' && !Array.isArray(specs)) {
            specArray = Object.entries(specs)
                .slice(0, 3)
                .map(([key, value]) => value)
                .filter(v => v && v !== '');
        }
        // Handle Array format: [{ key: "Dung lượng", value: "256GB" }, ...]
        else if (Array.isArray(specs)) {
            specArray = specs
                .slice(0, 3)
                .map(item => item.value || item)
                .filter(v => v && v !== '');
        }
        
        return specArray.length > 0 ? specArray.join(' • ') : '—';
    };

    /**
     * ✅ HELPER FOR GROCERY: Tóm tắt các đơn vị quy đổi
     * @param {Array} unitConversions - Mảng các đơn vị quy đổi (VD: [{ unitName: "Thùng", conversionRate: 24 }, ...])
     * @returns {JSX} Tag hiển thị các đơn vị quy đổi hoặc null nếu không có
     */
    const getUnitSummary = (unitConversions) => {
        if (!unitConversions || unitConversions.length === 0) return null;
        
        const unitNames = unitConversions
            .map(u => u.unitName)
            .filter(name => name && name !== '')
            .slice(0, 2); // Lấy tối đa 2 đơn vị
        
        if (unitNames.length === 0) return null;
        
        const unitText = unitNames.join(', ');
        return (
            <Tag color="purple" style={{ fontSize: '11px', padding: '2px 6px' }}>
                📦 Quy đổi: {unitText}
            </Tag>
        );
    };

    /**
     * ✅ HELPER FOR GROCERY: Kiểm tra trạng thái HSD của lô hàng
     * @param {Array} batches - Mảng lô hàng (VD: [{ batchCode: "LOT-001", expiryDate: "2026-05-30" }, ...])
     * @returns {JSX} Tag hiển thị trạng thái HSD
     */
    const getBatchExpirySummary = (batches) => {
        if (!batches || batches.length === 0) {
            return <Tag color="green" style={{ fontSize: '11px', padding: '2px 6px' }}>✅ Lô HSD an toàn</Tag>;
        }

        const today = new Date();
        const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        let hasExpiredBatch = false;
        let hasExpiringSoonBatch = false;
        
        batches.forEach(batch => {
            if (batch.expiryDate) {
                const expiryDate = new Date(batch.expiryDate);
                
                if (expiryDate < today) {
                    // Lô đã hết hạn
                    hasExpiredBatch = true;
                } else if (expiryDate <= thirtyDaysLater) {
                    // Lô sắp hết hạn (< 30 ngày)
                    hasExpiringSoonBatch = true;
                }
            }
        });
        
        if (hasExpiredBatch) {
            return <Tag color="red" style={{ fontSize: '11px', padding: '2px 6px' }}>❌ Có lô hết hạn</Tag>;
        }
        
        if (hasExpiringSoonBatch) {
            return <Tag color="orange" style={{ fontSize: '11px', padding: '2px 6px' }}>⚠️ Sắp hết hạn</Tag>;
        }
        
        return <Tag color="green" style={{ fontSize: '11px', padding: '2px 6px' }}>✅ Lô HSD an toàn</Tag>;
    };

    /**
     * ✅ HELPER: Format tracking type với icon và badge - Có điều kiện theo ngành hàng
     * @param {string} trackingType - 'IMEI' hoặc 'QUANTITY'
     * @param {string} industryType - 'ELECTRONICS' hoặc 'GROCERY'
     * @returns {JSX} Badge với icon và text
     */
    const formatTrackingType = (trackingType, industryType) => {
        // Nếu là GROCERY, luôn hiển thị "Quản lý theo Lô/HSD"
        if (industryType === 'GROCERY') {
            return (
                <Tag color="geekblue" style={{ fontSize: '11px', padding: '2px 6px' }}>
                    📦 Quản lý theo Lô/HSD
                </Tag>
            );
        }

        // Nếu là ELECTRONICS, hiển thị theo trackingType
        if (trackingType === 'IMEI') {
            return (
                <Tag color="blue" style={{ fontSize: '11px', padding: '2px 6px' }}>
                    📱 Quét IMEI
                </Tag>
            );
        } else if (trackingType === 'QUANTITY') {
            return (
                <Tag color="green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                    🔢 Đếm số lượng
                </Tag>
            );
        }
        return <Tag style={{ fontSize: '11px', padding: '2px 6px' }}>—</Tag>;
    };

    /**
     * ✅ HELPER: Xác định trạng thái tồn kho
     */
    const getStockStatus = (currentStock, minStock, maxStock) => {
        const current = currentStock || 0;
        const min = minStock || 0;
        const max = maxStock || 1000;

        if (current < min) {
            return {
                status: 'Thiếu hàng',
                color: 'error',
                icon: <CloseCircleFilled />,
                variant: 'filled'
            };
        } else if (current > max) {
            return {
                status: 'Vượt định mức',
                color: 'warning',
                icon: <WarningFilled />,
                variant: 'filled'
            };
        } else {
            return {
                status: 'An toàn',
                color: 'success',
                icon: <CheckCircleFilled />,
                variant: 'filled'
            };
        }
    };

    /**
     * ✅ HELPER: Format condition (Tình trạng máy) với màu sắc
     * Maps database values to display labels (from PRODUCT_CONDITIONS)
     */
    const getConditionTag = (condition) => {
        const conditionMap = {
            'New': { color: 'green', label: '✨ Mới 100%' },
            'LikeNew': { color: 'blue', label: '⭐ Like New 99%' },
            'Good': { color: 'cyan', label: '⭐⭐ Cũ 95%' },
            'Refurbished': { color: 'orange', label: '⭐⭐⭐ CPO' },
            'Display': { color: 'red', label: '📦 Hàng trưng bày' },
        };
        
        const config = conditionMap[condition] || { color: 'default', label: condition || '—' };
        return <Tag color={config.color} style={{ fontSize: '11px' }}>{config.label}</Tag>;
    };

    /**
     * Handle view action
     */
    const handleViewClick = (product) => {
        if (onView) {
            onView(product);
        }
    };

    /**
     * Handle edit action
     */
    const handleEditClick = (product) => {
        if (onEdit) {
            onEdit(product);
        }
    };

    /**
     * Handle delete action
     */
    const handleDeleteClick = (product) => {
        console.log('Delete button clicked for:', product.productName);
        setDeleteProduct(product);
        setIsDeleteModalOpen(true);
    };

    /**
     * Handle confirm delete
     */
    const handleConfirmDelete = () => {
        if (!onDelete || !deleteProduct) return;
        
        console.log('Xác nhận xóa sản phẩm:', deleteProduct.productName);
        setDeletingId(deleteProduct.id);
        onDelete(deleteProduct.id);
        setDeletingId(null);
        setIsDeleteModalOpen(false);
        setDeleteProduct(null);
    };

    /**
     * Handle cancel delete
     */
    const handleCancelDelete = () => {
        console.log('Hủy bỏ xóa sản phẩm');
        setIsDeleteModalOpen(false);
        setDeleteProduct(null);
    };

    return (
        <div className={styles.tableWrapper}>
            <Spin spinning={loading}>
                {products.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.colProduct}>Sản phẩm</th>
                                <th className={styles.colCategory}>Phân loại</th>
                                <th className={styles.colStock}>Tồn kho & Quản lý</th>
                                <th className={styles.colPrice}>Định giá</th>
                                <th className={styles.actionColumn}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => {
                                const stockStatus = getStockStatus(
                                    product.currentStock,
                                    product.minStock,
                                    product.maxStock
                                );
                                const specsFormatted = formatSpecifications(product.specifications);
                                const trackingTypeTag = formatTrackingType(product.trackingType, industryType);

                                return (
                                    <tr 
                                        key={product.id}
                                        className={styles.tableRow}
                                        onMouseEnter={() => setHoveredRowId(product.id)}
                                        onMouseLeave={() => setHoveredRowId(null)}
                                    >
                                        {/* ========== CỘT 1: SẢN PHẨM (Tên, SKU, Specs) ========== */}
                                        <td className={styles.productCell}>
                                            <div className={styles.stackedContent}>
                                                {/* Dòng 1: Tên sản phẩm - In đậm */}
                                                <div className={styles.productNameStacked}>
                                                    {product.productName}
                                                </div>
                                                {/* Dòng 2: SKU - Màu xám, chữ nhỏ */}
                                                <div className={styles.productCodeStacked}>
                                                    {product.productCode}
                                                </div>
                                                {/* Dòng 3: Specs - Nếu có */}
                                                {specsFormatted !== '—' && (
                                                    <div className={styles.specsStacked}>
                                                        {specsFormatted}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* ========== CỘT 2: PHÂN LOẠI (Hiển thị theo ngành hàng) ========== */}
                                        <td className={styles.categoryCell}>
                                            <div className={styles.stackedContent}>
                                                {industryType === 'ELECTRONICS' ? (
                                                    <>
                                                        {/* ELECTRONICS: Danh mục + Tình trạng máy + Bảo hành */}
                                                        {/* Dòng 1: Danh mục */}
                                                        {product.category && (
                                                            <div className={styles.categoryTag}>
                                                                {product.category}
                                                            </div>
                                                        )}
                                                        {/* Dòng 2: Tình trạng máy */}
                                                        {product.condition && (
                                                            <div className={styles.conditionStacked}>
                                                                {getConditionTag(product.condition)}
                                                            </div>
                                                        )}
                                                        {/* Dòng 3: Bảo hành */}
                                                        {product.warrantyMonths && (
                                                            <div className={styles.warrantyStacked}>
                                                                <Tag color="cyan" style={{ fontSize: '11px' }}>
                                                                    🛡️ {product.warrantyMonths} tháng
                                                                </Tag>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* GROCERY: Danh mục + Quy đổi đơn vị + HSD Lô hàng */}
                                                        {/* Dòng 1: Danh mục */}
                                                        {product.category && (
                                                            <div className={styles.categoryTag}>
                                                                {product.category}
                                                            </div>
                                                        )}
                                                        {/* Dòng 2: Unit Summary - Quy đổi đơn vị */}
                                                        {getUnitSummary(product.unitConversions) && (
                                                            <div className={styles.unitSummaryStacked}>
                                                                {getUnitSummary(product.unitConversions)}
                                                            </div>
                                                        )}
                                                        {/* Dòng 3: Batch Expiry Summary - HSD Lô hàng */}
                                                        {getBatchExpirySummary(product.batches) && (
                                                            <div className={styles.batchExpiryStacked}>
                                                                {getBatchExpirySummary(product.batches)}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        {/* ========== CỘL 3: TỒN KHO & QUẢN LÝ ========== */}
                                        <td className={styles.stockCell}>
                                            <Tooltip 
                                                title={
                                                    <div className={styles.tooltipContent}>
                                                        <div>Tồn kho hiện tại: <strong>{product.currentStock || 0}</strong></div>
                                                        <div>Định mức: <strong>{product.minStock || 0}</strong> - <strong>{product.maxStock || 1000}</strong></div>
                                                    </div>
                                                }
                                            >
                                                <div className={styles.stackedContent}>
                                                    {/* Dòng 1: Số lượng + Status Tag */}
                                                    <div className={styles.stockStatusRow}>
                                                        <span className={styles.stockBigNumber}>
                                                            {product.currentStock || 0}
                                                        </span>
                                                        <Tag 
                                                            color={stockStatus.color} 
                                                            style={{ fontSize: '11px', padding: '2px 6px', marginLeft: '6px' }}
                                                        >
                                                            {stockStatus.icon} {stockStatus.status}
                                                        </Tag>
                                                    </div>
                                                    {/* Dòng 2: Tracking Type Badge */}
                                                    <div className={styles.trackingTypeRow}>
                                                        {trackingTypeTag}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>

                                        {/* ========== CỘL 4: ĐỊNH GIÁ (Giá bán + Giá vốn) ========== */}
                                        <td className={styles.priceCell}>
                                            <div className={styles.stackedContent}>
                                                {/* Dòng 1: Giá bán - In đậm, màu xanh */}
                                                <div className={styles.sellingPrice}>
                                                    {product.price?.toLocaleString('vi-VN')} đ
                                                </div>
                                                {/* Dòng 2: Giá vốn - Xám, nhỏ */}
                                                {product.cost && (
                                                    <div className={styles.costPrice}>
                                                        Vốn: {product.cost.toLocaleString('vi-VN')} đ
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* ========== CỘL 5: HÀNH ĐỘNG ========== */}
                                        <td className={styles.actionCell}>
                                            <div 
                                                className={`${styles.actionButton} ${
                                                    hoveredRowId === product.id ? styles.actionButtonVisible : styles.actionButtonHidden
                                                }`}
                                            >
                                                <Dropdown 
                                                    menu={{ 
                                                        items: [
                                                            {
                                                                key: 'view',
                                                                icon: <EyeOutlined />,
                                                                label: 'Xem chi tiết',
                                                                onClick: () => {
                                                                    console.log('View button clicked for:', product.productName);
                                                                    handleViewClick(product);
                                                                },
                                                            },
                                                            {
                                                                key: 'edit',
                                                                icon: <EditOutlined />,
                                                                label: 'Sửa sản phẩm',
                                                                onClick: () => {
                                                                    console.log('Edit button clicked');
                                                                    handleEditClick(product);
                                                                },
                                                            },
                                                            {
                                                                key: 'delete',
                                                                icon: <DeleteOutlined />,
                                                                label: 'Xóa sản phẩm',
                                                                danger: true,
                                                                onClick: () => {
                                                                    console.log('Delete button clicked for:', product.productName);
                                                                    handleDeleteClick(product);
                                                                },
                                                            },
                                                        ]
                                                    }}
                                                    placement="bottomRight"
                                                    trigger={['click']}
                                                >
                                                    <button className={styles.moreButton} title="Mở menu">
                                                        <MoreOutlined />
                                                    </button>
                                                </Dropdown>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.placeholderCard}>
                        {/* Thay emoji hộp hàng bằng icon Inbox của Ant Design */}
                        <div className={styles.placeholderIcon}>
                            <InboxOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                        </div>
                        <h3 className={styles.placeholderTitle}>Chưa có sản phẩm</h3>
                        <p className={styles.placeholderText}>
                            Bắt đầu bằng cách thêm sản phẩm thủ công hoặc nhập từ file Excel
                        </p>
                    </div>
                )}

                {/* ========== PAGINATION CONTROL ========== */}
                {pagination && products.length > 0 && (
                    <div className={styles.paginationContainer}>
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={(page, pageSize) => {
                                if (pagination.onChange) {
                                    pagination.onChange(page, pageSize);
                                }
                            }}
                            onShowSizeChange={(current, size) => {
                                if (pagination.onChange) {
                                    pagination.onChange(current, size);
                                }
                            }}
                            showSizeChanger
                            showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} sản phẩm`}
                            pageSizeOptions={['10', '20', '50', '100']}
                            locale={{ items_per_page: 'sản phẩm/trang' }}
                        />
                    </div>
                )}
            </Spin>

            {/* ========== MODAL: XÁC NHẬN XÓA SẢN PHẨM ========== */}
            <Modal
                title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <WarningFilled style={{ color: '#faad14' }} /> Xóa sản phẩm
                    </span>
                }
                open={isDeleteModalOpen}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText="Xóa"
                cancelText="Hủy bỏ"
                okButtonProps={{ danger: true }}
            >
                {deleteProduct && (
                    <p>
                        Bạn có chắc chắn muốn xóa sản phẩm "<strong>{deleteProduct.productName}</strong>" ({deleteProduct.productCode})?
                    </p>
                )}
            </Modal>
        </div>
    );
};

export default ProductTable;