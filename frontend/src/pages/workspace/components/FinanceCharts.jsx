import React from 'react';
import { Card, Row, Col, Table, Spin, Empty } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

/**
 * FinanceCharts — Component hiển thị báo cáo COGS (Cost of Goods Sold)
 * - Biểu đồ đơn giản (text/stat) về doanh thu, chi phí, lợi nhuận
 * - Bảng tóm tắt lợi nhuận
 */
const FinanceCharts = ({ reportData, loading }) => {
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Dữ liệu cho bảng tóm tắt lợi nhuận
    const profitTableData = [
        {
            key: '1',
            metric: 'Doanh Thu Hôm Nay',
            value: reportData?.dailyRevenue || 0,
            icon: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
        },
        {
            key: '2',
            metric: 'Chi Phí Hôm Nay',
            value: reportData?.dailyExpense || 0,
            icon: <ArrowDownOutlined style={{ color: '#fa541c' }} />,
        },
        {
            key: '3',
            metric: 'Lợi Nhuận Hôm Nay',
            value: reportData?.dailyProfit || 0,
            icon: <ArrowUpOutlined style={{ color: '#1890ff' }} />,
        },
        {
            key: '4',
            metric: 'Doanh Thu Tháng Này',
            value: reportData?.monthlyRevenue || 0,
            icon: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
        },
        {
            key: '5',
            metric: 'Chi Phí Tháng Này',
            value: reportData?.monthlyExpense || 0,
            icon: <ArrowDownOutlined style={{ color: '#fa541c' }} />,
        },
    ];

    const profitColumns = [
        {
            title: 'Chỉ Tiêu',
            dataIndex: 'metric',
            key: 'metric',
            width: '50%',
            render: (text, record) => (
                <span>
                    {record.icon} {text}
                </span>
            ),
        },
        {
            title: 'Giá Trị',
            dataIndex: 'value',
            key: 'value',
            width: '50%',
            render: (value) => (
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {formatCurrency(value)}
                </span>
            ),
            align: 'right',
        },
    ];

    return (
        <Spin spinning={loading}>
            <Row gutter={[16, 16]}>
                {/* Card: Báo cáo Doanh Thu - Chi Phí - Lợi Nhuận */}
                <Col xs={24}>
                    <Card title="📊 Báo Cáo COGS & Lợi Nhuận" bordered>
                        <Table
                            columns={profitColumns}
                            dataSource={profitTableData}
                            pagination={false}
                            bordered
                            size="middle"
                            locale={{
                                emptyText: <Empty description="Không có dữ liệu báo cáo" />,
                            }}
                        />
                    </Card>
                </Col>

                {/* Card: Ghi chú về COGS */}
                <Col xs={24}>
                    <Card
                        title="💡 Ghi Chú"
                        size="small"
                        style={{ backgroundColor: '#fafafa' }}
                    >
                        <ul>
                            <li>
                                <strong>Doanh Thu (Revenue):</strong> Tổng tiền bán hàng
                                trong ngày/tháng
                            </li>
                            <li>
                                <strong>Chi Phí (Expense):</strong> Tổng chi phí
                                (vốn hàng, vận chuyển, v.v.)
                            </li>
                            <li>
                                <strong>Lợi Nhuận (Profit):</strong> Revenue - Expense
                            </li>
                        </ul>
                    </Card>
                </Col>
            </Row>
        </Spin>
    );
};

export default FinanceCharts;
