import React from 'react';
import { AuditOutlined } from '@ant-design/icons';
import sharedStyles from './WorkspacePage.module.css';

/**
 * Stocktake.jsx — Trang quản lý phiếu kiểm kê (MANAGER)
 * TODO: Implement UI + gọi getAllStocktakes() từ managerApi.js
 */
const Stocktake = () => (
    <div className={sharedStyles.pageContainer}>
        <div className={sharedStyles.pageHeader}>
            <div className={sharedStyles.pageHeaderLeft}>
                <h1 className={sharedStyles.pageTitle}><AuditOutlined /> Kiểm kê</h1>
                <p className={sharedStyles.pageSubtitle}>Kiểm kê hàng hóa theo vị trí và phân tích chênh lệch</p>
            </div>
        </div>
        <div className={sharedStyles.placeholderCard}>
            <div className={sharedStyles.placeholderIcon}><AuditOutlined /></div>
            <h3 className={sharedStyles.placeholderTitle}>Kiểm kê thông minh</h3>
            <p className={sharedStyles.placeholderText}>
                Tạo phiếu kiểm kê, Staff đi đếm thực tế và gửi báo cáo, Manager duyệt chênh lệch.
            </p>
            <span className={sharedStyles.placeholderBadge}><AuditOutlined /> Đang phát triển</span>
        </div>
    </div>
);

export default Stocktake;
