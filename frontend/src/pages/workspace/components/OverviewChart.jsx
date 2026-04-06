import React from 'react';
import { Card, Spin, Empty, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

/**
 * OverviewChart - Biểu đồ xu hướng Xuất/Nhập/Tồn kho
 * Sử dụng Ant Design Statistic thay vì Recharts để tránh dependency
 */
const OverviewChart = ({ data, loading }) => {
    const formatCurrency = (value) => {
        if (!value) return '0₫';
        return `${(value / 1000000).toFixed(1)}M₫`;
    };

    if (!data || data.length === 0) {
        return (
            <Card variant="filled" style={{ marginTop: '16px' }}>
                <Empty description="Không có dữ liệu" style={{ marginTop: '32px' }} />
            </Card>
        );
    }

    // Lấy dữ liệu tháng cuối cùng
    const latestMonth = data[data.length - 1];
    
    // Tính tổng
    const totalInbound = data.reduce((sum, item) => sum + (item.inbound || 0), 0);
    const totalOutbound = data.reduce((sum, item) => sum + (item.outbound || 0), 0);
    const avgStock = (data.reduce((sum, item) => sum + (item.stock || 0), 0) / data.length).toFixed(0);

    return (
        <Spin spinning={loading}>
            <Card
                title="📈 Xu Hướng Nhập/Xuất/Tồn Kho (6 Tháng)"
                variant="filled"
                style={{ marginTop: '16px' }}
            >
                {/* Timeline nhỏ */}
                <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
                        Tháng gần nhất: <strong>{latestMonth.month}</strong>
                    </div>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="Nhập Kho"
                                value={latestMonth.inbound}
                                prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                                formatter={(value) => formatCurrency(value)}
                                valueStyle={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="Xuất Kho"
                                value={latestMonth.outbound}
                                prefix={<ArrowDownOutlined style={{ color: '#faad14' }} />}
                                formatter={(value) => formatCurrency(value)}
                                valueStyle={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold' }}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="Tồn Kho"
                                value={latestMonth.stock}
                                formatter={(value) => formatCurrency(value)}
                                valueStyle={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Bảng mini */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #1890ff' }}>
                                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600 }}>Tháng</th>
                                <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>Nhập (VND)</th>
                                <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>Xuất (VND)</th>
                                <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>Tồn (VND)</th>
                                <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Xu hướng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '8px' }}>{item.month}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#52c41a', fontWeight: 500 }}>
                                        {formatCurrency(item.inbound)}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#faad14', fontWeight: 500 }}>
                                        {formatCurrency(item.outbound)}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#1890ff', fontWeight: 500 }}>
                                        {formatCurrency(item.stock)}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        {index > 0 && item.stock > data[index - 1].stock ? (
                                            <span style={{ color: '#52c41a' }}>↑</span>
                                        ) : index > 0 && item.stock < data[index - 1].stock ? (
                                            <span style={{ color: '#f5222d' }}>↓</span>
                                        ) : (
                                            <span style={{ color: '#8c8c8c' }}>→</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px', borderLeft: '4px solid #1890ff' }}>
                    <div style={{ fontSize: '13px', color: '#0050b3' }}>
                        <strong>💡 Tóm tắt:</strong> Tổng nhập {formatCurrency(totalInbound)} | 
                        Tổng xuất {formatCurrency(totalOutbound)} | 
                        Bình quân tồn {formatCurrency(avgStock)}
                    </div>
                </div>
            </Card>
        </Spin>
    );
};

export default OverviewChart;
