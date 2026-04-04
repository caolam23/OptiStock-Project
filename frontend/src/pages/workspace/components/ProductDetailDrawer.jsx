import React from 'react';
import {
    Drawer,
    Descriptions,
    Divider,
    Empty,
    Tag,
    Table,
    Typography,
} from 'antd';
import styles from './ProductDetailDrawer.module.css';

const { Title } = Typography;

/**
 * ProductDetailDrawer - Hiển thị chi tiết sản phẩm với layout động theo ngành hàng
 * @param {Object} props
 * @param {boolean} props.visible - Điều khiển mở/đóng drawer
 * @param {Object} props.product - Dữ liệu sản phẩm
 * @param {string} props.industryType - 'ELECTRONICS' hoặc 'GROCERY'
 * @param {Function} props.onClose - Callback khi đóng drawer
 */
const ProductDetailDrawer = ({ visible, product, industryType = 'ELECTRONICS', onClose }) => {
    if (!product) {
        return null;
    }

    // ========== HELPERS ==========

    /**
     * Format giá VND
     */
    const formatPrice = (value) => {
        if (!value && value !== 0) return '—';
        return `${parseFloat(value).toLocaleString('vi-VN')} đ`;
    };

    /**
     * Render giá trị hoặc dấu "—" nếu không có dữ liệu
     */
    const renderValue = (value, fallback = '—') => {
        return value || value === 0 ? value : fallback;
    };

    /**
     * Format condition tag
     */
    const getConditionDisplay = (condition) => {
        const conditionMap = {
            'New': { color: 'green', label: '✨ Mới 100%' },
            'LikeNew': { color: 'blue', label: '⭐ Like New 99%' },
            'Good': { color: 'cyan', label: '⭐⭐ Cũ 95%' },
            'Refurbished': { color: 'orange', label: '⭐⭐⭐ CPO' },
            'Display': { color: 'red', label: '📦 Hàng trưng bày' },
        };
        const config = conditionMap[condition] || { color: 'default', label: condition || '—' };
        return <Tag color={config.color}>{config.label}</Tag>;
    };

    /**
     * Render Specifications section (ELECTRONICS only)
     */
    const renderSpecificationsSection = () => {
        if (!product.specifications || Object.keys(product.specifications).length === 0) {
            return null;
        }

        const specs = product.specifications;
        const specsList = Array.isArray(specs)
            ? specs.map((item, idx) => ({
                key: idx,
                name: item.key || `Thông số ${idx + 1}`,
                value: item.value || item,
            }))
            : Object.entries(specs).map(([key, value], idx) => ({
                key: idx,
                name: key,
                value: value,
            }));

        const specColumns = [
            {
                title: 'Thông số',
                dataIndex: 'name',
                key: 'name',
                width: '40%',
                render: (text) => <span className={styles.specLabel}>{text}</span>,
            },
            {
                title: 'Giá trị',
                dataIndex: 'value',
                key: 'value',
                width: '60%',
                render: (text) => <strong>{text || '—'}</strong>,
            },
        ];

        return (
            <div className={styles.section}>
                <Title level={5} className={styles.sectionTitle}>
                    📋 Thông số kỹ thuật
                </Title>
                <Table
                    dataSource={specsList}
                    columns={specColumns}
                    pagination={false}
                    size="small"
                    rowKey="key"
                    className={styles.specsTable}
                />
            </div>
        );
    };

    /**
     * Render Unit Conversions section (GROCERY only)
     */
    const renderUnitConversionsSection = () => {
        if (!product.unitConversions || product.unitConversions.length === 0) {
            return null;
        }

        const unitColumns = [
            {
                title: 'Tên đơn vị',
                dataIndex: 'unitName',
                key: 'unitName',
                render: (text) => renderValue(text, '—'),
            },
            {
                title: 'Quy đổi',
                dataIndex: 'conversionRate',
                key: 'conversionRate',
                render: (text) => renderValue(text, '—'),
            },
            {
                title: 'Mã vạch',
                dataIndex: 'barcode',
                key: 'barcode',
                render: (text) => (
                    <span className={styles.barcode}>{renderValue(text, '—')}</span>
                ),
            },
        ];

        return (
            <div className={styles.section}>
                <Title level={5} className={styles.sectionTitle}>
                    📦 Quy đổi đơn vị
                </Title>
                <Table
                    dataSource={product.unitConversions}
                    columns={unitColumns}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => `unit-${index}`}
                    className={styles.unitsTable}
                />
            </div>
        );
    };

    /**
     * Render Batches section (GROCERY only)
     */
    const renderBatchesSection = () => {
        if (!product.batches || product.batches.length === 0) {
            return null;
        }

        const batchColumns = [
            {
                title: 'Mã lô',
                dataIndex: 'batchCode',
                key: 'batchCode',
                render: (text) => <strong>{renderValue(text, '—')}</strong>,
            },
            {
                title: 'Số lượng',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (text) => renderValue(text, '—'),
            },
            {
                title: 'Ngày SX',
                dataIndex: 'manufacturingDate',
                key: 'manufacturingDate',
                render: (text) => renderValue(text, '—'),
            },
            {
                title: 'Hạn SD',
                dataIndex: 'expiryDate',
                key: 'expiryDate',
                render: (text) => {
                    if (!text) return '—';
                    const expiry = new Date(text);
                    const today = new Date();
                    const daysLeft = Math.ceil(
                        (expiry - today) / (1000 * 60 * 60 * 24)
                    );
                    let color = 'green';
                    if (daysLeft < 0) color = 'red';
                    else if (daysLeft < 30) color = 'orange';
                    return (
                        <Tag color={color}>
                            {text} ({daysLeft > 0 ? `còn ${daysLeft} ngày` : 'hết hạn'})
                        </Tag>
                    );
                },
            },
        ];

        return (
            <div className={styles.section}>
                <Title level={5} className={styles.sectionTitle}>
                    📅 Lô hàng & HSD
                </Title>
                <Table
                    dataSource={product.batches}
                    columns={batchColumns}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => `batch-${index}`}
                    className={styles.batchesTable}
                />
            </div>
        );
    };

    // ========== RENDER ==========

    return (
        <Drawer
            title={
                <div className={styles.drawerTitle}>
                    <span>Xem chi tiết sản phẩm</span>
                    <span className={styles.drawerSubtitle}>{product.productCode}</span>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={650}
            className={styles.drawer}
        >
            <div className={styles.drawerContent}>
                {/* ========== SECTION 1: THÔNG TIN CHUNG ========== */}
                <div className={styles.section}>
                    <Title level={5} className={styles.sectionTitle}>
                        ℹ️ Thông tin chung
                    </Title>
                    <Descriptions
                        column={1}
                        size="small"
                        className={styles.descriptions}
                    >
                        <Descriptions.Item
                            label="Mã SKU"
                            className={styles.descriptionItem}
                        >
                            <strong>{renderValue(product.productCode)}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Tên sản phẩm"
                            className={styles.descriptionItem}
                        >
                            {renderValue(product.productName)}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Danh mục"
                            className={styles.descriptionItem}
                        >
                            {renderValue(product.category)}
                        </Descriptions.Item>
                        {industryType === 'GROCERY' && product.subCategory && (
                            <Descriptions.Item
                                label="Phân loại chi tiết"
                                className={styles.descriptionItem}
                            >
                                {renderValue(product.subCategory)}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item
                            label="Hãng sản xuất"
                            className={styles.descriptionItem}
                        >
                            {renderValue(product.manufacturer)}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Nhà cung cấp"
                            className={styles.descriptionItem}
                        >
                            {renderValue(product.supplier)}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Đơn vị tính"
                            className={styles.descriptionItem}
                        >
                            {renderValue(product.mainUnit)}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                <Divider className={styles.divider} />

                {/* ========== SECTION 2: ĐỊNH GIÁ & TỒN KHO ========== */}
                <div className={styles.section}>
                    <Title level={5} className={styles.sectionTitle}>
                        💰 Định giá & Tồn kho
                    </Title>
                    <Descriptions
                        column={2}
                        size="small"
                        className={styles.descriptions}
                    >
                        <Descriptions.Item
                            label="Giá bán"
                            className={styles.descriptionItem}
                        >
                            <span className={styles.priceHighlight}>
                                {formatPrice(product.price)}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Giá vốn"
                            className={styles.descriptionItem}
                        >
                            <span className={styles.costPrice}>
                                {formatPrice(product.cost)}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Tồn kho hiện tại"
                            className={styles.descriptionItem}
                        >
                            <strong className={styles.stockNumber}>
                                {renderValue(product.currentStock, 0)}
                            </strong>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label="Định mức tồn kho"
                            className={styles.descriptionItem}
                        >
                            {renderValue(product.minStock, 0)} - {renderValue(product.maxStock, 1000)}
                        </Descriptions.Item>
                    </Descriptions>
                    <div className={styles.trackingTypeContainer}>
                        <span className={styles.trackingLabel}>Cách quản lý kho:</span>
                        {industryType === 'GROCERY' ? (
                            <Tag color="geekblue">📦 Quản lý theo Lô/HSD</Tag>
                        ) : product.trackingType === 'IMEI' ? (
                            <Tag color="blue">📱 Quét IMEI</Tag>
                        ) : (
                            <Tag color="green">🔢 Đếm số lượng</Tag>
                        )}
                    </div>
                </div>

                <Divider className={styles.divider} />

                {/* ========== SECTION 3: ELECTRONICS SPECIFIC ========== */}
                {industryType === 'ELECTRONICS' && (
                    <>
                        <div className={styles.section}>
                            <Title level={5} className={styles.sectionTitle}>
                                ⚙️ Thông tin thiết bị
                            </Title>
                            <Descriptions
                                column={1}
                                size="small"
                                className={styles.descriptions}
                            >
                                {product.condition && (
                                    <Descriptions.Item
                                        label="Tình trạng máy"
                                        className={styles.descriptionItem}
                                    >
                                        {getConditionDisplay(product.condition)}
                                    </Descriptions.Item>
                                )}
                                {product.warrantyMonths && (
                                    <Descriptions.Item
                                        label="Bảo hành"
                                        className={styles.descriptionItem}
                                    >
                                        <Tag color="cyan">
                                            🛡️ {renderValue(product.warrantyMonths)} tháng
                                        </Tag>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>

                        <Divider className={styles.divider} />

                        {/* Render specifications table */}
                        {renderSpecificationsSection()}
                        {renderSpecificationsSection() && <Divider className={styles.divider} />}
                    </>
                )}

                {/* ========== SECTION 4: GROCERY SPECIFIC ========== */}
                {industryType === 'GROCERY' && (
                    <>
                        {/* Render unit conversions table */}
                        {renderUnitConversionsSection()}
                        {renderUnitConversionsSection() && (
                            <Divider className={styles.divider} />
                        )}

                        {/* Render batches table */}
                        {renderBatchesSection()}
                        {renderBatchesSection() && <Divider className={styles.divider} />}
                    </>
                )}

                {/* ========== SECTION 5: DESCRIPTION (OPT.) ========== */}
                {product.description && (
                    <div className={styles.section}>
                        <Title level={5} className={styles.sectionTitle}>
                            📝 Mô tả thêm
                        </Title>
                        <div className={styles.descriptionText}>
                            {product.description}
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default ProductDetailDrawer;
