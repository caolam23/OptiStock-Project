import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRoute component - Bảo vệ route dựa trên role
 * @param {Array<string>} allowedRoles - Mảng các role được phép truy cập
 * @param {React.Component} element - Component cần hiển thị
 */
const RoleBasedRoute = ({ allowedRoles = [], element }) => {
  const { isAuthenticated, roles, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra nếu user có role được phép
  const hasAllowedRole = allowedRoles.length === 0 || 
    roles.some(role => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center'
      }}>
        <div>
          <h1>403 - Forbidden</h1>
          <p>Bạn không có quyền truy cập trang này.</p>
          <p>Yêu cầu role: {allowedRoles.join(', ')}</p>
          <p>Role của bạn: {roles.join(', ')}</p>
        </div>
      </div>
    );
  }

  return element;
};

export default RoleBasedRoute;
