import React, { useState, useEffect } from 'react';
import { AppstoreOutlined, ShoppingCartOutlined, DollarOutlined, PlusOutlined, SyncOutlined, CheckCircleOutlined, WarningOutlined, BarChartOutlined } from '@ant-design/icons';
import { Table, Tag, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import saleApi from '../../api/saleApi';
import styles from './WorkspacePage.module.css';

// --- 1. HELPERS ---
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const getRoleFromStorage = () => {
  let foundRole = localStorage.getItem('workspaceRole') || localStorage.getItem('role') || '';
  try {
    const workspaceObj = JSON.parse(localStorage.getItem('currentWorkspace') || '{}');
    if (workspaceObj.role) foundRole = workspaceObj.role;
    else if (workspaceObj.workspaceRole) foundRole = workspaceObj.workspaceRole;
    if (!foundRole) {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(decodeURIComponent(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))));
        foundRole = payload.role || payload.workspaceRole || foundRole;
      }
    }
  } catch (error) {}
  return String(foundRole || '').toUpperCase();
};

const getUserIdFromStorage = () => {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userInfo') || '{}');
    if (userObj.userId) return userObj.userId;
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(decodeURIComponent(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))));
      if (payload.userId) return payload.userId;
    }
  } catch (error) {}
  return null;
};

// --- 2. CUSTOM HOOK: Xử lý toàn bộ logic gọi API và tính toán dữ liệu ---
const useDashboardData = (role, myUserId) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          saleApi.getSalesOrders(),
          saleApi.getAllProductsAvailability()
        ]);

        let orders = ordersRes.data || ordersRes;
        const products = productsRes.data || productsRes;

        console.log("🔍 Role:", role, "| My UserId:", myUserId);
        console.log("📦 Dữ liệu đơn hàng trước khi lọc:", orders);

        // 🎯 LỌC DỮ LIỆU: Nếu là nhân viên SALE, chỉ lấy các đơn hàng do chính họ tạo
        if (role === 'SALE' && myUserId) {
          // Bắt trường hợp `createdBy` hoặc `userId` (tuỳ thuộc vào Backend trả về gì)
          const filtered = orders.filter(o => o.createdBy === myUserId || o.userId === myUserId);
          console.log(`🎯 Đã lọc đơn hàng cho SALE. Từ ${orders.length} -> còn ${filtered.length} đơn.`);
          orders = filtered;
        }

        // Khởi tạo mảng dữ liệu cho 7 ngày gần nhất (dùng cho biểu đồ)
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });
        
        const chartData = last7Days.map(d => ({
          dateStr: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          rawDate: d,
          revenue: 0,
          ordersCount: 0
        }));

        // 1. Xử lý logic Đơn hàng trong ngày & trong tháng
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const isToday = (dateString) => {
          if (!dateString) return false;
          const d = new Date(dateString);
          return d.getDate() === today.getDate() &&
                 d.getMonth() === today.getMonth() &&
                 d.getFullYear() === today.getFullYear();
        };

        const isThisMonth = (dateString) => {
          if (!dateString) return false;
          const d = new Date(dateString);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };

        const todayOrders = orders.filter(o => isToday(o.createdAt));
        const thisMonthOrders = orders.filter(o => isThisMonth(o.createdAt));
        
        let pending = 0;
        let completed = 0;
        let todayRevenue = 0;
        let monthRevenue = 0;

        todayOrders.forEach(o => {
          if (o.status === 'PENDING_APPROVAL') pending++;
          if (o.status === 'COMPLETED') completed++;
          // Tính doanh thu: Chỉ tính các đơn đã duyệt/hoàn thành
          if (o.status === 'PROCESSING' || o.status === 'COMPLETED') {
            todayRevenue += (o.totalAmount || 0);
          }
        });

        orders.forEach(o => {
          if (o.status === 'PROCESSING' || o.status === 'COMPLETED') {
            const od = new Date(o.createdAt);
            const found = chartData.find(cd => cd.rawDate.getDate() === od.getDate() && cd.rawDate.getMonth() === od.getMonth() && cd.rawDate.getFullYear() === od.getFullYear());
            if (found) {
              found.revenue += (o.totalAmount || 0);
              found.ordersCount += 1;
            }
          }
        });

        thisMonthOrders.forEach(o => {
          if (o.status === 'PROCESSING' || o.status === 'COMPLETED') {
            monthRevenue += (o.totalAmount || 0);
          }
        });

        const lowStock = products
          .filter(p => p.availableToPromise <= 10)
          .sort((a, b) => a.availableToPromise - b.availableToPromise);

        setDashboardData({
          todayTotal: todayOrders.length,
          todayPending: pending,
          todayCompleted: completed,
          todayRevenue: todayRevenue,
          thisMonthTotal: thisMonthOrders.length,
          thisMonthRevenue: monthRevenue,
          chartData: chartData,
          lowStockProducts: lowStock
        });

      } catch (error) {
        message.error('Lỗi khi tải dữ liệu tổng quan!');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  
  return { loading, dashboardData };
};

// --- 3. SUB-COMPONENTS GIAO DIỆN ---

// 3.1. Các thẻ Thống Kê
const DashboardStats = ({ data, role }) => (
  <div className={styles.statGrid}>
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.blue}`}><ShoppingCartOutlined /></div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>Đơn trong ngày</span>
        <span className={styles.statValue}>{data.todayTotal}</span>
      </div>
    </div>
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.orange}`}><SyncOutlined spin /></div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>Đang chờ duyệt</span>
        <span className={styles.statValue}>{data.todayPending}</span>
      </div>
    </div>
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.green}`}><CheckCircleOutlined /></div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>Đã hoàn thành</span>
        <span className={styles.statValue}>{data.todayCompleted}</span>
      </div>
    </div>
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.purple}`}><AppstoreOutlined /></div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>Đơn tháng này</span>
        <span className={styles.statValue}>{data.thisMonthTotal}</span>
      </div>
    </div>
    <div className={`${styles.statCard} ${styles.statCardWide}`}>
      <div className={`${styles.statIcon} ${styles.blue}`}><BarChartOutlined /></div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>Doanh thu tháng này</span>
        <span className={styles.statValue} style={{ color: '#059669' }}>{formatCurrency(data.thisMonthRevenue)}</span>
      </div>
    </div>
    {/* Cho phép SALE xem thẻ "Doanh thu hôm nay" của cá nhân */}
    {(role === 'OWNER' || role === 'MANAGER' || role === 'SALE') && (
      <div className={`${styles.statCard} ${styles.statCardWide}`}>
        <div className={`${styles.statIcon} ${styles.purple}`}><DollarOutlined /></div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Doanh thu hôm nay</span>
          <span className={styles.statValue} style={{ color: '#059669' }}>{formatCurrency(data.todayRevenue)}</span>
        </div>
      </div>
    )}
  </div>
);

// 3.2. Biểu đồ Doanh Thu
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#0F172A' }}>Ngày: {label}</p>
      <p style={{ margin: 0, color: '#F97316', fontWeight: 600 }}>Doanh thu: {formatCurrency(payload[0].value)}</p>
      <p style={{ margin: '4px 0 0 0', color: '#3B82F6', fontSize: '13px' }}>Số đơn hàng: {payload[0].payload.ordersCount} đơn</p>
    </div>
  );
};

const RevenueChart = ({ data }) => (
  <div style={{ flex: '2 1 500px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
      <AppstoreOutlined style={{ fontSize: '20px', color: '#8B5CF6' }} />
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
    </div>
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} dy={10} />
          <YAxis tickFormatter={(val) => `${val / 1000000}M`} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
          <Bar dataKey="revenue" fill="#F97316" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// 3.3. Bảng Cảnh Báo Tồn Kho
const LowStockTable = ({ products }) => {
  const columns = [
    { title: 'Mã Sản Phẩm', dataIndex: 'productCode', key: 'productCode', render: text => <strong>{text || 'N/A'}</strong> },
    { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName' },
    { 
      title: 'Tồn Kho Khả Dụng', dataIndex: 'availableToPromise', key: 'availableToPromise', align: 'center',
      render: (atp) => (
        <Tag color={atp <= 0 ? 'red' : 'gold'} style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold' }}>
          {atp <= 0 ? `🔴 Hết hàng (${atp})` : `🟡 Còn ${atp}`}
        </Tag>
      )
    }
  ];
  return (
    <div style={{ flex: '1 1 350px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <WarningOutlined style={{ fontSize: '20px', color: '#DC2626' }} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Cảnh Báo Tồn Kho</h3>
      </div>
      <p style={{ margin: '0 0 16px 0', color: '#64748B', fontSize: '14px' }}>Danh sách các sản phẩm sắp hết (Còn lại ≤ 10) hoặc đã hết hàng.</p>
      <Table columns={columns} dataSource={products} rowKey="productId" pagination={{ pageSize: 5 }} size="middle" locale={{ emptyText: 'Kho hàng an toàn. Không có sản phẩm nào sắp hết!' }} />
    </div>
  );
};

// --- 4. COMPONENT CHÍNH ---
const SaleDashboard = () => {
  const { currentWorkspace } = useAuth(); 
  const role = getRoleFromStorage();
  const myUserId = getUserIdFromStorage();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { loading, dashboardData } = useDashboardData(role, myUserId); // Truyền role và userId vào Hook

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" tip="Đang tải dữ liệu tổng quan..." /></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Xin chào, {currentWorkspace?.name || 'Workspace'} 👋</h1>
          <p className={styles.pageSubtitle}>Tổng quan hoạt động bán hàng hôm nay</p>
        </div>
        <div>
          <button 
            onClick={() => navigate(`/workspace/${workspaceId}/sales/create`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', 
              background: 'linear-gradient(135deg, #F97316, #F59E0B)', color: 'white', 
              border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.30)'
            }}
          >
            <PlusOutlined /> Tạo Đơn Hàng Mới
          </button>
        </div>
      </div>

      <DashboardStats data={dashboardData} role={role} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        <RevenueChart data={dashboardData.chartData} />
        <LowStockTable products={dashboardData.lowStockProducts} />
      </div>
    </div>
  );
};

export default SaleDashboard;