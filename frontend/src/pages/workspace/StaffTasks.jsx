import React from 'react';
import { InboxOutlined, ScanOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const StaffTasks = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Phiếu công việc</h1>
                    <p className={styles.pageSubtitle}>Danh sách phiếu chờ xử lý — Nhập, Xuất, Kiểm kê</p>
                </div>
            </div>

            <div className={styles.statGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.blue}`}><InboxOutlined /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Phiếu chờ Nhập</span>
                        <span className={styles.statValue}>—</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.orange}`}><InboxOutlined style={{ transform: 'scaleY(-1)' }} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Phiếu chờ Xuất</span>
                        <span className={styles.statValue}>—</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}><ScanOutlined /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Phiếu chờ Kiểm kê</span>
                        <span className={styles.statValue}>—</span>
                    </div>
                </div>
            </div>

            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><ScanOutlined /></div>
                <h3 className={styles.placeholderTitle}>Giao diện quét mã</h3>
                <p className={styles.placeholderText}>Giao diện chia đôi (list hàng + camera quét barcode) tối ưu cho mobile sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><ScanOutlined /> Đang phát triển — STAFF role</span>
            </div>
        </div>
    );
};

export default StaffTasks;
