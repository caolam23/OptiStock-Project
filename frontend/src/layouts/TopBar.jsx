import React from 'react';
import { Avatar, Dropdown } from 'antd';
import {
    LogoutOutlined,
    UserOutlined,
    SwapOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './TopBar.module.css';

/**
 * TopBar: Thanh điều hướng trên cùng trong workspace.
 * Hiển thị: Logo, breadcrumb (tên kho), notification bell, user menu.
 * Nút "Đổi kho" cho phép quay về Dashboard chọn workspace khác.
 */
const TopBar = () => {
    const navigate = useNavigate();
    const { user, currentWorkspace, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSwitchWorkspace = () => {
        navigate('/dashboard');
    };

    const menuItems = [
        {
            key: 'profile',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined />,
        },
        {
            key: 'switch',
            label: 'Đổi kho làm việc',
            icon: <SwapOutlined />,
            onClick: handleSwitchWorkspace,
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <header className={styles.topbar}>
            {/* Left: Brand */}
            <div className={styles.left}>
                <div className={styles.brand} onClick={handleSwitchWorkspace}>
                    <svg
                        width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="url(#topbarGrad)" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        <defs>
                            <linearGradient id="topbarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F97316" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                        </defs>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <span className={styles.brandText}>OptiStock</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className={styles.right}>
                {/* Notification Bell */}
                <button className={styles.iconBtn} title="Thông báo">
                    <BellOutlined />
                    <span className={styles.notifDot} />
                </button>

                {/* User Menu */}
                <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                    <div className={styles.userArea}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.fullName || 'User'}</span>
                            <span className={styles.userEmail}>{user?.email || ''}</span>
                        </div>
                        <Avatar
                            size={36}
                            icon={<UserOutlined />}
                            src={user?.avatar}
                            style={{ backgroundColor: '#F97316' }}
                        />
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default TopBar;
