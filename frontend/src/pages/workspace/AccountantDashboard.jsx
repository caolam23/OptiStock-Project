import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import accountantApi from '../../api/accountantApi';
import DashboardCards from './components/DashboardCards';
import ActivityChart from './components/ActivityChart';
import styles from './AccountantDashboard.module.css';

/**
 * AccountantDashboard - Trang tổng quan tài chính cho vai trò ACCOUNTANT
 * 
 * Hiển thị:
 * - 4 thẻ thống kê chính (Tổng sản phẩm, Tồn kho, Phiếu hôm nay, Giá trị tồn kho)
 * - Biểu đồ hoạt động nhập/xuất 7 ngày
 */
const AccountantDashboard = () => {
    const { user, currentWorkspace } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    /**
     * Fetch dashboard summary data từ API
     */
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const workspaceId = currentWorkspace?.id;
            if (!workspaceId) {
                setError('Không tìm thấy workspace ID');
                setLoading(false);
                return;
            }

            console.log(`Fetching accountant dashboard for workspace: ${workspaceId}`);

            const response = await accountantApi.getDashboardSummary(workspaceId);

            console.log('API Response:', response);

            // Xử lý response
            if (response && response.success && response.data) {
                setDashboardData(response.data);
                setLastUpdated(new Date());
            } else if (response && response.data) {
                // Fallback nếu response không có success field
                setDashboardData(response.data);
                setLastUpdated(new Date());
            } else {
                setError(response?.message || 'Không thể tải dữ liệu dashboard');
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            
            // Log chi tiết lỗi
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
            
            const errorMessage = 
                err.response?.data?.message ||
                err.response?.statusText ||
                err.message ||
                'Lỗi khi tải dữ liệu dashboard';
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspace?.id]);

    /**
     * Load data khi component mount hoặc workspace thay đổi
     */
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatLastUpdated = (date) => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `Cập nhật lúc ${hours}:${minutes}`;
    };

    const chartData = dashboardData?.activityData || [];

    return (
        <Spin spinning={loading} size="large">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>📊 Tổng Quan Tài Chính</h1>
                        <div className={styles.lastUpdated}>
                            {formatLastUpdated(lastUpdated)}
                        </div>
                    </div>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchDashboardData}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: '16px' }}
                    />
                )}

                {/* Dashboard Cards - 4 KPI chính */}
                <DashboardCards data={dashboardData} loading={loading} />

                {/* Activity Chart - Biểu đồ hoạt động 7 ngày */}
                <ActivityChart data={chartData} loading={loading} />

                {/* Additional Info */}
                {dashboardData && (
                    <div style={{
                        background: '#fafafa',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                    }}>
                        <p style={{ margin: '0', fontSize: '12px', color: '#8c8c8c' }}>
                            <strong>Workspace:</strong> {currentWorkspace?.name || 'N/A'} | 
                            <strong> User:</strong> {user?.email || 'N/A'}
                        </p>
                        {dashboardData.lastUpdated && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#8c8c8c' }}>
                                <strong>Dữ liệu cập nhật:</strong> {new Date(dashboardData.lastUpdated).toLocaleString('vi-VN')}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Spin>
    );
};

export default AccountantDashboard;
