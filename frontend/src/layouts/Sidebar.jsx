import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AppstoreOutlined,
    ShoppingOutlined,
    InboxOutlined,
    DollarOutlined,
    FileTextOutlined,
    TeamOutlined,
    SettingOutlined,
    AuditOutlined,
    SwapOutlined,
    BarChartOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ContainerOutlined,
} from '@ant-design/icons';
import styles from './Sidebar.module.css';

/**
 * Menu items phân theo workspace role.
 * Sidebar tự động ẩn/hiện dựa trên role của user trong workspace hiện tại.
 *
 * CÁCH TEAMMATES MỞ RỘNG:
 * Thêm object mới vào array tương ứng với role, sidebar sẽ tự render.
 */
const MENU_CONFIG = [
    {
        key: 'overview',
        label: 'Tổng quan',
        icon: <AppstoreOutlined />,
        path: 'overview',
        roles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'SALE'],
    },
    {
        key: 'products',
        label: 'Sản phẩm',
        icon: <ShoppingOutlined />,
        path: 'products',
        roles: ['OWNER', 'MANAGER'],
    },
    {
        key: 'locations',
        label: 'Kho & Vị trí',
        icon: <ContainerOutlined />,
        path: 'locations',
        roles: ['OWNER', 'MANAGER'],
    },
    {
        key: 'inventory',
        label: 'Nhập / Xuất kho',
        icon: <SwapOutlined />,
        path: 'inventory',
        roles: ['OWNER', 'MANAGER', 'STAFF'],
    },
    {
        key: 'stocktake',
        label: 'Kiểm kê',
        icon: <AuditOutlined />,
        path: 'stocktake',
        roles: ['OWNER', 'MANAGER', 'STAFF'],
    },
    {
        type: 'divider',
        roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'],
    },
    {
        key: 'finance',
        label: 'Tài chính',
        icon: <DollarOutlined />,
        path: 'finance',
        roles: ['OWNER', 'ACCOUNTANT'],
    },
    {
        key: 'reports',
        label: 'Báo cáo',
        icon: <BarChartOutlined />,
        path: 'reports',
        roles: ['OWNER', 'ACCOUNTANT', 'MANAGER'],
    },
    {
        key: 'orders',
        label: 'Đơn hàng',
        icon: <FileTextOutlined />,
        path: 'orders',
        roles: ['OWNER', 'SALE'],
    },
    {
        key: 'customers',
        label: 'Khách hàng',
        icon: <UserOutlined />,
        path: 'customers',
        roles: ['OWNER', 'SALE', 'ACCOUNTANT'],
    },
    {
        type: 'divider',
        roles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'SALE', 'STAFF'],
    },
    {
        key: 'staff-tasks',
        label: 'Phiếu công việc',
        icon: <InboxOutlined />,
        path: 'staff-tasks',
        roles: ['STAFF'],
    },
    {
        type: 'divider',
        roles: ['OWNER'],
    },
    {
        key: 'team',
        label: 'Nhân sự',
        icon: <TeamOutlined />,
        path: 'team',
        roles: ['OWNER'],
    },
    {
        key: 'audit-log',
        label: 'Nhật ký',
        icon: <AuditOutlined />,
        path: 'audit-log',
        roles: ['OWNER'],
    },
    {
        key: 'settings',
        label: 'Cài đặt',
        icon: <SettingOutlined />,
        path: 'settings',
        roles: ['OWNER'],
    },
];

const Sidebar = () => {
    const { currentWorkspace, getWorkspaceRole } = useAuth();
    const { workspaceId } = useParams();
    const [collapsed, setCollapsed] = useState(false);
    const role = getWorkspaceRole();

    // Filter menu items theo role hiện tại
    const visibleItems = useMemo(() => {
        if (!role) return [];
        return MENU_CONFIG.filter(item => item.roles.includes(role));
    }, [role]);

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            {/* Workspace Info */}
            <div className={styles.workspaceInfo}>
                <div className={styles.workspaceIcon}>
                    {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
                </div>
                {!collapsed && (
                    <div className={styles.workspaceText}>
                        <span className={styles.workspaceName}>
                            {currentWorkspace?.name || 'Workspace'}
                        </span>
                        <span className={styles.workspaceRole}>{role || '—'}</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {visibleItems.map((item, idx) => {
                    if (item.type === 'divider') {
                        return <div key={`div-${idx}`} className={styles.divider} />;
                    }
                    return (
                        <NavLink
                            key={item.key}
                            to={`/workspace/${workspaceId}/${item.path}`}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                            title={collapsed ? item.label : undefined}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                className={styles.collapseBtn}
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                {!collapsed && <span>Thu gọn</span>}
            </button>
        </aside>
    );
};

export default Sidebar;
