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
    return <div style={{ textAlign: 'center', paddingTop: '50px' }}>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // SỬA LỖI TRẮNG MÀN HÌNH: Đảm bảo currentRoles luôn là mảng dù roles có bị null/undefined
  const currentRoles = roles || []; 

  // Kiểm tra nếu user có role được phép
  const hasAllowedRole = allowedRoles.length === 0 || 
    currentRoles.some(role => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    // Chuyển hướng non-admin users về dashboard thay vì hiển thị lỗi
    // Điều này ngăn chặn user truy cập trực tiếp vào /admin
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export default RoleBasedRoute;