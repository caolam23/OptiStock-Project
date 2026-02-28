import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * WorkspaceRoleRoute: Bảo vệ route dựa trên role TRONG WORKSPACE.
 *
 * Khác với RoleBasedRoute (check system role SUPER_ADMIN),
 * component này check workspace role (OWNER, MANAGER, ACCOUNTANT, SALE, STAFF).
 *
 * Cách dùng trong AppRouter:
 *
 *   <Route path="products" element={
 *     <WorkspaceRoleRoute allowedRoles={['OWNER', 'MANAGER']}>
 *       <ProductPage />
 *     </WorkspaceRoleRoute>
 *   } />
 *
 * Nếu user không đủ quyền → redirect về trang overview của workspace.
 */
const WorkspaceRoleRoute = ({ allowedRoles = [], children }) => {
    const { isAuthenticated, currentWorkspace, getWorkspaceRole, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                color: '#64748B',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '14px'
            }}>
                Đang tải...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!currentWorkspace) {
        return <Navigate to="/dashboard" replace />;
    }

    const role = getWorkspaceRole();

    // Nếu allowedRoles rỗng → tất cả member đều truy cập được
    if (allowedRoles.length === 0) {
        return children;
    }

    // Check role có nằm trong danh sách cho phép không
    if (!allowedRoles.includes(role)) {
        // Redirect về overview thay vì hiện lỗi 403
        return <Navigate to={`/workspace/${currentWorkspace.id}/overview`} replace />;
    }

    return children;
};

export default WorkspaceRoleRoute;
