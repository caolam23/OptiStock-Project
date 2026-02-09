import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Steps, Divider } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'; // ✅ Đã sửa SafeOutlined thành SafetyOutlined
import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext'; // Bỏ comment nếu bạn đã setup AuthContext
import './ForgotPassword.css';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // Nếu bạn chưa có AuthContext, hãy dùng mock function tạm thời ở đây để không bị lỗi
  // const { sendOtp, resetPassword } = useAuth(); 
  
  // --- MOCK API (Xóa dòng này khi có AuthContext thực) ---
  const sendOtp = async (email) => { return new Promise(resolve => setTimeout(resolve, 1000)); };
  const resetPassword = async (email, otp, pass, confirm) => { return new Promise(resolve => setTimeout(resolve, 1000)); };
  // -------------------------------------------------------

  const [step, setStep] = useState(0); // 0: Email, 1: OTP & New Password
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Step 1: Gửi OTP
  const onFinishStep1 = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendOtp(values.email);
      setEmail(values.email);
      setSuccessMessage(`OTP đã được gửi tới email ${values.email}. Vui lòng kiểm tra!`);
      
      // Chuyển sang step 2
      setTimeout(() => {
        setStep(1);
        setSuccessMessage(null);
        form.resetFields();
      }, 2000);
    } catch (err) {
      console.error('Send OTP error:', err);
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        'Không thể gửi OTP. Vui lòng thử lại!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset mật khẩu
  const onFinishStep2 = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Kiểm tra mật khẩu trùng khớp
      if (values.newPassword !== values.confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp!');
        setLoading(false);
        return;
      }

      await resetPassword(
        email,
        values.otp,
        values.newPassword,
        values.confirmPassword
      );

      setSuccessMessage('Mật khẩu đã được thay đổi thành công! Đang chuyển hướng...');

      // Chuyển sang Login sau 1.5 giây
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        'Reset mật khẩu thất bại. Vui lòng thử lại!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <Card 
          className="forgot-password-card"
          style={{ 
            width: '100%', 
            maxWidth: '500px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ marginBottom: '10px', color: '#1890ff' }}>
              🔑 Reset Mật Khẩu
            </Title>
            <Text type="secondary">Khôi phục tài khoản của bạn</Text>
          </div>

          {/* Steps Progress */}
          <Steps
            current={step}
            items={[
              { title: 'Email' },
              { title: 'Xác nhận OTP' },
            ]}
            style={{ marginBottom: '30px' }}
          />

          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
              closable
              onClose={() => setError(null)}
            />
          )}

          {successMessage && (
            <Alert
              message="Thành công"
              description={successMessage}
              type="success"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          <Spin spinning={loading} tip="Đang xử lý...">
            {/* Step 1: Email */}
            {step === 0 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinishStep1}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email của bạn"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '10px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    disabled={loading}
                  >
                    Gửi OTP
                  </Button>
                </Form.Item>
              </Form>
            )}

            {/* Step 2: OTP & New Password */}
            {step === 1 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinishStep2}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Text type="secondary">
                    Nhập mã OTP được gửi tới email của bạn
                  </Text>
                </div>

                {/* OTP */}
                <Form.Item
                  label="Mã OTP (6 chữ số)"
                  name="otp"
                  rules={[
                    { required: true, message: 'Vui lòng nhập OTP!' },
                    {
                      pattern: /^[0-9]{6}$/,
                      message: 'OTP phải là 6 chữ số!',
                    },
                  ]}
                >
                  {/* ✅ Sửa icon SafeOutlined -> SafetyOutlined */}
                  <Input
                    prefix={<SafetyOutlined />} 
                    placeholder="Ví dụ: 123456"
                    size="large"
                    disabled={loading}
                    maxLength={6}
                  />
                </Form.Item>

                <Divider />

                {/* New Password */}
                <Form.Item
                  label="Mật khẩu Mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                {/* Confirm Password */}
                <Form.Item
                  label="Xác nhận Mật khẩu"
                  name="confirmPassword"
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu mới"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>

                {/* Submit Button */}
                <Form.Item style={{ marginBottom: '10px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    disabled={loading}
                  >
                    Reset Mật Khẩu
                  </Button>
                </Form.Item>

                {/* Back Button */}
                <Form.Item>
                  <Button
                    block
                    size="large"
                    onClick={() => {
                      setStep(0);
                      form.resetFields();
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Quay Lại
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Spin>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" style={{ color: '#1890ff' }}>
              ← Quay lại trang đăng nhập
            </Link>
          </div>
        </Card>

        {/* Background Decoration */}
        <div className="forgot-password-decoration"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;