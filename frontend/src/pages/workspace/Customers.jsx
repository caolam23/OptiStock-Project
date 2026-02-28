import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Customers = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Khách hàng</h1>
                    <p className={styles.pageSubtitle}>Quản lý danh bạ khách hàng và nhà cung cấp</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><UserOutlined /></div>
                <h3 className={styles.placeholderTitle}>Danh bạ Khách hàng & NCC</h3>
                <p className={styles.placeholderText}>Quản lý thông tin khách hàng, nhà cung cấp, hạn mức công nợ và lịch sử giao dịch sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><UserOutlined /> Đang phát triển — SALE & ACCOUNTANT roles</span>
            </div>
        </div>
    );
};

export default Customers;
