import React from 'react';
import { ContainerOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Locations = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Kho & Vị trí</h1>
                    <p className={styles.pageSubtitle}>Thiết lập sơ đồ kho hàng: Dãy, Kệ, Tầng, Hộc</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><ContainerOutlined /></div>
                <h3 className={styles.placeholderTitle}>Sơ đồ kho hàng</h3>
                <p className={styles.placeholderText}>Trang thiết lập topology kho với giao diện trực quan kéo thả vị trí sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><ContainerOutlined /> Đang phát triển — MANAGER role</span>
            </div>
        </div>
    );
};

export default Locations;
