import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert as AntAlert, Spin, Divider } from 'antd';
import { 
  MailOutlined, 
  LockOutlined, 
  SafetyOutlined,
  UnlockFilled, // Icon ổ khóa mở/đóng (thay cho icon shield)
  ArrowLeftOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
// Import CSS Module mới
import styles from './ForgotPassword.module.css';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0: Email, 1: OTP & New Password
  const [email, setEmail] = useState(''); // Lưu email để dùng cho bước 2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- LOGIC GIỮ NGUYÊN ---
  const onFinishStep1 = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.forgotPassword(values.email);
      setEmail(values.email);
      setSuccessMessage(response.message || `OTP đã được gửi tới email ${values.email}. Vui lòng kiểm tra!`);
      
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
        'Không thể gửi OTP. Vui lòng kiểm tra lại email!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishStep2 = async (values) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (values.newPassword !== values.confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp!');
        setLoading(false);
        return;
      }

      await authApi.resetPassword({
        email: email,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      setSuccessMessage('Mật khẩu đã được thay đổi thành công! Đang chuyển hướng...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        'Reset mật khẩu thất bại. Mã OTP có thể đã hết hạn!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  // --- HẾT PHẦN LOGIC ---

  return (
    <div className={styles.container}>
      {/* --- CỘT TRÁI: BRANDING --- */}
      <div className={styles.brandSection}>
        <div className={`${styles.circleBg} ${styles.c1}`}></div>
        <div className={`${styles.circleBg} ${styles.c2}`}></div>
        
        <div className={styles.brandContent}>
          <div className={styles.imagePlaceholder}>
            {/* Icon ổ khóa vàng cam */}
            <UnlockFilled style={{ fontSize: '90px', color: '#F59E0B' }} />
          </div>
          <h2>Bảo mật tuyệt đối</h2>
          <p>Hệ thống bảo vệ dữ liệu kho hàng của bạn với các tiêu chuẩn an ninh cao nhất.</p>
        </div>
      </div>

      {/* --- CỘT PHẢI: FORM --- */}
      <div className={styles.loginSection}>
        <div className={styles.loginWrapper}>

          {/* Custom Stepper */}
          <div className={styles.stepper}>
            <div className={`${styles.stepItem} ${step >= 0 ? styles.stepItemActive : ''}`}>
              <div className={styles.stepCircle}>1</div>
              <span className={styles.stepLabel}>Email</span>
            </div>
            
            <div className={styles.progressLine}></div>
            
            <div className={`${styles.stepItem} ${step >= 1 ? styles.stepItemActive : ''}`}>
              <div className={styles.stepCircle}>2</div>
              <span className={styles.stepLabel}>Xác nhận</span>
            </div>
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

          <Spin spinning={loading} tip="Đang xử lý...">
            
            {/* STEP 1: NHẬP EMAIL */}
            {step === 0 && (
              <div className={styles.fadeIn}>
                <div className={styles.headerText}>
                  <h1>🔑 Reset Mật Khẩu</h1>
                  <p>Nhập email liên kết với tài khoản của bạn để nhận mã OTP.</p>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinishStep1}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  requiredMark={false}
                >
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

                  <Form.Item style={{ marginBottom: '10px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      disabled={loading}
                      className={styles.btnPrimary}
                    >
                      Gửi mã OTP
                    </Button>
                  </Form.Item>

                  <Link to="/login" className={styles.backLink}>
                    <ArrowLeftOutlined /> Quay lại trang đăng nhập
                  </Link>
                </Form>
              </div>
            )}

            {/* STEP 2: NHẬP OTP & ĐỔI PASS */}
            {step === 1 && (
              <div className={styles.fadeIn}>
                <div className={styles.headerText}>
                  <h1>Khôi phục tài khoản</h1>
                  <p>Nhập mã OTP được gửi tới email <span className={styles.highlightEmail}>{email}</span></p>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinishStep2}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  requiredMark={false}
                >
                  {/* OTP */}
                  <Form.Item
                    label={<span className={styles.formLabel}>Mã OTP (6 chữ số)</span>}
                    name="otp"
                    rules={[
                      { required: true, message: 'Vui lòng nhập OTP!' },
                      { pattern: /^[0-9]{6}$/, message: 'OTP phải là 6 chữ số!' },
                    ]}
                  >
                    <Input
                      placeholder="------"
                      maxLength={6}
                      className={`${styles.inputField} ${styles.otpInput}`}
                      disabled={loading}
                    />
                  </Form.Item>

                  <Divider />

                  {/* New Password */}
                  <Form.Item
                    label={<span className={styles.formLabel}>Mật khẩu mới</span>}
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                      { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      className={styles.inputField}
                      disabled={loading}
                      iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#F59E0B"/> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

                  {/* Confirm Password */}
                  <Form.Item
                    label={<span className={styles.formLabel}>Xác nhận mật khẩu</span>}
                    name="confirmPassword"
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      className={styles.inputField}
                      disabled={loading}
                      iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#F59E0B"/> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: '10px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      disabled={loading}
                      className={styles.btnPrimary}
                    >
                      Xác nhận đổi mật khẩu
                    </Button>
                  </Form.Item>

                  <div 
                    className={styles.backLink} 
                    onClick={() => {
                      setStep(0);
                      form.resetFields();
                      setError(null);
                    }}
                  >
                    <ArrowLeftOutlined /> Nhập lại Email
                  </div>
                </Form>
              </div>
            )}

          </Spin>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;