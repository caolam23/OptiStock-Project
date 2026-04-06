import React from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { DollarOutlined, SwapOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import styles from '../Finance.module.css';

/**
 * FinanceDashboardCards — Component hiển thị 3 KPI chính
 * - Tổng giá trị tồn kho (WAC)
 * - Tổng nợ phải thu (Receivable)
 * - Tổng nợ phải trả (Payable)
 */
const FinanceDashboardCards = ({ metricsData, loading }) => {
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Row gutter={[16, 16]} className={styles.kpiRow}>
            {/* Card 1: Tổng giá trị tồn kho */}
            <Col xs={24} sm={12} lg={8}>
                <Card className={styles.kpiCard}>
                    <Spin spinning={loading}>
                        <Statistic
                            title="Tổng Giá Trị Tồn Kho"
                            value={metricsData?.totalInventoryValue || 0}
                            prefix={<ShoppingCartOutlined />}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}
                        />
                    </Spin>
                </Card>
            </Col>

            {/* Card 2: Tổng nợ phải thu */}
            <Col xs={24} sm={12} lg={8}>
                <Card className={styles.kpiCard}>
                    <Spin spinning={loading}>
                        <Statistic
                            title="Nợ Phải Thu (Receivable)"
                            value={metricsData?.totalAccountsReceivable || 0}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
                        />
                    </Spin>
                </Card>
            </Col>

            {/* Card 3: Tổng nợ phải trả */}
            <Col xs={24} sm={12} lg={8}>
                <Card className={styles.kpiCard}>
                    <Spin spinning={loading}>
                        <Statistic
                            title="Nợ Phải Trả (Payable)"
                            value={metricsData?.totalAccountsPayable || 0}
                            prefix={<SwapOutlined />}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#fa8c16', fontSize: '20px', fontWeight: 'bold' }}
                        />
                    </Spin>
                </Card>
            </Col>
        </Row>
    );
};

export default FinanceDashboardCards;
