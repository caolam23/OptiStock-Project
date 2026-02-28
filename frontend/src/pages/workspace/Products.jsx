import React from 'react';
import { ShoppingOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './WorkspacePage.module.css';

const Products = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Sản phẩm</h1>
                    <p className={styles.pageSubtitle}>Quản lý danh mục sản phẩm, barcode và quy đổi đơn vị</p>
                </div>
            </div>
            <div className={styles.placeholderCard}>
                <div className={styles.placeholderIcon}><ShoppingOutlined /></div>
                <h3 className={styles.placeholderTitle}>Quản lý sản phẩm</h3>
                <p className={styles.placeholderText}>Trang quản lý sản phẩm với danh sách, tìm kiếm, barcode và thuộc tính động sẽ được xây dựng tại đây.</p>
                <span className={styles.placeholderBadge}><PlusOutlined /> Đang phát triển — MANAGER role</span>
            </div>
        </div>
    );
};

export default Products;
