import React from 'react';
import { Tabs, Card, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import ReportInventoryValue from './ReportInventoryValue';
import ReportAbcAnalysis from './ReportAbcAnalysis';
import ReportIndustrySpecific from './ReportIndustrySpecific';
import styles from './Reports.module.css';

/**
 * Reports.jsx: Trang chính module Báo Cáo & Phân Tích
 * 
 * Bố cục:
 * - Header: Tiêu đề + nút Export (nếu có)
 * - Tabs: 3 tab chính
 *   [1] Giá Trị Tồn Kho
 *   [2] Phân Tích ABC
 *   [3] Báo Cáo Rủi Ro (tên thay đổi theo industryType)
 * 
 * Context:
 * - Lấy tenantId và industryType từ currentWorkspace
 * - Truyền xuống các component con để fetch API đúng
 */
const Reports = () => {
  const { currentWorkspace } = useAuth();

  const tenantId = currentWorkspace?.id;
  const industryType = currentWorkspace?.industryCode || getIndustryTypeFromName(currentWorkspace?.name);

  // Auto-detect industryType từ workspace name (fallback)
  function getIndustryTypeFromName(name) {
    if (!name) return 'ELECTRONICS';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('tạp hóa') || nameLower.includes('grocery') || nameLower.includes('hoho')) {
      return 'GROCERY';
    }
    return 'ELECTRONICS';
  }

  // Tên tab thay đổi theo industryType
  const riskReportTabTitle = industryType === 'GROCERY' 
    ? '📦 Báo Cáo Cận Date' 
    : '💀 Báo Cáo Dead Stock';

  const tabItems = [
    {
      key: 'inventory',
      label: '📊 Giá Trị Tồn Kho',
      children: <ReportInventoryValue tenantId={tenantId} industryType={industryType} />,
    },
    {
      key: 'abc',
      label: '📈 Phân Tích ABC',
      children: <ReportAbcAnalysis tenantId={tenantId} industryType={industryType} />,
    },
    {
      key: 'risk',
      label: riskReportTabTitle,
      children: <ReportIndustrySpecific tenantId={tenantId} industryType={industryType} />,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📊 Báo Cáo & Phân Tích</h1>
          <p className={styles.subtitle}>
            {industryType === 'GROCERY' ? '🛒 Tạp Hóa' : '📱 Điện Tử'} - {currentWorkspace?.name}
          </p>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled
            title="Tính năng sẽ hiển thị sau khi chọn báo cáo"
          >
            Xuất Báo Cáo
          </Button>
        </Space>
      </div>

      {/* Tabs */}
      <Card className={styles.tabsCard}>
        <Tabs
          items={tabItems}
          defaultActiveKey="inventory"
          className={styles.tabs}
        />
      </Card>

      {/* Info Footer */}
      <div className={styles.footer}>
        <p>
          💡 <strong>Ghi chú:</strong> Dữ liệu báo cáo được cập nhật từ{' '}
          <span className={styles.highlight}>tồn kho thực tế</span> và{' '}
          <span className={styles.highlight}>lịch sử giao dịch</span> của kho hàng.
          Mỗi ngành hàng có báo cáo rủi ro riêng biệt.
        </p>
      </div>
    </div>
  );
};

export default Reports;
