import React, { useMemo } from 'react';
import {
  CrownOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  LaptopOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import styles from './WorkspaceCard.module.css';

const WorkspaceCard = ({ workspace, onSelectWorkspace }) => {
  // Get industry display name
  const industryMap = {
    fmcg: 'Tạp hóa / Siêu thị',
    fashion: 'Thời trang / Giày dép',
    electronics: 'Công nghệ / Điện tử',
    pharmacy: 'Dược / Thực phẩm chức năng',
    fnb: 'Nhà hàng / Quán ăn',
  };

  // Get role badge styling
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'OWNER':
        return styles.roleManager;
      case 'MANAGER':
        return styles.roleManager;
      case 'STAFF':
        return styles.roleStaff;
      default:
        return styles.roleSale;
    }
  };

  // Get role display text (Thay emoji bằng Icon Ant Design)
  const getRoleText = (role) => {
    switch (role) {
      case 'OWNER':
        return <><CrownOutlined /> Chủ sở hữu (Owner)</>;
      case 'MANAGER':
        return <><SafetyCertificateOutlined /> Quản trị viên (Manager)</>;
      case 'STAFF':
        return <><UserOutlined /> Nhân viên Kho (Staff)</>;
      default:
        return <><ShopOutlined /> Nhân viên Sale</>;
    }
  };

  // Format last accessed time
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Chưa truy cập';

    const now = new Date();
    const then = new Date(timestamp); // Backend xuất "2026-02-27T15:01:00+07:00" — parse đúng
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return 'Cách đây lâu';
  };

  // Thay thế các SVG thủ công bằng Icon Ant Design
  const getIndustryIcon = () => {
    switch (workspace.industryCode) {
      case 'fmcg':
        return <ShoppingCartOutlined style={{ fontSize: '28px' }} />;
      case 'fashion':
        return <SkinOutlined style={{ fontSize: '28px' }} />;
      case 'electronics':
        return <LaptopOutlined style={{ fontSize: '28px' }} />;
      case 'pharmacy':
        return <MedicineBoxOutlined style={{ fontSize: '28px' }} />;
      default:
        return <AppstoreOutlined style={{ fontSize: '28px' }} />;
    }
  };

  return (
    <div
      className={styles.workspaceCard}
      onClick={() => onSelectWorkspace(workspace.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelectWorkspace(workspace.id);
        }
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          {getIndustryIcon()}
        </div>
        <div className={styles.cardTitleArea}>
          <div className={styles.cardTitle}>
            {workspace.name}
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.cardIndustry}>
            Ngành: {industryMap[workspace.industryCode] || 'Khác'}
          </div>
        </div>
      </div>

      <div className={`${styles.roleBadge} ${getRoleBadgeClass(workspace.role)}`}>
        <span>{getRoleText(workspace.role)}</span>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <ClockCircleOutlined style={{ fontSize: '15px' }} />
          {getTimeAgo(workspace.lastAccessed)}
        </div>
        <div className={styles.enterLink}>
          Truy cập
          <ArrowRightOutlined style={{ fontSize: '15px' }} />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;