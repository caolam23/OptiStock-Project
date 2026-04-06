import React from 'react';
import { Row, Col, Statistic, Skeleton, Space } from 'antd';
import {
    ShoppingOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import styles from '../AccountantDashboard.module.css';

/**
 * DashboardCards - Hiển thị 4 thẻ thống kê chính
 * 
 * Các thẻ: Tổng sản phẩm, Tồn kho, Phiếu hôm nay, Giá trị tồn kho
 */
const DashboardCards = ({ data, loading }) => {
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        
        // Handle BigDecimal values that come as strings from backend
        let numValue = value;
        if (typeof value === 'string') {
            numValue = parseFloat(value);
        }
        
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(numValue);
    };

    if (loading) {
        return (
            <Row gutter={[16, 16]} className={styles.dashboardCards}>
                {[1, 2, 3, 4].map((i) => (
                    <Col span={6} key={i}>
                        <div className={styles.cardContainer}>
                            <Skeleton active paragraph={{ rows: 2 }} />
                        </div>
                    </Col>
                ))}
            </Row>
        );
    }

    const cards = [
        {
            title: 'Tổng Sản Phẩm',
            value: data?.totalProducts || 0,
            icon: <ShoppingOutlined className={styles.icon} style={{ color: '#1890ff' }} />,
            suffix: 'sản phẩm',
        },
        {
            title: 'Tồn Kho',
            value: data?.totalStockQuantity || 0,
            icon: <DatabaseOutlined className={styles.icon} style={{ color: '#52c41a' }} />,
            suffix: 'cái',
        },
        {
            title: 'Phiếu Hôm Nay',
            value: data?.todayVouchersCount || 0,
            icon: <FileTextOutlined className={styles.icon} style={{ color: '#faad14' }} />,
            suffix: 'phiếu',
        },
        {
            title: 'Giá Trị Tồn Kho',
            value: data?.totalInventoryValue || 0,
            icon: <DollarOutlined className={styles.icon} style={{ color: '#f5222d' }} />,
            isCurrency: true,
        },
    ];

    return (
        <Row gutter={[16, 16]} className={styles.dashboardCards}>
            {cards.map((card, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <div className={styles.cardContainer}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div className={styles.cardHeader}>
                                {card.icon}
                                <span className={styles.cardTitle}>{card.title}</span>
                            </div>
                            <div className={styles.cardContent}>
                                {card.isCurrency ? (
                                    <div className={styles.currencyValue}>
                                        {formatCurrency(card.value)}
                                    </div>
                                ) : (
                                    <Statistic
                                        value={card.value}
                                        suffix={card.suffix}
                                        valueStyle={{ color: '#262626', fontSize: '24px', fontWeight: '600' }}
                                    />
                                )}
                            </div>
                        </Space>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default DashboardCards;
