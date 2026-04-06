import React from 'react';
import { Card, Skeleton, Empty } from 'antd';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import styles from '../AccountantDashboard.module.css';

/**
 * Định dạng tiền tệ VND
 */
const formatCurrency = (value) => {
    if (!value && value !== 0) return '0 ₫';
    
    // Handle BigDecimal values that come as strings from backend
    let numValue = value;
    if (typeof value === 'string') {
        numValue = parseFloat(value);
    }
    
    if (isNaN(numValue) || numValue === 0) return '0 ₫';
    if (numValue >= 1000000) {
        return (numValue / 1000000).toFixed(1) + 'M ₫';
    }
    if (numValue >= 1000) {
        return (numValue / 1000).toFixed(1) + 'K ₫';
    }
    return numValue.toFixed(0) + ' ₫';
};

/**
 * CustomTooltip - Hiển thị thông tin chi tiết khi hover lên chart
 */
const CustomTooltip = ({ active, payload, label }) => {

    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * ActivityChart - Biểu đồ hoạt động nhập/xuất hàng trong 7 ngày gần nhất
 * 
 * Hiển thị so sánh giữa giá trị nhập kho vs xuất kho theo ngày
 */
const ActivityChart = ({ data, loading }) => {

    if (loading) {
        return (
            <Card className={styles.chartCard}>
                <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card title="📊 Biểu Đồ Hoạt Động (7 Ngày)" className={styles.chartCard}>
                <Empty description="Không có dữ liệu hoạt động" style={{ marginTop: '32px' }} />
            </Card>
        );
    }

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = data.map((item) => ({
        date: item.date,
        'Nhập Kho': item.importValue ? (typeof item.importValue === 'string' ? parseFloat(item.importValue) : item.importValue) : 0,
        'Xuất Kho': item.exportValue ? (typeof item.exportValue === 'string' ? parseFloat(item.exportValue) : item.exportValue) : 0,
    }));

    return (
        <Card title="📊 Biểu Đồ Hoạt Động (7 Ngày)" className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorImport" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorExport" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f5222d" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#8c8c8c" />
                    <YAxis stroke="#8c8c8c" tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    <Area
                        type="monotone"
                        dataKey="Nhập Kho"
                        stroke="#52c41a"
                        fillOpacity={1}
                        fill="url(#colorImport)"
                        isAnimationActive={true}
                    />
                    <Area
                        type="monotone"
                        dataKey="Xuất Kho"
                        stroke="#f5222d"
                        fillOpacity={1}
                        fill="url(#colorExport)"
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className={styles.chartSummary}>
                {chartData.map((item, index) => (
                    <div key={index} className={styles.summaryRow}>
                        <span className={styles.summaryDate}>{item.date}</span>
                        <span style={{ color: '#52c41a' }}>
                            ▲ {formatCurrency(item['Nhập Kho'])}
                        </span>
                        <span style={{ color: '#f5222d' }}>
                            ▼ {formatCurrency(item['Xuất Kho'])}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ActivityChart;
