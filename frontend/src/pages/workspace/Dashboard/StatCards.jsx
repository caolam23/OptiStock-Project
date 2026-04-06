import React from 'react';
import { Row, Col, Statistic, Card, Skeleton } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import styles from './StatCards.module.css';

/**
 * StatCards: Hiển thị 4 card thống kê chính cho Dashboard
 * 
 * Card hiển thị:
 * 1. Tổng giá trị kho (VNĐ)
 * 2. Số SKU hoạt động (có tồn kho > 0)
 * 3. Phiếu chờ xử lý
 * 4. Sản phẩm hết hàng
 */
const StatCards = ({ summary, loading }) => {
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  };

  return (
    <Row gutter={[16, 16]} className={styles.statsContainer}>
      {/* Card 1: Tổng giá trị kho */}
      <Col xs={24} sm={12} lg={6}>
        <Card className={styles.statCard} loading={loading}>
          <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Tổng Giá Trị Kho"
              value={summary?.totalInventoryValue || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#1890ff', fontSize: '1.8rem', fontWeight: 'bold' }}
            />
          </Skeleton>
        </Card>
      </Col>

      {/* Card 2: Số SKU hoạt động */}
      <Col xs={24} sm={12} lg={6}>
        <Card className={styles.statCard} loading={loading}>
          <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="SKU Hoạt Động"
              value={summary?.totalActiveSkus || 0}
              prefix={<ShoppingCartOutlined />}
              suffix="sản phẩm"
              valueStyle={{ color: '#52c41a', fontSize: '1.8rem', fontWeight: 'bold' }}
            />
          </Skeleton>
        </Card>
      </Col>

      {/* Card 3: Phiếu chờ xử lý */}
      <Col xs={24} sm={12} lg={6}>
        <Card className={styles.statCard} loading={loading}>
          <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Phiếu Chờ Xử Lý"
              value={summary?.pendingVouchers || 0}
              prefix={<FileTextOutlined />}
              suffix="phiếu"
              valueStyle={{ color: '#faad14', fontSize: '1.8rem', fontWeight: 'bold' }}
            />
          </Skeleton>
        </Card>
      </Col>

      {/* Card 4: Sản phẩm hết hàng */}
      <Col xs={24} sm={12} lg={6}>
        <Card className={styles.statCard} loading={loading}>
          <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
            <Statistic
              title="Hết Hàng"
              value={summary?.outOfStockProducts || 0}
              prefix={<WarningOutlined />}
              suffix="sản phẩm"
              valueStyle={{ color: '#f5222d', fontSize: '1.8rem', fontWeight: 'bold' }}
            />
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
};

export default StatCards;
