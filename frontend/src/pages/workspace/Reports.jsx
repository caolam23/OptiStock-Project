import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportInventoryValue from './Reports/ReportInventoryValue';
import ReportAbcAnalysis from './Reports/ReportAbcAnalysis';
import ReportIndustrySpecific from './Reports/ReportIndustrySpecific';
import styles from './WorkspacePage.module.css';
import reportsStyles from './Reports/Reports.module.css';

/**
 * Reports.jsx: Main page for Reports & Analytics
 * 
 * Hiển thị:
 * 1. ReportInventoryValue: Biểu đồ giá trị tồn kho
 * 2. ReportAbcAnalysis: Phân tích ABC
 * 3. ReportIndustrySpecific: Dead Stock / Expiry Report
 * 
 * Layout: Stack vertical (mobile-friendly)
 */

// Map industryCode (from workspace) to industryType (for API)
const mapIndustryCodeToType = (code) => {
    if (!code) return 'ELECTRONICS'; // Default
    
    const upperCode = code.toUpperCase();
    
    // ELECTRONICS industries
    if (['ELECTRONICS', 'TECH', 'FASHION', 'APPLIANCES'].includes(upperCode)) {
        return 'ELECTRONICS';
    }
    
    // GROCERY industries  
    if (['FMCG', 'GROCERY', 'FNB', 'PHARMACY', 'F&B'].includes(upperCode)) {
        return 'GROCERY';
    }
    
    // Default based on code
    return 'ELECTRONICS';
};

const Reports = () => {
    const { workspaceId } = useParams();
    const { currentWorkspace } = useAuth();

    // Get industryType from workspace
    const industryType = mapIndustryCodeToType(currentWorkspace?.industryCode);

    if (!workspaceId) {
        return <div>Không tìm thấy workspace</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Báo cáo</h1>
                    <p className={styles.pageSubtitle}>Thống kê, phân tích và dự báo từ dữ liệu kho hàng</p>
                </div>
            </div>

            {/* Reports Grid */}
            <div className={reportsStyles.reportsGrid}>
                {/* Report 1: Inventory Valuation */}
                <div className={reportsStyles.reportCard}>
                    <ReportInventoryValue 
                        tenantId={workspaceId}
                        industryType={industryType}
                    />
                </div>

                {/* Report 2: ABC Analysis */}
                <div className={reportsStyles.reportCard}>
                    <ReportAbcAnalysis
                        tenantId={workspaceId}
                        industryType={industryType}
                    />
                </div>

                {/* Report 3: Industry-Specific (Dead Stock / Expiry) */}
                <div className={reportsStyles.reportCard}>
                    <ReportIndustrySpecific
                        tenantId={workspaceId}
                        industryType={industryType}
                    />
                </div>
            </div>
        </div>
    );
};

export default Reports;
