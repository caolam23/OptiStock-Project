import React from 'react';
import { AuditOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Stocktake = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Kiểm kê</h1>
                    <p className={styles.pageSubtitle}>Kiểm kê hàng hóa theo vị trí và phân tích chênh lệch</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><AuditOutlined /></div>
                <h3 className={styles.placeholderTitle}>Kiểm kê thông minh</h3>
                <p className={styles.placeholderText}>Luồng kiểm kê từ tạo phiếu, đếm thực tế, gửi báo cáo đến duyệt chênh lệch sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><AuditOutlined /> Đang phát triển</span>
            </div>
        </div>
    );
};

export default Stocktake;
