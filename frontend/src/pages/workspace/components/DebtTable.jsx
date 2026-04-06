import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Spin, Empty } from 'antd';
import { DeleteOutlined, DollarOutlined } from '@ant-design/icons';

/**
 * DebtTable — Component hiển thị bảng quản lý công nợ
 * Cột: Mã đối tác, Tên, Loại, Tổng nợ, Hạn mức, Dư nợ, Trạng thái
 */
const DebtTable = ({
    debts,
    loading,
    onPayDebt,
    onDeleteDebt,
}) => {
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    /**
     * Xác định màu Tag dựa trên trạng thái vượt hạn mức
     */
    const getStatusTag = (debt) => {
        if (debt.status === 'SETTLED') {
            return <Tag color="success">Đã thanh toán</Tag>;
        }

        if (debt.status === 'OVERDUE') {
            return <Tag color="error">Quá hạn</Tag>;
        }

        // Kiểm tra nếu dư nợ vượt hạn mức
        const isOverCreditLimit =
            parseFloat(debt.balance) > parseFloat(debt.creditLimit);
        return isOverCreditLimit ? (
            <Tooltip title="Vượt hạn mức tín dụng">
                <Tag color="red">Vượt hạn mức</Tag>
            </Tooltip>
        ) : (
            <Tag color="green">An toàn</Tag>
        );
    };

    /**
     * Format cột "Loại công nợ"
     */
    const getDebtTypeTag = (type) => {
        if (type === 'PAYABLE') {
            return <Tag color="orange">Phải Trả</Tag>;
        }
        return <Tag color="blue">Phải Thu</Tag>;
    };

    const columns = [
        {
            title: 'Mã Đối Tác',
            dataIndex: 'partnerId',
            key: 'partnerId',
            width: '12%',
        },
        {
            title: 'Tên Đối Tác',
            dataIndex: 'partnerName',
            key: 'partnerName',
            width: '18%',
        },
        {
            title: 'Phân Loại',
            dataIndex: 'type',
            key: 'type',
            width: '10%',
            render: (type) => getDebtTypeTag(type),
        },
        {
            title: 'Tổng Nợ',
            dataIndex: 'totalDebt',
            key: 'totalDebt',
            width: '12%',
            render: (value) => (
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(value)}</span>
            ),
        },
        {
            title: 'Hạn Mức',
            dataIndex: 'creditLimit',
            key: 'creditLimit',
            width: '12%',
            render: (value) => formatCurrency(value),
        },
        {
            title: 'Dư Nợ',
            dataIndex: 'balance',
            key: 'balance',
            width: '12%',
            render: (value) => (
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (_, record) => getStatusTag(record),
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: '14%',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Thanh toán">
                        <Button
                            type="primary"
                            size="small"
                            icon={<DollarOutlined />}
                            onClick={() => onPayDebt && onPayDebt(record)}
                        >
                            TT
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => onDeleteDebt && onDeleteDebt(record.id)}
                        >
                            Xóa
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Spin spinning={loading}>
            <Table
                columns={columns}
                dataSource={debts}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} công nợ`,
                }}
                locale={{
                    emptyText: <Empty description="Không có dữ liệu công nợ" />,
                }}
                bordered
                size="middle"
            />
        </Spin>
    );
};

export default DebtTable;
