import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Spin, message, Tag, Badge } from 'antd';
import reportApi from '../../../api/reportApi';
import styles from './ReportIndustrySpecific.module.css';

/**
 * ReportIndustrySpecific.jsx: Báo cáo đặc thù theo ngành hàng
 * 
 * GROCERY: Báo cáo lô hàng sắp hết hạn / quá hạn
 * ELECTRONICS: Báo cáo tồn đọng (Dead Stock)
 * 
 * Props:
 * - tenantId: Workspace ID
 * - industryType: ELECTRONICS | GROCERY
 */
const ReportIndustrySpecific = ({ tenantId, industryType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenantId && industryType) {
      fetchData();
    }
  }, [tenantId, industryType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (industryType === 'GROCERY') {
        const response = await reportApi.getExpiryReport(tenantId);
        if (response?.status === 'SUCCESS' && response?.data) {
          setData(response.data);
          console.log('✅ Expiry Report loaded:', response.data);
        }
      } else if (industryType === 'ELECTRONICS') {
        const response = await reportApi.getDeadstockReport(tenantId);
        if (response?.status === 'SUCCESS' && response?.data) {
          setData(response.data);
          console.log('✅ Deadstock Report loaded:', response.data);
        }
      }
    } catch (err) {
      console.error('❌ Lỗi fetch báo cáo:', err);
      message.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    const reportType = industryType === 'GROCERY' ? 'expiry-report' : 'deadstock-report';
    reportApi.exportToCsv(reportType, data);
    message.success('Xuất file thành công');
  };

  // ==================== GROCERY REPORT ====================

  if (industryType === 'GROCERY') {
    const columns = [
      {
        title: 'Mã SP',
        dataIndex: 'productCode',
        key: 'productCode',
        width: 120,
        render: (code) => <span className={styles.code}>{code}</span>,
      },
      {
        title: 'Tên Sản Phẩm',
        dataIndex: 'productName',
        key: 'productName',
        width: 200,
      },
      {
        title: 'Mã Lô',
        dataIndex: 'batchCode',
        key: 'batchCode',
        width: 120,
        render: (code) => <span className={styles.batchCode}>{code}</span>,
      },
      {
        title: 'Ngày Hết Hạn',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: 120,
        render: (date) => {
          if (!date) return '-';
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          return dateObj.toLocaleDateString('vi-VN');
        },
      },
      {
        title: 'Tồn Kho (Lô)',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        align: 'center',
      },
      {
        title: 'Ngày Còn Lại',
        dataIndex: 'daysRemaining',
        key: 'daysRemaining',
        width: 120,
        align: 'center',
        render: (days) => {
          if (typeof days === 'number') {
            if (days < 0) {
              return <span className={styles.expired}>Quá hạn {Math.abs(days)} ngày</span>;
            }
            return <span className={styles.warning}>{days} ngày</span>;
          }
          return '-';
        },
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'center',
        render: (status) => {
          if (status === 'EXPIRED') {
            return <Badge status="error" text="Quá Hạn" />;
          } else if (status === 'WARNING') {
            return <Badge status="warning" text="Cảnh Báo" />;
          }
          return <Badge status="success" text="OK" />;
        },
      },
    ];

    return (
      <Card
        title="📦 Báo Cáo Cận Date - Hết Hạn (Tạp Hóa)"
        className={styles.card}
        extra={
          <button className={styles.exportBtn} onClick={handleExport}>
            📥 Xuất Excel
          </button>
        }
      >
        <Spin spinning={loading}>
          {data.length > 0 ? (
            <div className={styles.tableWrapper}>
              <div className={styles.alert}>
                <span>⚠️ Phát hiện {data.length} lô hàng cần chú ý</span>
              </div>
              <Table
                columns={columns}
                dataSource={data}
                rowKey={(record, idx) => `${record.productCode}-${record.batchCode}-${idx}`}
                pagination={{ pageSize: 15 }}
                bordered
                size="small"
                scroll={{ x: 1000 }}
              />
            </div>
          ) : (
            <Empty description="✅ Không có lô hàng sắp hết hạn" />
          )}
        </Spin>
      </Card>
    );
  }

  // ==================== ELECTRONICS REPORT ====================

  const columns = [
    {
      title: 'Mã SKU',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (code) => <span className={styles.code}>{code}</span>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 220,
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Lần Xuất Cuối',
      dataIndex: 'lastSalesDate',
      key: 'lastSalesDate',
      width: 120,
      render: (date) => {
        if (!date) return <span className={styles.never}>Chưa bán</span>;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Số Ngày Lưu Kho',
      dataIndex: 'daysInStock',
      key: 'daysInStock',
      width: 130,
      align: 'center',
      render: (days) => {
        if (typeof days === 'number') {
          return (
            <span className={days >= 90 ? styles.critical : styles.warning}>
              {days} ngày
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: 'Mức Cảnh Báo',
      dataIndex: 'daysStockWarning',
      key: 'daysStockWarning',
      width: 140,
      align: 'center',
      render: (warning) => {
        if (warning === 'CRITICAL_90_DAYS') {
          return (
            <Tag color="red" className={styles.tag}>
              🔴 Quá 90 Ngày
            </Tag>
          );
        } else if (warning === 'WARNING_60_DAYS') {
          return (
            <Tag color="orange" className={styles.tag}>
              🟠 Quá 60 Ngày
            </Tag>
          );
        }
        return <Tag color="green">OK</Tag>;
      },
    },
  ];

  return (
    <Card
      title="💀 Báo Cáo Tồn Đọng - Dead Stock (Điện Tử)"
      className={styles.card}
      extra={
        <button className={styles.exportBtn} onClick={handleExport}>
          📥 Xuất Excel
        </button>
      }
    >
      <Spin spinning={loading}>
        {data.length > 0 ? (
          <div className={styles.tableWrapper}>
            <div className={styles.alert}>
              <span>⚠️ Phát hiện {data.length} sản phẩm lưu kho quá lâu (&gt;60 ngày)</span>
            </div>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="productCode"
              pagination={{ pageSize: 15 }}
              bordered
              size="small"
              scroll={{ x: 1200 }}
            />
          </div>
        ) : (
          <Empty description="✅ Không có sản phẩm dead stock" />
        )}
      </Spin>
    </Card>
  );
};

export default ReportIndustrySpecific;
