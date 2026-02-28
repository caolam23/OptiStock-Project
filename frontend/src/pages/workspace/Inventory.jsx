import React from 'react';
import { SwapOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Inventory = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Nhập / Xuất kho</h1>
                    <p className={styles.pageSubtitle}>Quản lý phiếu nhập, xuất, điều chuyển hàng hóa</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><SwapOutlined /></div>
                <h3 className={styles.placeholderTitle}>Luồng nhập / xuất kho</h3>
                <p className={styles.placeholderText}>Trang quản lý phiếu nhập/xuất với luồng duyệt, quét barcode và cập nhật tồn kho realtime sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><SwapOutlined /> Đang phát triển — MANAGER & STAFF roles</span>
            </div>
        </div>
    );
};

export default Inventory;
