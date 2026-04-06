import React from 'react';
import { Row, Col, Card, Skeleton } from 'antd';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Legend as RechartLegend,
  ResponsiveContainer,
} from 'recharts';
import styles from './ActivityCharts.module.css';

/**
 * ActivityCharts: Hiển thị 2 biểu đồ chính
 * 
 * 1. Bar Chart: Nhập/Xuất 7 ngày gần nhất
 * 2. Pie Chart: Cơ cấu tồn kho theo danh mục
 */
const ActivityCharts = ({ charts, loading }) => {
  // Colors for pie chart
  const COLORS = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#8dd1e1',
    '#d084d0',
    '#82d7d7',
    '#ffa07a',
    '#90ee90',
    '#87ceeb',
  ];

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Row gutter={[16, 16]} className={styles.chartsContainer}>
      {/* Chart 1: Bar Chart - Nhập/Xuất 7 ngày */}
      <Col xs={24} lg={12}>
        <Card
          title="Nhập/Xuất 7 Ngày Gần Nhất"
          className={styles.chartCard}
          loading={loading}
        >
          <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
            {charts?.sevenDayInOutChart && charts.sevenDayInOutChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.sevenDayInOutChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => date.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '16px' }} />
                  <Bar
                    dataKey="inboundQuantity"
                    name="Nhập (SL)"
                    fill="#52c41a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="outboundQuantity"
                    name="Xuất (SL)"
                    fill="#ff4d4f"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>Chưa có dữ liệu</div>
            )}
          </Skeleton>
        </Card>
      </Col>

      {/* Chart 2: Pie Chart - Cơ cấu tồn kho theo danh mục */}
      <Col xs={24} lg={12}>
        <Card
          title="Cơ Cấu Tồn Kho Theo Danh Mục"
          className={styles.chartCard}
          loading={loading}
        >
          <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
            {charts?.inventoryByCategory && charts.inventoryByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.inventoryByCategory}
                    cx="45%"
                    cy="50%"
                    labelLine={true}
                    label={({ category, percentage }) => `${category}\n${percentage}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.inventoryByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Giá trị (₫)']}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>Chưa có dữ liệu</div>
            )}
          </Skeleton>
        </Card>
      </Col>
    </Row>
  );
};

export default ActivityCharts;
