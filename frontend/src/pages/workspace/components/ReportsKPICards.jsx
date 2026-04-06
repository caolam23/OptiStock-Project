import React from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { ShoppingCartOutlined, WarningOutlined, ThunderboltOutlined } from '@ant-design/icons';
import styles from '../Reports.module.css';

/**
 * ReportsKPICards - Hiển thị 3 KPI chính
 * - Tổng vốn hàng tồn kho
 * - Tổng giá trị hàng Dead Stock (cảnh báo)
 * - Tỷ lệ vòng quay hàng tồn kho (Turnover Rate)
 */
const ReportsKPICards = ({ deadStockData, loading }) => {
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Tính toán KPI từ dữ liệu
    const totalInventoryValue = deadStockData?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0;
    
    // Dead Stock Value (giả định các items trong list này là dead stock)
    const deadStockValue = deadStockData?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0;
    
    // Tỷ lệ vòng quay (mock: 2.5x/năm)
    const turnoverRate = '2.5x/năm';

    return (
        <Row gutter={[16, 16]} className={styles.kpiRow}>
            {/* KPI 1: Tổng vốn hàng tồn kho */}
            <Col xs={24} sm={12} lg={8}>
                <Card className={styles.kpiCard} hoverable>
                    <Spin spinning={loading}>
                        <Statistic
                            title="Tổng Vốn Hàng Tồn Kho"
                            value={totalInventoryValue}
                            prefix={<ShoppingCartOutlined style={{ marginRight: 8 }} />}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{
                                color: '#1890ff',
                                fontSize: '20px',
                                fontWeight: 'bold',
                            }}
                        />
                    </Spin>
                </Card>
            </Col>

            {/* KPI 2: Tổng giá trị Dead Stock (Cảnh báo) */}
            <Col xs={24} sm={12} lg={8}>
                <Card className={styles.kpiCard} hoverable>
                    <Spin spinning={loading}>
                        <Statistic
                            title="Giá Trị Hàng Dead Stock (>90 ngày)"
                            value={deadStockValue}
                            prefix={<WarningOutlined style={{ marginRight: 8 }} />}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{
                                color: deadStockValue > 0 ? '#f5222d' : '#52c41a',
                                fontSize: '20px',
                                fontWeight: 'bold',
                            }}
                            suffix={
                                deadStockValue > 0 ? (
                                    <span style={{ color: '#f5222d', fontSize: '12px', marginLeft: '8px' }}>
                                        ⚠️ Cần xử lý
                                    </span>
                                ) : null
                            }
                        />
                    </Spin>
                </Card>
            </Col>

            {/* KPI 3: Tỷ lệ vòng quay hàng */}
            <Col xs={24} sm={12} lg={8}>
                <Card className={styles.kpiCard} hoverable>
                    <Spin spinning={loading}>
                        <Statistic
                            title="Tỷ Lệ Vòng Quay Hàng Tồn"
                            value={turnoverRate}
                            prefix={<ThunderboltOutlined style={{ marginRight: 8 }} />}
                            valueStyle={{
                                color: '#52c41a',
                                fontSize: '20px',
                                fontWeight: 'bold',
                            }}
                            suffix="(Năm)"
                        />
                    </Spin>
                </Card>
            </Col>
        </Row>
    );
};

export default ReportsKPICards;
