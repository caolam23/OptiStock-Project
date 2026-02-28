import React, { useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './WorkspaceLayout.module.css';

/**
 * WorkspaceLayout: Shell layout cho tất cả trang trong workspace.
 *
 * Bố cục:
 * ┌──────────────────────────────────────────────┐
 * │  TopBar (logo, user, switch workspace)       │
 * ├──────────┬───────────────────────────────────┤
 * │          │                                   │
 * │ Sidebar  │   <Outlet /> (nội dung trang)     │
 * │          │                                   │
 * └──────────┴───────────────────────────────────┘
 *
 * Tự động:
 * - Đọc workspaceId từ URL params
 * - Sync workspace context nếu URL khác currentWorkspace
 * - Redirect về /dashboard nếu chưa chọn workspace
 *
 * TEAMMATES: Không cần import component này. AppRouter đã wrap sẵn.
 * Chỉ cần tạo page component và thêm route trong AppRouter.
 */
const WorkspaceLayout = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentWorkspace, loading } = useAuth();

    // Redirect nếu chưa login hoặc chưa chọn workspace
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }
        if (!loading && isAuthenticated && !currentWorkspace) {
            navigate('/dashboard', { replace: true });
        }
    }, [loading, isAuthenticated, currentWorkspace, navigate]);

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.spinner} />
                <span>Đang tải workspace...</span>
            </div>
        );
    }

    if (!isAuthenticated || !currentWorkspace) {
        return null; // useEffect sẽ redirect
    }

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.mainArea}>
                <TopBar />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default WorkspaceLayout;
