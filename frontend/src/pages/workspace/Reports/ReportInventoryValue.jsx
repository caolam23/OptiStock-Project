import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Empty, Spin, message } from 'antd';
import reportApi from '../../../api/reportApi';
import styles from './ReportInventoryValue.module.css';

/**
 * ReportInventoryValue.jsx: Biểu đồ giá trị tồn kho theo danh mục
 * 
 * Hiển thị:
 * - BarChart: Category vs totalValue (Giá trị tồn kho)
 * - Metrics: totalQuantity, totalValue, avgCost
 * 
 * Props:
 * - tenantId: Workspace ID
 * - industryType: ELECTRONICS | GROCERY
 */
const ReportInventoryValue = ({ tenantId, industryType }) => {
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
      const response = await reportApi.getInventoryValuation(tenantId, industryType);
      if (response?.status === 'SUCCESS' && response?.data) {
        setData(response.data);
        console.log('✅ Inventory Valuation loaded:', response.data);
      }
    } catch (err) {
      console.error('❌ Lỗi fetch inventory valuation:', err);
      message.error('Không thể tải báo cáo giá trị tồn kho');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    reportApi.exportToCsv('inventory-valuation', data);
    message.success('Xuất file thành công');
  };

  return (
    <div className={styles.container}>
      <Card
        title="📊 Giá Trị Tồn Kho Theo Danh Mục"
        className={styles.chartCard}
        extra={
          <button className={styles.exportBtn} onClick={handleExport}>
            📥 Xuất Excel
          </button>
        }
      >
        <Spin spinning={loading}>
          {data.length > 0 ? (
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => {
                      if (typeof value === 'number') {
                        return value.toLocaleString('vi-VN', {
                          maximumFractionDigits: 2,
                        });
                      }
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalValue" fill="#8884d8" name="Giá Trị (đ)" />
                  <Bar dataKey="totalQuantity" fill="#82ca9d" name="Tồn Kho (cái)" />
                </BarChart>
              </ResponsiveContainer>

              {/* Summary stats */}
              <div className={styles.summaryStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Tổng Danh Mục</span>
                  <span className={styles.statValue}>{data.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Tổng Giá Trị</span>
                  <span className={styles.statValue}>
                    {data
                      .reduce((sum, item) => sum + (item.totalValue || 0), 0)
                      .toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                    đ
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Tổng Tồn Kho</span>
                  <span className={styles.statValue}>
                    {data.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default ReportInventoryValue;
