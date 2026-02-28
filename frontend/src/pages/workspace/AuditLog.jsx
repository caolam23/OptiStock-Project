import React from 'react';
import { AuditOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const AuditLog = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Nhật ký hệ thống</h1>
                    <p className={styles.pageSubtitle}>Theo dõi lịch sử thao tác của mọi thành viên trong kho</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><AuditOutlined /></div>
                <h3 className={styles.placeholderTitle}>Audit Log</h3>
                <p className={styles.placeholderText}>Bảng lịch sử thao tác chi tiết với bộ lọc theo user, hành động và thời gian sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><AuditOutlined /> Đang phát triển — OWNER role</span>
            </div>
        </div>
    );
};

export default AuditLog;
