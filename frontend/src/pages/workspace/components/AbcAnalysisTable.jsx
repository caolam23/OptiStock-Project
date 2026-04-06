import React from 'react';
import { Table, Tag, Space, Empty, Spin } from 'antd';

/**
 * AbcAnalysisTable - Bảng phân tích ABC
 * 
 * Cột: Mã, Tên, Nhóm (A/B/C với Tag màu), Lượng bán, Giá, Doanh thu, % Lũy tích
 */
const AbcAnalysisTable = ({ data, loading }) => {
    /**
     * Lấy màu Tag dựa trên nhóm ABC
     */
    const getCategoryTag = (category) => {
        const colorMap = {
            A: 'red',      // Nhóm A - độ ưu tiên cao
            B: 'orange',   // Nhóm B - độ ưu tiên vừa
            C: 'green',    // Nhóm C - độ ưu tiên thấp
        };
        
        const labelMap = {
            A: 'Nhóm A (High)',
            B: 'Nhóm B (Medium)',
            C: 'Nhóm C (Low)',
        };
        
        return (
            <Tag color={colorMap[category] || 'default'}>
                {labelMap[category] || category}
            </Tag>
        );
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
            render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
            fixed: 'left',
        },
        {
            title: 'Tên Sản Phẩm',
            dataIndex: 'productName',
            key: 'productName',
            width: 200,
            ellipsis: true,
            fixed: 'left',
        },
        {
            title: 'Danh Mục',
            dataIndex: 'productCategory',
            key: 'productCategory',
            width: 120,
            render: (text) => <Tag>{text}</Tag>,
        },
        {
            title: 'Nhóm ABC',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category) => getCategoryTag(category),
            align: 'center',
        },
        {
            title: 'Lượng Bán',
            dataIndex: 'quantitySold',
            key: 'quantitySold',
            width: 100,
            render: (value) => <span style={{ fontWeight: '500' }}>{value?.toLocaleString()}</span>,
            align: 'right',
        },
        {
            title: 'Giá Bán (VND)',
            dataIndex: 'price',
            key: 'price',
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
            title: 'Doanh Thu (VND)',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            width: 150,
            render: (value) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {!value ? '0 ₫' : new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                    }).format(value)}
                </span>
            ),
            align: 'right',
        },
        {
            title: '% Lũy Tích',
            dataIndex: 'cumulativePercentage',
            key: 'cumulativePercentage',
            width: 100,
            render: (value) => (
                <span style={{ fontWeight: 'bold' }}>
                    {value?.toFixed(2)}%
                </span>
            ),
            align: 'center',
        },
    ];

    return (
        <Spin spinning={loading}>
            {!data || data.length === 0 ? (
                <Empty description="Không có dữ liệu phân tích ABC" style={{ marginTop: '32px' }} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="productId"
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                    bordered
                    size="middle"
                    scroll={{ x: 1200 }}
                    style={{ marginTop: '16px' }}
                />
            )}
        </Spin>
    );
};

export default AbcAnalysisTable;
