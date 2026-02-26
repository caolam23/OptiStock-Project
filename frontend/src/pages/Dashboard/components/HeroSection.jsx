import React from 'react';
import { Button } from 'antd';
// ✅ Import thêm SearchOutlined từ Ant Design
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './HeroSection.module.css';

const HeroSection = ({ searchQuery, onSearchChange, onCreateWorkspace, userName }) => {
  // Truncate long names: show first name or just first letter if too long
  const getDisplayName = () => {
    if (!userName) return '';
    
    // Get first name (split by space and take first word)
    const firstName = userName.split(' ')[0];
    
    // If first name is longer than 15 chars, show just the first letter
    if (firstName.length > 15) {
      return firstName.charAt(0) + '.';
    }
    
    return firstName;
  };

  const displayName = getDisplayName();

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroTitle}>
        <h1>
          Chào mừng trở lại{displayName && <>, <span className={styles.highlightName}>{displayName}</span></>} <span className={styles.waveIcon}>👋</span>
        </h1>
        <p>Hãy chọn không gian làm việc để bắt đầu vận hành kho của bạn.</p>
      </div>
      <div className={styles.heroActions}>
        <div className={styles.searchBox}>
          {/* ✅ Sử dụng SearchOutlined thay cho SVG thủ công */}
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm tên kho..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button
          type="primary"
          size="large"
          onClick={onCreateWorkspace}
          className={styles.btnPrimary}
          icon={<PlusOutlined />}
          style={{
            background: 'var(--gradient-brand)',
            borderColor: 'transparent',
          }}
        >
          Khởi tạo kho
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;