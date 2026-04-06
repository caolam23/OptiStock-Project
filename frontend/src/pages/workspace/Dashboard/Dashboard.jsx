import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Spin, Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import StatCards from './StatCards';
import ActivityCharts from './ActivityCharts';
import AlertWidgets from './AlertWidgets';
import dashboardApi from '../../../api/dashboardApi';
import styles from './Dashboard.module.css';

/**
 * Dashboard (Overview): Trang tổng quan cho hệ thống OptiStock
 * 
 * Hỗ trợ 2 ngành hàng:
 * - ELECTRONICS (Điện tử): Hiển thị cảnh báo tồn đọng
 * - GROCERY (Tạp hóa): Hiển thị cảnh báo hạn sử dụng
 * 
 * Cấu trúc:
 * - Row 1: StatCards (4 card thống kê)
 * - Row 2: ActivityCharts (2 biểu đồ: Bar + Pie)
 * - Row 3: AlertWidgets (2 bảng: hết hàng + industry-specific alerts)
 * 
 * State Management:
 * - dashboardData: Tất cả dữ liệu từ API (summary + alerts + charts)
 * - loading: Trạng thái loading khi fetch dữ liệu
 * - error: Thông báo lỗi nếu có
 */
const Dashboard = () => {
  const { currentWorkspace } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const workspaceId = currentWorkspace?.id;
  const industryType = currentWorkspace?.industryCode; // Lấy từ workspace context

  // ==================== FETCH DASHBOARD DATA ====================

  const fetchDashboardData = async () => {
    if (!workspaceId) {
      console.warn('⚠️ workspaceId not found in context:', currentWorkspace);
      setError('Vui lòng chọn kho hàng trước');
      return;
    }

    console.log('🔄 Fetching dashboard data for workspaceId:', workspaceId);
    setLoading(true);
    setError(null);

    try {
      // Gọi API lấy tất cả dữ liệu Dashboard 1 lần
      // (Thay vì 3 requests riêng lẻ: /summary, /alerts, /charts)
      const response = await dashboardApi.getDashboard(workspaceId);

      console.log('✅ Dashboard API Response:', response);

      if (response.data?.status === 'SUCCESS') {
        console.log('✅ Successfully loaded dashboard data:', response.data.data);
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        console.error('❌ API returned non-SUCCESS status:', response.data);
        setError('Không thể tải dữ liệu dashboard. Status: ' + response.data?.status);
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err);
      console.error('📍 Error response:', err.response);
      setError(
        err.response?.data?.error || 'Lỗi khi tải dữ liệu dashboard. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== LIFECYCLE HOOKS ====================

  // Fetch dữ liệu khi component mount hoặc workspaceId thay đổi
  useEffect(() => {
    if (workspaceId) {
      fetchDashboardData();
    }
  }, [workspaceId]);

  // ==================== EVENT HANDLERS ====================

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // ==================== RENDER ====================

  return (
    <div className={styles.dashboard}>
      {/* Header với nút Refresh */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Tổng Quan</h1>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
          className={styles.refreshBtn}
        >
          Làm Mới
        </Button>
      </div>

      {/* Alert nếu có lỗi */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Loading spinner */}
      {loading && !dashboardData && (
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      )}

      {/* Main content (nếu không loading hoặc đã có dữ liệu) */}
      {!loading || dashboardData ? (
        <div className={styles.content}>
          {/* ROW 1: STAT CARDS */}
          <StatCards summary={dashboardData?.summary} loading={loading} />

          {/* ROW 2: ACTIVITY CHARTS */}
          <ActivityCharts charts={dashboardData?.charts} loading={loading} />

          {/* ROW 3: ALERT WIDGETS */}
          <AlertWidgets
            alerts={dashboardData?.alerts}
            industryType={industryType}
            loading={loading}
          />
        </div>
      ) : null}

      {/* Nếu không có dữ liệu và không loading */}
      {!loading && !dashboardData && !error && (
        <div className={styles.emptyState}>
          <p>Không thể tải dữ liệu. Vui lòng chọn kho hàng hoặc làm mới trang.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
