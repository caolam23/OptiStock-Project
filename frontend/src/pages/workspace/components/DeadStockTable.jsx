import React from 'react';
import { Table, Tag, Space, Empty, Spin, Button, Tooltip, Alert } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

/**
 * DeadStockTable - Bảng canh báo hàng tồn không bán (>90 ngày)
 * 
 * Cột: Mã, Tên, Danh mục, Tình trạng, Ngày không bán, Tồn kho, Giá vốn, Tổng vốn giam
 * Hành động: Xem chi tiết, Xóa/Xử lý
 */
const DeadStockTable = ({ data, loading, onDelete = null }) => {
    /**
     * Lấy badge cảnh báo
     */
    const getAlertBadge = (days) => {
        if (days >= 180) return <Tag color="error">🔴 Crit</Tag>;
        if (days >= 120) return <Tag color="orange">🟠 High</Tag>;
        return <Tag color="gold">🟡 Medium</Tag>;
    };

    const columns = [
        {
            title: 'STT',
            width: 60,
            render: (_, __, index) => index + 1,
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Mã Sản Phẩm',
            dataIndex: 'productCode',
            key: 'productCode',
            width: 100,
            render: (text) => <span style={{ fontWeight: '500', color: '#0050b3' }}>{text}</span>,
            fixed: 'left',
        },
        {
            title: 'Tên Sản Phẩm',
            dataIndex: 'productName',
            key: 'productName',
            width: 180,
            ellipsis: {
                showTitle: false,
            },
            render: (text) => <Tooltip title={text}>{text}</Tooltip>,
            fixed: 'left',
        },
        {
            title: 'Danh Mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (text) => <Tag>{text}</Tag>,
        },
        {
            title: 'Tình Trạng',
            dataIndex: 'condition',
            key: 'condition',
            width: 120,
            render: (text) => {
                const colorMap = {
                    'New': 'green',
                    'Like New': 'cyan',
                    'Good': 'blue',
                    'Refurbished': 'orange',
                    'Display': 'gold',
                };
                return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
            },
            align: 'center',
        },
        {
            title: 'Ngày Không Bán',
            dataIndex: 'daysSinceLastSale',
            key: 'daysSinceLastSale',
            width: 140,
            render: (days) => (
                <Space>
                    {getAlertBadge(days)}
                    <span style={{ fontWeight: 'bold' }}>{days} ngày</span>
                </Space>
            ),
            align: 'center',
            sorter: (a, b) => b.daysSinceLastSale - a.daysSinceLastSale,
        },
        {
            title: 'Tồn Kho',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            width: 80,
            render: (value) => <span style={{ fontWeight: '500' }}>{value} cái</span>,
            align: 'right',
        },
        {
            title: 'Giá Vốn (VND)',
            dataIndex: 'costPrice',
            key: 'costPrice',
            width: 150,
            render: (value) => {
                if (!value) return '0 ₫';
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                }).format(value);
            },
            align: 'right',
        },
        {
            title: 'Tổng Vốn Giam (VND)',
            dataIndex: 'totalValue',
            key: 'totalValue',
            width: 150,
            render: (value) => (
                <span style={{ fontWeight: 'bold', color: '#f5222d' }}>
                    {!value ? '0 ₫' : new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                    }).format(value)}
                </span>
            ),
            align: 'right',
            sorter: (a, b) => b.totalValue - a.totalValue,
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                console.log('View detail:', record);
                                // Có thể mở modal chi tiết
                            }}
                        />
                    </Tooltip>
                    {onDelete && (
                        <Tooltip title="Đánh dấu xử lý/Xóa">
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => onDelete(record.productId)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
            align: 'center',
            fixed: 'right',
        },
    ];

    const totalDeadStockValue = data?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0;

    return (
        <Spin spinning={loading}>
            {!data || data.length === 0 ? (
                <Empty description="Không có hàng Dead Stock" style={{ marginTop: '32px' }} />
            ) : (
                <>
                    {/* Alert cảnh báo */}
                    <Alert
                        message={`⚠️ Tổng vốn hàng tồn >90 ngày: ${
                            !totalDeadStockValue ? '0 ₫' : new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                                minimumFractionDigits: 0,
                            }).format(totalDeadStockValue)
                        }`}
                        description="Cần xem xét các chiến lược khuyến mãi, thanh lý hoặc điều chỉnh hàng tồn."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="productId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} sản phẩm`,
                        }}
                        bordered
                        size="middle"
                        scroll={{ x: 1300 }}
                    />
                </>
            )}
        </Spin>
    );
};

export default DeadStockTable;
