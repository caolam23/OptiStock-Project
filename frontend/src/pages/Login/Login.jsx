import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Spin, Alert as AntAlert } from 'antd';
// Sử dụng các icon
import { 
  DropboxOutlined, 
  CodeSandboxOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone 
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

// 1. IMPORT QUAN TRỌNG CHO GOOGLE
import { useGoogleLogin } from '@react-oauth/google';

// Import AuthContext và API
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi'; // Import file api vừa sửa
import styles from './Login.module.css';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth(); // Hàm login thường từ context

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- LOGIC 1: ĐĂNG NHẬP THƯỜNG (Giữ nguyên) ---
  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Gọi hàm login từ AuthContext (hoặc authApi.login trực tiếp nếu chưa có context)
      await login(values.email, values.password);
      
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        'Đăng nhập thất bại. Vui lòng thử lại!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // --- LOGIC 2: ĐĂNG NHẬP GOOGLE (MỚI THÊM) ---
  
  // Hàm xử lý khi Google trả về Access Token thành công
  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Google Access Token:", tokenResponse.access_token);
      
      // Gọi API backend của mình để xác thực token
      const res = await authApi.loginGoogle(tokenResponse.access_token);
      
      // Lưu ý: Tùy vào axiosClient cấu hình trả về data hay full response
      // Ở đây giả sử res chứa data trả về từ server
      const data = res.data || res; 

      if (data && data.token) {
          // Lưu token vào localStorage
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('user', JSON.stringify({
              email: data.email,
              fullName: data.fullName,
              roles: data.roles
          }));

          setSuccessMessage('Đăng nhập Google thành công!');
          setTimeout(() => {
              navigate('/dashboard');
              // Reload trang nếu cần update Context: window.location.reload();
          }, 1500);
      }
    } catch (err) {
      console.error('Google Backend Error:', err);
      setError(err.response?.data?.message || 'Lỗi xác thực Google với server.');
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo hook
  const loginGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Đăng nhập Google thất bại (Popup closed).'),
  });

  // ---------------------------------------------

  return (
    <div className={styles.container}>
      {/* --- PHẦN BÊN TRÁI: BRANDING --- */}
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

      {/* --- PHẦN BÊN PHẢI: LOGIN FORM --- */}
      <div className={styles.loginSection}>
        <div className={styles.loginWrapper}>
          
          {/* Logo Header */}
          <div className={styles.logoHeader}>
            <div className={styles.logoIcon}>
              <CodeSandboxOutlined />
            </div>
            <div className={styles.logoText}>OptiStock</div>
          </div>

          {/* Welcome Text */}
          <div className={styles.welcomeText}>
            <h1>Xin chào!</h1>
            <p>Đăng nhập để quản lý kho hàng của bạn.</p>
          </div>

          {/* Thông báo lỗi/thành công */}
          {error && (
            <AntAlert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: '20px', borderRadius: '8px' }}
              closable
              onClose={() => setError(null)}
            />
          )}

          {successMessage && (
            <AntAlert
              message={successMessage}
              type="success"
              showIcon
              style={{ marginBottom: '20px', borderRadius: '8px' }}
            />
          )}

          {/* Form Login */}
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              size="large"
              requiredMark={false}
            >
              {/* Email Input */}
              <Form.Item
                label={<span className={styles.formLabel}>Email công việc</span>}
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input
                  placeholder="name@company.com"
                  className={styles.inputField}
                  disabled={loading}
                />
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                label={<span className={styles.formLabel}>Mật khẩu</span>}
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
                ]}
              >
                <Input.Password
                  placeholder="••••••••"
                  className={styles.inputField}
                  disabled={loading}
                  iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#F59E0B"/> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              {/* Options: Remember & Forgot Pass */}
              <div className={styles.formOptions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className={styles.rememberCheckbox}>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className={styles.forgotPassword}>
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.btnPrimary}
                  loading={loading}
                  block
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </Spin>

          {/* SSO Section */}
          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          {/* NÚT GOOGLE ĐÃ GẮN SỰ KIỆN */}
          <button 
            className={styles.btnGoogle} 
            type="button"
            onClick={() => loginGoogle()} 
            disabled={loading}
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google Logo" 
              style={{ width: '20px', height: '20px' }} 
            />
            {loading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}
          </button>

          {/* Footer */}
          <div className={styles.footer}>
            Chưa có tài khoản? 
            <Link to="/register" className={styles.footerLink}>Đăng ký tài khoản</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;