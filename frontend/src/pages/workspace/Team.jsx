import React from 'react';
import { TeamOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Team = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Nhân sự</h1>
                    <p className={styles.pageSubtitle}>Quản lý thành viên, phân quyền và mời nhân sự mới</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><TeamOutlined /></div>
                <h3 className={styles.placeholderTitle}>Quản lý đội ngũ</h3>
                <p className={styles.placeholderText}>Danh sách thành viên, mời mới qua email, thay đổi role và thu hồi quyền truy cập sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><TeamOutlined /> Đang phát triển — OWNER role</span>
            </div>
        </div>
    );
};

export default Team;
