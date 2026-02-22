import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRoute — bảo vệ route theo role trong kho hiện tại.
 *
 * @param {string[]} allowedRoles  - Danh sách role được phép. Rỗng = mọi user đã login.
 * @param {React.Element} element  - Component cần render nếu được quyền.
 * @param {string} redirectTo      - Redirect về đâu nếu không đủ quyền (default: /dashboard).
 */
const RoleBasedRoute = ({ allowedRoles = [], element, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, getCurrentRole, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu không yêu cầu role cụ thể → chỉ cần đăng nhập
  if (allowedRoles.length === 0) {
    return element;
  }

  // SUPER_ADMIN được vào mọi route (ngoại trừ route chỉ dành cho tenant cụ thể)
  if (isSuperAdmin() && !allowedRoles.includes('NO_SUPER_ADMIN')) {
    return element;
  }

  const currentRole = getCurrentRole();
  const hasAccess = currentRole && allowedRoles.includes(currentRole);

  if (!hasAccess) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        height: '100vh', textAlign: 'center', gap: '12px'
      }}>
        <h1 style={{ fontSize: '48px', color: '#ef4444', margin: 0 }}>403</h1>
        <h2 style={{ margin: 0 }}>Bạn không có quyền truy cập trang này</h2>
        <p style={{ color: '#6b7280' }}>
          Yêu cầu role: <strong>{allowedRoles.join(', ')}</strong>
          <br />
          Role hiện tại của bạn: <strong>{currentRole || 'Chưa chọn kho'}</strong>
        </p>
        <a href={redirectTo} style={{
          marginTop: '8px', padding: '8px 20px', background: '#3b82f6',
          color: 'white', borderRadius: '8px', textDecoration: 'none'
        }}>
          Quay về
        </a>
      </div>
    );
  }

  return element;
};

export default RoleBasedRoute;
