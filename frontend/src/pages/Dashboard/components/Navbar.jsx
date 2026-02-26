import React from 'react';
import { Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import styles from './Navbar.module.css';

const Navbar = ({ user, onLogout }) => {
  const menuItems = [
    {
      key: '1',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navBrand}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        OptiStock
      </div>
      <div className={styles.navActions}>
        <div className={styles.bellIcon}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <div className={styles.bellDot}></div>
        </div>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <div className={styles.navProfile}>
            <div className={styles.profileText}>
              <span className={styles.profileName}>{user?.fullName || 'User'}</span>
              <span className={styles.profileRole}>{user?.email}</span>
            </div>
            <Avatar
              size={42}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#F97316' }}
              src={user?.avatar}
            />
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
