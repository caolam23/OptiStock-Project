import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Settings = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Cài đặt</h1>
                    <p className={styles.pageSubtitle}>Cấu hình workspace, subscription và tùy chỉnh nâng cao</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><SettingOutlined /></div>
                <h3 className={styles.placeholderTitle}>Cài đặt Workspace</h3>
                <p className={styles.placeholderText}>Cài đặt tên kho, industry settings, subscription và vùng nguy hiểm (xóa kho) sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><SettingOutlined /> Đang phát triển — OWNER role</span>
            </div>
        </div>
    );
};

export default Settings;
