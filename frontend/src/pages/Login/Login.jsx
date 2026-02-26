import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Spin, Alert as AntAlert } from 'antd';
import { 
  DropboxOutlined, 
  CodeSandboxOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone 
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import styles from './Login.module.css';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- LOGIC 1: ĐĂNG NHẬP THƯỜNG ---
  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await login(values.email, values.password);
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      
      setTimeout(() => {
        const roles = response?.roles || []; 
        
        // Only SUPER_ADMIN can access admin page
        if (roles.includes('SUPER_ADMIN')) {
          // Ép reload nhẹ để AuthContext kịp cập nhật data từ localStorage
          window.location.href = '/admin';
        } else {
          // Tất cả user khác (TENANT_ADMIN, STAFF, ACCOUNTANT) đều vào dashboard
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // --- LOGIC 2: ĐĂNG NHẬP GOOGLE ---
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.loginGoogle(tokenResponse.access_token);
      const data = res.data || res; 

      if (data && data.token) {
          // Lưu token vào localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
              userId: data.userId,
              email: data.email,
              fullName: data.fullName,
              roles: data.roles,
              tenantId: data.tenantId,
              avatar: data.avatar,
              isActive: data.isActive
          }));

          setSuccessMessage('Đăng nhập Google thành công!');
          
          setTimeout(() => {
              const roles = data.roles || [];
              
              // Only SUPER_ADMIN can access admin page
              if (roles.includes('SUPER_ADMIN')) {
                  // Ép reload nhẹ để AuthContext kịp cập nhật data từ localStorage
                  window.location.href = '/admin';
              } else {
                  // Tất cả user khác (TENANT_ADMIN, STAFF, ACCOUNTANT) đều vào dashboard
                  window.location.href = '/dashboard';
              }
          }, 1500);
      }
    } catch (err) {
      console.error('Google Backend Error:', err);
      setError(err.response?.data?.message || 'Lỗi xác thực Google với server.');
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Đăng nhập Google thất bại (Popup closed).'),
  });

  return (
    <div className={styles.container}>
      <div className={styles.brandSection}>
        <div className={`${styles.circleBg} ${styles.c1}`}></div>
        <div className={`${styles.circleBg} ${styles.c2}`}></div>
        
        <div className={styles.brandContent}>
          <div className={styles.imagePlaceholder}>
            <DropboxOutlined style={{ fontSize: '120px', color: '#F59E0B' }} />
          </div>
          <h2>Quản lý kho vận thông minh</h2>
          <p>Tối ưu hóa quy trình nhập xuất, dự báo nhu cầu bằng AI và kiểm soát hàng tồn kho đa chi nhánh theo thời gian thực.</p>
        </div>
      </div>

      <div className={styles.loginSection}>
        <div className={styles.loginWrapper}>
          
          <div className={styles.logoHeader}>
            <div className={styles.logoIcon}>
              <CodeSandboxOutlined />
            </div>
            <div className={styles.logoText}>OptiStock</div>
          </div>

          <div className={styles.welcomeText}>
            <h1>Xin chào!</h1>
            <p>Đăng nhập để quản lý kho hàng của bạn.</p>
          </div>

          {error && (
            <AntAlert message={error} type="error" showIcon style={{ marginBottom: '20px', borderRadius: '8px' }} closable onClose={() => setError(null)} />
          )}

          {successMessage && (
            <AntAlert message={successMessage} type="success" showIcon style={{ marginBottom: '20px', borderRadius: '8px' }} />
          )}

          <Spin spinning={loading}>
            <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off" size="large" requiredMark={false}>
              <Form.Item label={<span className={styles.formLabel}>Email công việc</span>} name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                <Input placeholder="name@company.com" className={styles.inputField} disabled={loading} />
              </Form.Item>

              <Form.Item label={<span className={styles.formLabel}>Mật khẩu</span>} name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
                <Input.Password placeholder="••••••••" className={styles.inputField} disabled={loading} iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#F59E0B"/> : <EyeInvisibleOutlined />)} />
              </Form.Item>

              <div className={styles.formOptions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className={styles.rememberCheckbox}>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className={styles.forgotPassword}>Quên mật khẩu?</Link>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" className={styles.btnPrimary} loading={loading} block>Đăng nhập</Button>
              </Form.Item>
            </Form>
          </Spin>

          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          <button className={styles.btnGoogle} type="button" onClick={() => loginGoogle()} disabled={loading}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" style={{ width: '20px', height: '20px' }} />
            {loading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}
          </button>

          <div className={styles.footer}>
            Chưa có tài khoản? <Link to="/register" className={styles.footerLink}>Đăng ký tài khoản</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;