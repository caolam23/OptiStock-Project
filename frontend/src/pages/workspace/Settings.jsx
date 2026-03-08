import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SettingOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import DeleteWorkspaceModal from './DeleteWorkspaceModal';
import pageStyles from './WorkspacePage.module.css';
import s from './Settings.module.css';

/**
 * Settings.jsx — Trang cài đặt workspace.
 * Hiện tại: Vùng nguy hiểm (xóa kho). OWNER-only.
 * TODO: Thêm cài đặt tên kho, subscription, v.v.
 */
const Settings = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { currentWorkspace } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isOwner = currentWorkspace?.role === 'OWNER';

    const handleDeleted = () => {
        setShowDeleteModal(false);
        navigate('/dashboard');
    };

    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}><SettingOutlined /> Cài đặt</h1>
                    <p className={pageStyles.pageSubtitle}>Cấu hình workspace và tùy chỉnh nâng cao</p>
                </div>
            </div>

            {/* Placeholder */}
            <div className={pageStyles.placeholderCard}>
                <div className={pageStyles.placeholderIcon}><SettingOutlined /></div>
                <h3 className={pageStyles.placeholderTitle}>Cài đặt Workspace</h3>
                <p className={pageStyles.placeholderText}>
                    Cài đặt tên kho, ngành hàng, subscription sẽ được xây dựng tại đây.
                </p>
                <span className={pageStyles.placeholderBadge}><SettingOutlined /> Đang phát triển</span>
            </div>

            {/* DANGER ZONE — OWNER only */}
            {isOwner && (
                <div className={s.dangerZone}>
                    <div className={s.dangerHeader}>
                        <WarningOutlined style={{ color: '#DC2626', fontSize: 18 }} />
                        <span className={s.dangerHeaderTitle}>Vùng nguy hiểm</span>
                    </div>
                    <div className={s.dangerRow}>
                        <div>
                            <div className={s.dangerLabel}>Xóa kho này</div>
                            <div className={s.dangerDesc}>
                                Kho sẽ bị ẩn hoàn toàn. Dữ liệu lịch sử vẫn được lưu trong hệ thống.
                            </div>
                        </div>
                        <button className={s.btnDelete} onClick={() => setShowDeleteModal(true)}>
                            <DeleteOutlined /> Xóa kho
                        </button>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa */}
            {showDeleteModal && (
                <DeleteWorkspaceModal
                    workspaceId={workspaceId}
                    onClose={() => setShowDeleteModal(false)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
};

export default Settings;
