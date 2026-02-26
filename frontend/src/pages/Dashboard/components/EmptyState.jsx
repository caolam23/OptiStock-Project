import React from 'react';
import { Button } from 'antd';
// ✅ Import thêm InboxOutlined và BulbOutlined từ Ant Design
import { PlusOutlined, InboxOutlined, BulbOutlined } from '@ant-design/icons';
import styles from './EmptyState.module.css';

const EmptyState = ({ onCreateWorkspace }) => {
  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.emptyIcon}>
        {/* ✅ Thay emoji hộp bằng icon Inbox chuyên nghiệp */}
        <InboxOutlined style={{ color: 'var(--primary)' }} />
      </div>

      <h2 className={styles.emptyTitle}>Bạn chưa có kho nào</h2>

      <p className={styles.emptyDescription}>
        Bắt đầu thiết lập không gian làm việc của bạn ngay bây giờ.
        <br />
        Chỉ cần vài bước đơn giản để tạo kho và quản lý sản phẩm.
      </p>

      <Button
        type="primary"
        size="large"
        onClick={onCreateWorkspace}
        className={styles.createButton}
        icon={<PlusOutlined />}
        style={{
          background: 'var(--gradient-brand)',
          borderColor: 'transparent',
          height: '48px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '8px',
          minWidth: '220px',
          boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
        }}
      >
        Tạo Kho Ngay
      </Button>

      <div className={styles.additionalInfo}>
        {/* ✅ Căn chỉnh flex để icon bóng đèn và chữ thẳng hàng */}
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <BulbOutlined style={{ color: 'var(--secondary)', fontSize: '16px' }} />
          <span><strong>Mẹo:</strong> Một kho có thể chứa nhiều địa điểm, hàng trăm sản phẩm và được quản lý bởi nhiều nhân viên.</span>
        </p>
      </div>
    </div>
  );
};

export default EmptyState;