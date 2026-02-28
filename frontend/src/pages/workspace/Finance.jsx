import React from 'react';
import { DollarOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Finance = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Tài chính</h1>
                    <p className={styles.pageSubtitle}>Giá vốn, công nợ, hạn mức tín dụng và báo cáo tài chính kho</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><DollarOutlined /></div>
                <h3 className={styles.placeholderTitle}>Tài chính & Công nợ</h3>
                <p className={styles.placeholderText}>Báo cáo giá vốn (COGS), quản lý công nợ, hạn mức tín dụng và phê duyệt chênh lệch sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><DollarOutlined /> Đang phát triển — ACCOUNTANT role</span>
            </div>
        </div>
    );
};

export default Finance;
