import React from 'react';
import { AppstoreOutlined, ShoppingOutlined, InboxOutlined, DollarOutlined, SwapOutlined, RiseOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import styles from './WorkspacePage.module.css';

const Overview = () => {
    const { currentWorkspace, getWorkspaceRole } = useAuth();
    const role = getWorkspaceRole();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Xin chào, {currentWorkspace?.name || 'Workspace'} 👋</h1>
                    <p className={styles.pageSubtitle}>Tổng quan hoạt động kho hàng hôm nay</p>
                </div>
            </div>

            <div className={styles.statGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.orange}`}><ShoppingOutlined /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Sản phẩm</span>
                        <span className={styles.statValue}>—</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.blue}`}><InboxOutlined /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Tồn kho</span>
                        <span className={styles.statValue}>—</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}><SwapOutlined /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Phiếu hôm nay</span>
                        <span className={styles.statValue}>—</span>
                    </div>
                </div>
                {(role === 'OWNER' || role === 'ACCOUNTANT') && (
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.purple}`}><DollarOutlined /></div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Giá trị tồn kho</span>
                            <span className={styles.statValue}>—</span>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><RiseOutlined /></div>
                <h3 className={styles.placeholderTitle}>Biểu đồ hoạt động</h3>
                <p className={styles.placeholderText}>Dữ liệu biểu đồ nhập/xuất, doanh thu và cảnh báo AI sẽ hiển thị tại đây khi có dữ liệu thực.</p>
                <span className={styles.placeholderBadge}><AppstoreOutlined /> Đang phát triển</span>
            </div>
        </div>
    );
};

export default Overview;
