import React, { useState, useEffect } from 'react';
import {
    ExclamationCircleOutlined, DeleteOutlined, LoadingOutlined,
    WarningOutlined, TeamOutlined, FileTextOutlined, AuditOutlined,
    CloseOutlined, CheckOutlined
} from '@ant-design/icons';
import { getDeleteSummary, deleteWorkspace } from '../../api/workspaceApi';
import styles from './DeleteWorkspaceModal.module.css';

/**
 * DeleteWorkspaceModal — Modal xóa kho với 3 tầng bảo vệ:
 *   1. Hiển thị thống kê + cảnh báo
 *   2. Chặn nếu có phiếu PROCESSING
 *   3. Phải gõ đúng tên kho để xác nhận (like GitHub)
 *
 * @prop {string}   workspaceId  - ID của workspace cần xóa
 * @prop {Function} onClose      - Đóng modal
 * @prop {Function} onDeleted    - Callback khi xóa thành công -> redirect
 */
const DeleteWorkspaceModal = ({ workspaceId, onClose, onDeleted }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmName, setConfirmName] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getDeleteSummary(workspaceId);
                setSummary(data);
            } catch (e) {
                setError(e.response?.data?.message || 'Không thể tải thông tin kho');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [workspaceId]);

    const canConfirm = summary?.canDelete && confirmName === summary?.workspaceName;

    const handleDelete = async () => {
        if (!canConfirm) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteWorkspace(workspaceId);
            onDeleted();
        } catch (e) {
            setError(e.response?.data?.message || 'Xóa kho thất bại');
            setDeleting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <DeleteOutlined className={styles.headerIcon} />
                        <span>Xóa kho</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><CloseOutlined /></button>
                </div>

                {loading && (
                    <div className={styles.loadingWrap}>
                        <LoadingOutlined /> Đang tải thông tin...
                    </div>
                )}

                {!loading && error && !summary && (
                    <div className={styles.errorBox}><ExclamationCircleOutlined /> {error}</div>
                )}

                {!loading && summary && (
                    <>
                        {/* Thống kê kho */}
                        <div className={styles.statsGrid}>
                            <StatCard icon={<TeamOutlined />} label="Thành viên" value={summary.memberCount} color="#3B82F6" />
                            <StatCard icon={<FileTextOutlined />} label="Phiếu chờ" value={summary.pendingVouchers} color="#F59E0B" />
                            <StatCard icon={<FileTextOutlined />} label="Đang xử lý" value={summary.processingVouchers} color={summary.processingVouchers > 0 ? '#EF4444' : '#64748B'} />
                            <StatCard icon={<AuditOutlined />} label="Kiểm kê" value={summary.stocktakeCount} color="#8B5CF6" />
                        </div>

                        {/* Chặn nếu đang có phiếu PROCESSING */}
                        {!summary.canDelete && (
                            <div className={styles.blockedBox}>
                                <WarningOutlined />
                                <div>
                                    <strong>Không thể xóa</strong>
                                    <p>Còn <strong>{summary.processingVouchers}</strong> phiếu đang xử lý. Hoàn tất tất cả phiếu trước khi xóa kho.</p>
                                </div>
                            </div>
                        )}

                        {/* Cảnh báo chung */}
                        {summary.canDelete && (
                            <>
                                {/* ⚠️ Có thành viên khác → cảnh báo pero vẫn cho xóa */}
                                {summary.memberCount > 1 && (
                                    <div className={styles.warningBox} style={{ marginBottom: 0 }}>
                                        <TeamOutlined />
                                        <div>
                                            <strong>{summary.memberCount - 1} thành viên khác sẽ mất quyền truy cập</strong>
                                            <p>Họ sẽ không thể đăng nhập vào kho này sau khi bạn xóa.</p>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.warningBox}>
                                    <ExclamationCircleOutlined />
                                    <div>
                                        <strong>Hành động không thể hoàn tác!</strong>
                                        <p>Kho sẽ bị ẩn hoàn toàn. Dữ liệu lịch sử vẫn được lưu nhưng không thể truy cập lại.</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Nhập tên xác nhận (chỉ hiện khi canDelete) */}
                        {summary.canDelete && (
                            <div className={styles.confirmSection}>
                                <label className={styles.confirmLabel}>
                                    Gõ tên kho <strong>"{summary.workspaceName}"</strong> để xác nhận:
                                </label>
                                <input
                                    className={styles.confirmInput}
                                    placeholder={summary.workspaceName}
                                    value={confirmName}
                                    onChange={e => { setConfirmName(e.target.value); setError(null); }}
                                    disabled={deleting}
                                    autoFocus
                                />
                                {confirmName && confirmName !== summary.workspaceName && (
                                    <span className={styles.confirmHint}>Tên chưa khớp</span>
                                )}
                                {confirmName === summary.workspaceName && (
                                    <span className={styles.confirmOk}><CheckOutlined /> Khớp!</span>
                                )}
                            </div>
                        )}

                        {/* Error */}
                        {error && <div className={styles.errorBox}><ExclamationCircleOutlined /> {error}</div>}

                        {/* Actions */}
                        <div className={styles.actions}>
                            <button className={styles.cancelBtn} onClick={onClose} disabled={deleting}>
                                Hủy
                            </button>
                            {summary.canDelete && (
                                <button
                                    className={styles.deleteBtn}
                                    onClick={handleDelete}
                                    disabled={!canConfirm || deleting}
                                >
                                    {deleting ? <><LoadingOutlined /> Đang xóa...</> : <><DeleteOutlined /> Xóa kho</>}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div style={{
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4
    }}>
        <span style={{ color, fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>{value}</span>
        <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
    </div>
);

export default DeleteWorkspaceModal;
