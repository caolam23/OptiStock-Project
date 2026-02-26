import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WorkspaceCard from './components/WorkspaceCard';
import EmptyState from './components/EmptyState';
import styles from './Dashboard.module.css';
// ✅ Import thêm các icon chuyên nghiệp từ Ant Design
import { LeftOutlined, RightOutlined, FileSearchOutlined, CloseCircleOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, roles, loading: authLoading, token } = useAuth();

  // State management
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // ✅ Đã đổi thành hiển thị 6 kho trên 1 trang

  // ✅ Fetch workspaces from API
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosClient.get('/v1/workspaces/my-workspaces');
        
        setWorkspaces(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        
        if (err.response?.status === 401) {
          // Token hết hạn
          logout();
          navigate('/login');
        } else if (err.response?.status === 403) {
          // Tenant bị lock - hiển thị message rõ ràng
          setError('Kho của bạn bị khóa hoặc đã hết hạn dịch vụ. Vui lòng liên hệ hỗ trợ.');
        } else {
          const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi tải workspaces';
          setError(errorMsg);
        }
        
        setWorkspaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ FIX: Chỉ gọi khi token thay đổi, bỏ logout khỏi dependency
    fetchWorkspaces();
  }, [token]);

  // ✅ Filter workspaces based on search query
  const filteredWorkspaces = workspaces.filter((workspace) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      workspace.name.toLowerCase().includes(searchLower) ||
      workspace.industryCode.toLowerCase().includes(searchLower)
    );
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredWorkspaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWorkspaces = filteredWorkspaces.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // ✅ Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ Handle workspace selection
  const handleSelectWorkspace = (tenantId) => {
    // TODO: Navigate to workspace dashboard or detail page
    // For now, just log and navigate to a placeholder
    console.log('Selected workspace:', tenantId);
    navigate(`/workspace/${tenantId}`);
  };

  // ✅ Handle create workspace
  const handleCreateWorkspace = () => {
    navigate('/onboarding');
  };

  // ✅ Show auth loading
  if (authLoading) {
    return (
      <Spin size="large" tip="Đang tải dữ liệu..." fullscreen />
    );
  }

  // ✅ Safety check: No user data
  if (!user || !user.email) {
    return (
      <Spin size="large" tip="Đang tải thông tin người dùng..." fullscreen />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-body)' }}>
      {/* Top Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className={styles.mainContainer}>
        {/* Hero Section with Search */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCreateWorkspace={handleCreateWorkspace}
          userName={user?.fullName}
        />

        {/* Loading State */}
        {isLoading && (
          <Spin size="large" tip="Đang tải workspaces của bạn..." fullscreen />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{
            padding: '20px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            color: '#991B1B',
            marginBottom: '24px',
          }}>
            <strong>Lỗi:</strong> {error}. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredWorkspaces.length === 0 && !error && (
          <EmptyState onCreateWorkspace={handleCreateWorkspace} />
        )}

        {/* Workspace Grid with Pagination */}
        {!isLoading && paginatedWorkspaces.length > 0 && (
          <>
            <div className={styles.workspaceGrid}>
              {paginatedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onSelectWorkspace={handleSelectWorkspace}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <LeftOutlined style={{ fontSize: '12px' }} /> Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau <RightOutlined style={{ fontSize: '12px' }} />
                </button>

                <span className={styles.paginationInfo}>
                  Trang {currentPage} / {totalPages}
                </span>
              </div>
            )}
          </>
        )}

        {/* No search results */}
        {!isLoading && searchQuery && filteredWorkspaces.length === 0 && workspaces.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
          }}>
            <p style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileSearchOutlined style={{ fontSize: '24px', color: 'var(--primary)' }} />
              Không tìm thấy kho với từ khóa "{searchQuery}"
            </p>
            <button
              onClick={() => handleSearchChange('')}
              style={{
                background: 'var(--gradient-brand)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CloseCircleOutlined /> Xóa tìm kiếm
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;