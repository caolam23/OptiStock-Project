import React from 'react';
import { Layout, Button, Dropdown, Avatar, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
          🚀 OptiStock
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div
          style={{
            padding: '40px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <Title level={2}>👋 Chào mừng {user?.fullName}!</Title>

          <Text type="secondary" style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p>✅ Bạn đã đăng nhập thành công vào hệ thống OptiStock</p>
            <p>📧 Email: {user?.email}</p>
            <p>👤 Vai trò: {user?.roles?.join(', ')}</p>
          </Text>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Title level={4}>💡 Hướng dẫn tiếp theo</Title>
            <ul>
              <li>Cập nhật thông tin cá nhân</li>
              <li>Khám phá các tính năng chính</li>
              <li>Thiết lập cấu hình tài khoản</li>
            </ul>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Text type="secondary">
          OptiStock © 2026 - All rights reserved
        </Text>
      </Footer>
    </Layout>
  );
};

export default Dashboard;
