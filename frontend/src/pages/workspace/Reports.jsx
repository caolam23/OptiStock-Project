import React from 'react';
import { BarChartOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Reports = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Báo cáo</h1>
                    <p className={styles.pageSubtitle}>Thống kê, phân tích và dự báo từ dữ liệu kho hàng</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><BarChartOutlined /></div>
                <h3 className={styles.placeholderTitle}>Báo cáo & Phân tích</h3>
                <p className={styles.placeholderText}>Biểu đồ thống kê, phân tích ABC, Dead Stock và dự báo AI sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><BarChartOutlined /> Đang phát triển</span>
            </div>
        </div>
    );
};

export default Reports;
