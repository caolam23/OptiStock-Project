import React from 'react';
import { Row, Col, Card, Table, Tag, Skeleton, Empty } from 'antd';
import { WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styles from './AlertWidgets.module.css';

/**
 * AlertWidgets: Hiển thị cảnh báo (Low Stock + Expiring Batches)
 * 
 * Layout: 2 cột
 * - Cột 1: Cảnh báo hết hàng (chung cho cả 2 ngành)
 * - Cột 2: Conditional Rendering dựa vào industryType
 *   - GROCERY: Cảnh báo hạn sử dụng
 *   - ELECTRONICS: Cảnh báo tồn đọng
 */
const AlertWidgets = ({ alerts, industryType, loading }) => {
  // Format số cách nhau bằng dấu phẩy
  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  };

  // Cột cho bảng hết hàng
  const lowStockColumns = [
    {
      title: 'Mã Sản Phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
      width: '15%',
      render: (code) => <span className={styles.boldText}>{code}</span>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: '25%',
      render: (name) => (
        <span className={styles.productName} title={name}>
          {name}
        </span>
      ),
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: '10%',
      render: (stock) => <span className={styles.redText}>{stock}</span>,
    },
    {
      title: 'Tối Thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
      width: '10%',
    },
    {
      title: 'Thiếu',
      dataIndex: 'stockDeficit',
      key: 'stockDeficit',
      width: '10%',
      render: (deficit) => (
        <Tag color="red" icon={<WarningOutlined />}>
          {deficit}
        </Tag>
      ),
    },
    {
      title: 'Giá Vốn',
      dataIndex: 'cost',
      key: 'cost',
      width: '15%',
      render: (cost) => `${formatNumber(cost)} ₫`,
    },
  ];

  // Cột cho bảng hạn sử dụng (GROCERY)
  const expiryBatchColumns = [
    {
      title: 'Mã Sản Phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
      width: '12%',
      render: (code) => <span className={styles.boldText}>{code}</span>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: '20%',
      render: (name) => (
        <span className={styles.productName} title={name}>
          {name}
        </span>
      ),
    },
    {
      title: 'Mã Lô',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: '12%',
      render: (code) => <span className={styles.boldText}>{code}</span>,
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: '15%',
      render: (date) => {
        const expiryDate = new Date(date);
        return expiryDate.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Còn Lại',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      width: '12%',
      render: (days) => {
        let alertColor = 'green';
        let icon = null;

        if (days <= 7) {
          alertColor = 'red';
          icon = <WarningOutlined />;
        } else if (days <= 14) {
          alertColor = 'orange';
          icon = <ClockCircleOutlined />;
        }

        return (
          <Tag color={alertColor} icon={icon}>
            {days} ngày
          </Tag>
        );
      },
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (qty) => formatNumber(qty),
    },
    {
      title: 'Mức Cảnh Báo',
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      width: '12%',
      render: (level) => {
        const colorMap = {
          CRITICAL: 'red',
          HIGH: 'orange',
          MEDIUM: 'yellow',
        };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      },
    },
  ];

  // Cột cho bảng tồn đọng (ELECTRONICS)
  const overstockColumns = [
    {
      title: 'Mã Sản Phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
      width: '15%',
      render: (code) => <span className={styles.boldText}>{code}</span>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: '30%',
      render: (name) => (
        <span className={styles.productName} title={name}>
          {name}
        </span>
      ),
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: '12%',
      render: (stock) => <span className={styles.orangeText}>{stock}</span>,
    },
    {
      title: 'Chuẩn',
      dataIndex: 'maxStock',
      key: 'maxStock',
      width: '12%',
    },
    {
      title: 'Vượt',
      dataIndex: 'overstockAmount',
      key: 'overstockAmount',
      width: '12%',
      render: (amount) => (
        <Tag color="orange" icon={<WarningOutlined />}>
          {amount}
        </Tag>
      ),
    },
    {
      title: 'Giá Vốn',
      dataIndex: 'cost',
      key: 'cost',
      width: '15%',
      render: (cost) => `${formatNumber(cost)} ₫`,
    },
  ];

  return (
    <Row gutter={[16, 16]} className={styles.alertsContainer}>
      {/* Table 1: Cảnh báo hết hàng (chung cho cả 2 ngành) */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <>
              <WarningOutlined className={styles.iconWarning} />
              Cảnh Báo Hết Hàng
            </>
          }
          className={styles.alertCard}
          loading={loading}
        >
          <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
            {alerts?.lowStockProducts && alerts.lowStockProducts.length > 0 ? (
              <>
                <div className={styles.alertCount}>
                  Tổng cộng: <strong>{alerts.totalLowStockCount}</strong> sản phẩm
                </div>
                <Table
                  columns={lowStockColumns}
                  dataSource={alerts.lowStockProducts}
                  rowKey="productId"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                  className={styles.table}
                />
              </>
            ) : (
              <Empty
                description="Không có sản phẩm nào dưới tồn kho tối thiểu"
                style={{ marginTop: '20px' }}
              />
            )}
          </Skeleton>
        </Card>
      </Col>

      {/* Table 2: Conditional Rendering theo industryType */}
      <Col xs={24} lg={12}>
        {industryType?.toUpperCase() === 'GROCERY' ? (
          // GROCERY: Cảnh báo hạn sử dụng
          <Card
            title={
              <>
                <ClockCircleOutlined className={styles.iconClock} />
                Cảnh Báo Hạn Sử Dụng
              </>
            }
            className={styles.alertCard}
            loading={loading}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              {alerts?.expiringBatches && alerts.expiringBatches.length > 0 ? (
                <>
                  <div className={styles.alertCount}>
                    Tổng cộng: <strong>{alerts.totalExpiringBatchCount}</strong> lô hàng
                  </div>
                  <Table
                    columns={expiryBatchColumns}
                    dataSource={alerts.expiringBatches}
                    rowKey={(record) => `${record.productId}-${record.batchCode}`}
                    pagination={false}
                    size="small"
                    scroll={{ x: 900 }}
                    className={styles.table}
                  />
                </>
              ) : (
                <Empty
                  description="Không có lô hàng nào sắp hết hạn trong 30 ngày"
                  style={{ marginTop: '20px' }}
                />
              )}
            </Skeleton>
          </Card>
        ) : (
          // ELECTRONICS: Cảnh báo tồn đọng / quá định mức
          <Card
            title={
              <>
                <WarningOutlined className={styles.iconWarning} />
                Cảnh Báo Tồn Đọng
              </>
            }
            className={styles.alertCard}
            loading={loading}
          >
            <div className={styles.alertMessage}>
              <p>Hiện tại không có sản phẩm nào vượt định mức tồn kho tối đa.</p>
              <p className={styles.smallText}>
                Tiếp tục theo dõi hànd kỳ để tránh dư thừa hàng bán chậm.
              </p>
            </div>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default AlertWidgets;
