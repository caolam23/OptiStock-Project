import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Table, Empty, Spin, message, Tag } from 'antd';
import reportApi from '../../../api/reportApi';
import styles from './ReportAbcAnalysis.module.css';

/**
 * ReportAbcAnalysis.jsx: Phân tích ABC
 * 
 * Hiển thị:
 * - PieChart: Tỷ lệ ABC
 * - Table: Danh sách SKU kèm nhãn A/B/C
 * 
 * Props:
 * - tenantId: Workspace ID
 * - industryType: ELECTRONICS | GROCERY
 */
const ReportAbcAnalysis = ({ tenantId, industryType }) => {
  const [summary, setSummary] = useState(null);
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenantId && industryType) {
      fetchData();
    }
  }, [tenantId, industryType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy summary cho PieChart
      const summaryResponse = await reportApi.getAbcSummary(tenantId, industryType);
      if (summaryResponse?.status === 'SUCCESS') {
        setSummary(summaryResponse.data);
        console.log('✅ ABC Summary loaded:', summaryResponse.data);
      }

      // Lấy chi tiết SKU
      const analysisResponse = await reportApi.getAbcAnalysis(tenantId, industryType);
      if (analysisResponse?.status === 'SUCCESS' && analysisResponse?.data) {
        setAnalysisData(analysisResponse.data);
        console.log('✅ ABC Analysis loaded:', analysisResponse.data);
      }
    } catch (err) {
      console.error('❌ Lỗi fetch ABC analysis:', err);
      message.error('Không thể tải báo cáo ABC');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (analysisData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    reportApi.exportToCsv('abc-analysis', analysisData);
    message.success('Xuất file thành công');
  };

  // Prepare PieChart data
  const pieData = summary
    ? [
        { name: 'Class A', value: summary.classA?.count || 0, fill: '#10b981' },
        { name: 'Class B', value: summary.classB?.count || 0, fill: '#f59e0b' },
        { name: 'Class C', value: summary.classC?.count || 0, fill: '#9ca3af' },
      ]
    : [];

  // Get classification color
  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'A':
        return 'success'; // Green
      case 'B':
        return 'warning'; // Orange
      case 'C':
        return 'default'; // Gray
      default:
        return 'default';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'productCode',
      key: 'productCode',
      render: (code) => <span className={styles.code}>{code}</span>,
      width: 120,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
    },
    {
      title: 'Giá Trị (đ)',
      dataIndex: 'value',
      key: 'value',
      render: (value) => {
        if (typeof value === 'number') {
          return (
            <span className={styles.value}>
              {value.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
            </span>
          );
        }
        return '-';
      },
      width: 150,
      align: 'right',
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Phân Loại',
      dataIndex: 'classification',
      key: 'classification',
      render: (classification) => (
        <Tag color={getClassificationColor(classification)} className={styles.classTag}>
          Class {classification}
        </Tag>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Tích Lũy %',
      dataIndex: 'cumulativePercentage',
      key: 'cumulativePercentage',
      render: (percentage) => {
        if (typeof percentage === 'number') {
          return <span className={styles.percentage}>{percentage.toFixed(2)}%</span>;
        }
        return '-';
      },
      width: 100,
      align: 'right',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.gridLayout}>
        {/* PieChart Card */}
        <Card className={styles.pieCard} title="📈 Phân Bố ABC">
          <Spin spinning={loading}>
            {pieData.length > 0 && summary ? (
              <div className={styles.pieWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Summary */}
                <div className={styles.summaryCards}>
                  <div className={`${styles.summaryCard} ${styles.classA}`}>
                    <span className={styles.label}>Class A</span>
                    <span className={styles.count}>{summary.classA?.count || 0}</span>
                    <span className={styles.percentage}>{summary.classA?.percentage || 0}%</span>
                  </div>
                  <div className={`${styles.summaryCard} ${styles.classB}`}>
                    <span className={styles.label}>Class B</span>
                    <span className={styles.count}>{summary.classB?.count || 0}</span>
                    <span className={styles.percentage}>{summary.classB?.percentage || 0}%</span>
                  </div>
                  <div className={`${styles.summaryCard} ${styles.classC}`}>
                    <span className={styles.label}>Class C</span>
                    <span className={styles.count}>{summary.classC?.count || 0}</span>
                    <span className={styles.percentage}>{summary.classC?.percentage || 0}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Spin>
        </Card>
      </div>

      {/* Table Card */}
      <Card
        title="📋 Chi Tiết SKU"
        className={styles.tableCard}
        style={{ marginTop: 24 }}
        extra={
          <button className={styles.exportBtn} onClick={handleExport}>
            📥 Xuất Excel
          </button>
        }
      >
        <Spin spinning={loading}>
          {analysisData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={analysisData}
              rowKey="productCode"
              pagination={{ pageSize: 10 }}
              bordered
              size="small"
            />
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default ReportAbcAnalysis;
