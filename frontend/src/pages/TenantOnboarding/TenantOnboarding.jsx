import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './TenantOnboarding.module.css';
import tenantApi from '../../api/tenantApi';

// ============================================
// INDUSTRY DATA (Giữ nguyên gốc)
// ============================================
const INDUSTRY_DATA = {
  electronics: {
    id: 'electronics',
    name: 'Công nghệ',
    icon: '💻',
    desc: 'Quản lý Serial/IMEI, bảo hành',
    zones: [
      { title: 'Hàng mới nhập', tags: [{ name: 'Tủ kính an ninh', type: 'cold' }] },
      { title: 'Bảo hành & Sửa chữa', tags: [{ name: '🔧 Khu Sửa chữa', type: 'warning' }] },
    ],
    product: 'Sạc Anker 10000mAh',
    configs: ['Bắt buộc quét Serial/IMEI', 'Bật tính năng bảo hành', 'Bật quản lý Chi phí'],
  },
  fmcg: {
    id: 'fmcg',
    name: 'Tạp hóa / Siêu thị',
    icon: '🛒',
    desc: 'Quản lý hạn sử dụng, quy đổi nhiều cấp',
    zones: [
      { title: 'Lưu trữ tiêu chuẩn', tags: [{ name: 'Kho chẵn', type: 'default' }, { name: 'Kệ Đồ Khô', type: 'default' }] },
      { title: 'Bảo quản lạnh', tags: [{ name: '❄️ Tủ Mát', type: 'cold' }] },
    ],
    product: 'Nước ngọt Cola',
    configs: ['Bật quy đổi đa cấp độ', 'Bắt buộc nhập Hạn sử dụng', 'Bật tự động tính giá'],
  },
  fashion: {
    id: 'fashion',
    name: 'Thời trang',
    icon: '👗',
    desc: 'Quản lý theo Màu sắc, Size',
    zones: [
      { title: 'Khu vực trưng bày', tags: [{ name: 'Kệ Quần Áo', type: 'default' }, { name: 'Kho Backroom', type: 'default' }] },
      { title: 'Xử lý đặc biệt', tags: [{ name: '⚠️ Khu Đổi Trả', type: 'warning' }] },
    ],
    product: 'Áo Polo Nam',
    configs: ['Bật quản lý Biến thể (Size, Màu)', 'Bật điều chỉnh giá'],
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Nhà thuốc',
    icon: '💊',
    desc: 'Quản lý lô thuốc, hạn sử dụng, quy định',
    zones: [
      { title: 'Khu lưu trữ chính', tags: [{ name: 'Tủ Thuốc', type: 'default' }, { name: 'Kho Dự trữ', type: 'default' }] },
      { title: 'Kiểm duyệt & Chất lượng', tags: [{ name: '🔍 Khu Kiểm Chất Lượng', type: 'cold' }] },
    ],
    product: 'Paracetamol 500mg',
    configs: ['Bắt buộc quét mã lô', 'Bắt buộc nhập Hạn sử dụng', 'Bật quản lý lô phân biệt'],
  },
  fnb: {
    id: 'fnb',
    name: 'Ẩm thực & Đồ uống',
    icon: '🍽️',
    desc: 'Quản lý nhiệt độ, hạn sử dụng và công thức',
    zones: [
      { title: 'Bảo quản lạnh', tags: [{ name: '❄️ Kho Lạnh -18°C', type: 'cold' }] },
      { title: 'Lưu trữ bình thường', tags: [{ name: 'Kho Thường', type: 'default' }, { name: 'Chuẩn bị món ăn', type: 'default' }] },
      { title: 'Trưng bày bán hàng', tags: [{ name: '🎯 Quầy Bán Hàng', type: 'warning' }] },
    ],
    product: 'Ớt Tây Đỏ tươi',
    configs: ['Bật quản lý Công thức', 'Bắt buộc nhập Hạn sử dụng', 'Bật Theo dõi nhiệt độ', 'Bật tự động sắp xếp lại'],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ============================================
// SUB COMPONENTS FOR EACH STEP
// ============================================

// --- Bước 1: Khởi tạo Kho ---
const Step1 = ({ formData, setFormData, onNext }) => {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.tenantName.trim()) {
      setError('Tên kho không được để trống');
      return;
    }
    if (formData.tenantName.trim().length < 3) {
      setError('Tên kho phải có ít nhất 3 ký tự');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className={styles.stepPane}>
      <div className={styles.ssoBadge}>
        <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        Đã xác thực qua SSO Google
      </div>
      <div className={styles.titleArea}>
        <h2>Mừng bạn đến với OptiStock!</h2>
        <p>Hệ thống chưa tìm thấy kho lưu trữ nào được liên kết với tài khoản của bạn. Hãy thiết lập kho đầu tiên (Warehouse) để trở thành Quản trị viên (Admin).</p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tên Kho (Warehouse Name) <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          className={`${styles.formControl} ${error ? styles.formControlError : ''}`}
          placeholder="Nhập tên kho của bạn..."
          value={formData.tenantName}
          onChange={(e) => {
            setFormData({ ...formData, tenantName: e.target.value });
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          maxLength={100}
        />
        {error && <span style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', display: 'block' }}>{error}</span>}
      </div>
    </div>
  );
};

// --- Bước 2: Chọn Ngành hàng (Lưới giao diện) ---
const Step2 = ({ formData, setFormData, onNext }) => {
  const handleSelectIndustry = (industryId) => {
    setFormData({
      ...formData,
      industryCode: industryId,
      masterData: INDUSTRY_DATA[industryId],
    });
    setTimeout(() => onNext(), 300);
  };

  return (
    <div className={styles.stepPane}>
      <div className={styles.titleArea}>
        <h2>Mô hình kinh doanh của bạn?</h2>
        <p>Chọn một mô hình, hệ thống sẽ tự động vẽ sơ đồ kho và kích hoạt tính năng chuẩn xác nhất.</p>
      </div>

      <div className={styles.modelGrid}>
        {Object.values(INDUSTRY_DATA).map((industry) => (
          <div
            key={industry.id}
            className={`${styles.modelCard} ${formData.industryCode === industry.id ? styles.modelCardSelected : ''}`}
            onClick={() => handleSelectIndustry(industry.id)}
          >
            <span className={styles.modelIcon}>{industry.icon}</span>
            <h3 className={styles.modelTitle}>{industry.name}</h3>
            <p className={styles.modelDesc}>{industry.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Bước 3: Dữ liệu nền (Review Box kiểu HTML) ---
const Step3 = ({ masterData }) => {
  if (!masterData) return null;

  return (
    <div className={styles.stepPane}>
      <div className={styles.titleArea}>
        <h2>Thiết lập Dữ liệu nền (Master Data)</h2>
        <p>Dưới đây là khung xương kho hàng dành riêng cho ngành <strong>{masterData.name}</strong>. Bạn có thể thay đổi sau trong cài đặt.</p>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          Sơ đồ khu vực (Mẫu tự động)
        </div>
        <div className={styles.row}>
          {masterData.zones.slice(0, 2).map((zone, idx) => (
            <div key={idx} className={`${styles.col} ${styles.formGroup}`} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel}>Khu vực {idx + 1}</label>
              <input type="text" className={styles.formControl} value={zone.title} readOnly />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          Sản phẩm mẫu & Thuộc tính kích hoạt
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Sản phẩm mẫu tự sinh</label>
          <input type="text" className={styles.formControl} value={masterData.product} readOnly />
        </div>
        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
          <label className={styles.formLabel}>Engine OptiStock sẽ bật:</label>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {masterData.configs.map((config, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{config}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Bước 4: Mời Đội ngũ ---
const Step4 = ({ formData, setFormData }) => {
  const addInviteRow = () => {
    setFormData({
      ...formData,
      invites: [...formData.invites, { email: '', role: 'STAFF' }],
    });
  };

  const updateInvite = (idx, field, value) => {
    const newInvites = [...formData.invites];
    newInvites[idx] = { ...newInvites[idx], [field]: value };
    setFormData({ ...formData, invites: newInvites });
  };

  const deleteInvite = (idx) => {
    if (formData.invites.length === 1) {
      message.warning('Phải giữ ít nhất 1 dòng mời');
      return;
    }
    const newInvites = formData.invites.filter((_, i) => i !== idx);
    setFormData({ ...formData, invites: newInvites });
  };

  return (
    <div className={styles.stepPane}>
      <div className={styles.titleArea}>
        <h2>Mời Đội ngũ tham gia</h2>
        <p>Hệ thống tự động gửi email lời mời. Phân quyền chặt chẽ giúp bảo mật thông tin nội bộ của bạn.</p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Danh sách Email mời (Tenant Invite)</label>

        {formData.invites.map((invite, idx) => (
          <div key={idx} className={styles.inviteRow}>
            <input
              type="email"
              className={`${styles.formControl} ${invite.email && !isValidEmail(invite.email) ? styles.formControlError : ''}`}
              placeholder="nhanvien@domain.com"
              value={invite.email}
              onChange={(e) => updateInvite(idx, 'email', e.target.value)}
              style={{ flex: 2 }}
            />
            <select
              className={styles.formControl}
              value={invite.role}
              onChange={(e) => updateInvite(idx, 'role', e.target.value)}
              style={{ flex: 1, background: 'white' }}
            >
              <option value="STAFF">Nhân viên kho</option>
              <option value="ACCOUNTANT">Kế toán</option>
              <option value="SALE">Nhân viên bán hàng</option>
              <option value="MANAGER">Quản lý kho</option>
            </select>
            <button className={styles.deleteBtn} onClick={() => deleteInvite(idx)} title="Xóa">
              <DeleteOutlined />
            </button>
          </div>
        ))}
      </div>

      <button className={`${styles.btn} ${styles.btnOutlineDashed}`} onClick={addInviteRow}>
        + Thêm thành viên
      </button>
    </div>
  );
};


// ============================================
// MAIN COMPONENT
// ============================================
const TenantOnboarding = () => {
  const navigate = useNavigate();
  const mainContentRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    industryCode: '',
    masterData: null,
    invites: [{ email: '', role: 'STAFF' }],
  });

  const handleNext = () => {
    if (step === 1 && (!formData.tenantName.trim() || formData.tenantName.trim().length < 3)) {
      message.error("Vui lòng nhập tên kho hợp lệ (ít nhất 3 ký tự).");
      return;
    }
    if (step === 2 && !formData.industryCode) {
      message.error("Vui lòng chọn một ngành hàng.");
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    }
  };

  const handleSubmit = async () => {
    const validInvites = formData.invites.filter((invite) => invite.email.trim());
    const hasInvalidEmail = validInvites.some((invite) => !isValidEmail(invite.email));

    if (hasInvalidEmail) {
      message.error('Email không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        tenantName: formData.tenantName,
        industryCode: formData.industryCode,
        locations: [],
        tenantSettings: {},
        invites: validInvites,
      };

      await tenantApi.onboardTenant(payload);
      message.success('🎉 Khởi tạo Tenant thành công!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message));
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <Spin size="large" />
        <p style={{ marginTop: 20, fontWeight: 600, color: 'var(--text-main)' }}>Hệ thống đang khởi tạo Data...</p>
      </div>
    );
  }

  const stepsInfo = [
    { id: 1, title: 'Khởi tạo Kho', desc: 'Định danh phân vùng dữ liệu' },
    { id: 2, title: 'Ngành hàng', desc: 'Mô hình kinh doanh' },
    { id: 3, title: 'Dữ liệu nền', desc: 'Sơ đồ & Hàng hóa cơ bản' },
    { id: 4, title: 'Đội ngũ', desc: 'Phân quyền truy cập' }
  ];

  return (
    <div className={styles.layoutWrapper}>

      {/* Sidebar (Cột Trái) */}
      <div className={styles.sidebar}>
        <div>
          <div className={styles.brandLogo}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            OptiStock
          </div>

          <div className={styles.stepperVertical}>
            {stepsInfo.map(item => (
              <div key={item.id} className={`${styles.stepItem} ${step >= item.id ? styles.stepItemActive : ''}`}>
                <div className={styles.stepCircle}>{step > item.id ? '✓' : item.id}</div>
                <div className={styles.stepText}>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          © 2026 OptiStock Platform
        </div>
      </div>

      {/* Main Content (Cột Phải) */}
      <div className={styles.mainContent} ref={mainContentRef}>
        <div className={styles.formContainer}>
          {step === 1 && <Step1 formData={formData} setFormData={setFormData} onNext={handleNext} />}
          {step === 2 && <Step2 formData={formData} setFormData={setFormData} onNext={handleNext} />}
          {step === 3 && <Step3 masterData={formData.masterData} />}
          {step === 4 && <Step4 formData={formData} setFormData={setFormData} />}
        </div>

        <div className={styles.actionFooter}>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={handlePrev}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            ← Quay lại
          </button>

          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={step === 4 ? handleSubmit : handleNext}
            style={step === 4 ? { background: '#10B981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' } : {}}
          >
            {step === 4 ? (
              <>Khởi tạo Tenant & Vào Dashboard <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
            ) : (
              `Tiếp tục bước ${step + 1} →`
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default TenantOnboarding;