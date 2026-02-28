import React from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Orders = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Đơn hàng</h1>
                    <p className={styles.pageSubtitle}>Tạo và theo dõi đơn hàng, check tồn kho khả dụng</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><FileTextOutlined /></div>
                <h3 className={styles.placeholderTitle}>Quản lý đơn hàng</h3>
                <p className={styles.placeholderText}>Sales Order, theo dõi phiếu xuất và gợi ý giá bán AI sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><FileTextOutlined /> Đang phát triển — SALE role</span>
            </div>
        </div>
    );
};

export default Orders;
