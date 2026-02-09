import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert as AntAlert, Spin, Checkbox, Row, Col } from 'antd';
import { 
  DropboxOutlined,     // Icon thùng hàng (Branding)
  CodeSandboxOutlined, // Icon khối lập phương (Logo)
  MailOutlined         // Icon email suffix
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Import CSS Module
import styles from './Register.module.css';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- GIỮ NGUYÊN LOGIC CŨ ---
  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Kiểm tra mật khẩu trùng khớp
      if (values.password !== values.confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp!');
        setLoading(false);
        return;
      }
      
      // Kiểm tra đã đồng ý điều khoản chưa (nếu cần logic này)
      if (!values.agreement) {
         setError('Vui lòng đồng ý với điều khoản sử dụng!');
         setLoading(false);
         return;
      }

      const response = await register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
      });

      setSuccessMessage('Đăng ký thành công! Đang chuyển hướng...');

      // Chuyển sang Dashboard sau 1.5 giây
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Register error:', err);
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        'Đăng ký thất bại. Vui lòng thử lại!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  // --- HẾT PHẦN LOGIC CŨ ---

  return (
    <div className={styles.container}>
      {/* --- CỘT TRÁI: BRANDING --- */}
      <div className={styles.brandSection}>
        <div className={`${styles.circleBg} ${styles.c1}`}></div>
        <div className={`${styles.circleBg} ${styles.c2}`}></div>
        
        <div className={styles.brandContent}>
          <div className={styles.imagePlaceholder}>
            {/* Sử dụng icon thùng hàng chuyên nghiệp DropboxOutlined */}
            <DropboxOutlined style={{ fontSize: '120px', color: '#F59E0B' }} />
          </div>
          <h2>Quản lý kho vận thông minh</h2>
          <p>Tối ưu hóa quy trình nhập xuất, dự báo nhu cầu bằng AI và kiểm soát hàng tồn kho đa chi nhánh theo thời gian thực.</p>
        </div>
      </div>

      {/* --- CỘT PHẢI: FORM ĐĂNG KÝ --- */}
      <div className={styles.registerSection}>
        <div className={styles.registerWrapper}>
          
          {/* Header */}
          <div className={styles.logoHeader}>
            <div className={styles.logoIcon}>
              {/* Icon logo khối lập phương hiện đại CodeSandboxOutlined */}
              <CodeSandboxOutlined />
            </div>
            <div className={styles.logoText}>OptiStock</div>
          </div>

          <div className={styles.welcomeText}>
            <h1>Tạo tài khoản mới</h1>
            <p>Điền thông tin bên dưới để thiết lập hệ thống kho của bạn.</p>
          </div>

          {/* Alerts */}
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

          {/* Form */}
          <Spin spinning={loading} tip="Đang xử lý...">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              size="large"
              requiredMark={false} // Tắt dấu sao đỏ
            >
              {/* Row 1: Họ tên & SĐT */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className={styles.formLabel}>Họ và tên</span>}
                    name="fullName"
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ và tên!' },
                      { min: 3, message: 'Tên quá ngắn!' },
                    ]}
                  >
                    <Input
                      placeholder="Nguyễn Văn A"
                      className={styles.inputField}
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className={styles.formLabel}>Số điện thoại</span>}
                    name="phoneNumber"
                    rules={[
                      { required: true, message: 'Vui lòng nhập SĐT!' },
                      { pattern: /^[0-9]{10,}$/, message: 'SĐT không hợp lệ!' },
                    ]}
                  >
                    <Input
                      placeholder="0912 345 678"
                      className={styles.inputField}
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Row 2: Email (Full width) */}
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
                  suffix={<MailOutlined style={{color: '#9CA3AF'}} />} 
                />
              </Form.Item>

              {/* Row 3: Mật khẩu & Xác nhận MK */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className={styles.formLabel}>Mật khẩu</span>}
                    name="password"
                    rules={[
                      { required: true, message: 'Nhập mật khẩu!' },
                      { min: 6, message: 'Tối thiểu 6 ký tự!' },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      className={styles.inputField}
                      disabled={loading}
                      visibilityToggle={false} // Tắt mắt để giống design tối giản
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className={styles.formLabel}>Xác nhận mật khẩu</span>}
                    name="confirmPassword"
                    rules={[
                      { required: true, message: 'Xác nhận lại mật khẩu!' },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      className={styles.inputField}
                      disabled={loading}
                      visibilityToggle={false}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Checkbox Terms */}
              <Form.Item 
                name="agreement" 
                valuePropName="checked" 
                rules={[
                  { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý điều khoản!')) },
                ]}
                style={{marginBottom: '20px'}}
              >
                <Checkbox style={{color: '#4B5563'}}>
                  Tôi đồng ý với <span style={{color: '#F59E0B', fontWeight: 500}}>Điều khoản sử dụng</span> và <span style={{color: '#F59E0B', fontWeight: 500}}>Chính sách bảo mật</span> của OptiStock.
                </Checkbox>
              </Form.Item>

              {/* Submit Button */}
              <Form.Item style={{ marginBottom: '10px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  disabled={loading}
                  className={styles.btnPrimary}
                >
                  Đăng ký tài khoản
                </Button>
              </Form.Item>
            </Form>
          </Spin>

          {/* Footer Link */}
          <div className={styles.footer}>
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className={styles.footerLink}>
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;