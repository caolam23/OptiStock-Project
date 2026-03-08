import React, { useState } from 'react';
import {
    CloseOutlined, SendOutlined, LoadingOutlined,
    WarningOutlined, UserAddOutlined,
} from '@ant-design/icons';
import { sendInvitation } from '../../api/managerApi';
import styles from './CreateVoucherModal.module.css';

/**
 * InviteMemberModal — Modal gửi lời mời thành viên
 * @prop {string}   workspaceId
 * @prop {Array}    invitableRoles — [{ value, label }]
 * @prop {Function} onClose
 * @prop {Function} onSent  — gọi khi gửi thành công
 */
const InviteMemberModal = ({ workspaceId, invitableRoles, onClose, onSent }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(invitableRoles[0]?.value || 'STAFF');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const valid = email.trim().length > 0 && email.includes('@');

    const handleSend = async () => {
        if (!valid) return;
        setLoading(true); setError(null);
        try {
            await sendInvitation(workspaceId, email.trim(), role);
            onSent();
        } catch (e) {
            setError(e?.response?.data?.message || 'Gửi lời mời thất bại');
            setLoading(false);
        }
    };

    const handleKey = (e) => { if (e.key === 'Enter' && valid && !loading) handleSend(); };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>

                {/* ── HEADER ── */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <UserAddOutlined className={styles.headerIcon} /> Mời thành viên
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><CloseOutlined /></button>
                </div>

                {/* ── BODY ── */}
                <div className={styles.body}>
                    <div className={styles.formStack}>

                        {/* Email */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email <span className={styles.required}>*</span></label>
                            <input
                                className={styles.input}
                                type="email"
                                placeholder="ten@email.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(null); }}
                                onKeyDown={handleKey}
                                autoFocus
                            />
                        </div>

                        {/* Role */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Vai trò</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {invitableRoles.map(r => (
                                    <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${role === r.value ? '#F97316' : '#E2E8F0'}`, background: role === r.value ? '#FFF7ED' : '#F8FAFC', cursor: 'pointer', transition: 'all .15s' }}>
                                        <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} style={{ accentColor: '#F97316', width: 14, height: 14 }} />
                                        <div>
                                            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: role === r.value ? '#F97316' : '#0F172A' }}>
                                                {r.label}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                                {ROLE_DESCRIPTIONS[r.value]}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Info note */}
                        <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 12, color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            💡 Người được mời sẽ nhận email với link tham gia. Link có hiệu lực <strong>7 ngày</strong>.
                        </div>
                    </div>
                </div>

                {/* ── ERROR ── */}
                {error && (
                    <div className={styles.errorBanner}>
                        <WarningOutlined /> {error}
                    </div>
                )}

                {/* ── FOOTER ── */}
                <div className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose}>Hủy</button>
                    <button
                        className={styles.btnSubmit}
                        onClick={handleSend}
                        disabled={!valid || loading}
                    >
                        {loading
                            ? <><LoadingOutlined /> Đang gửi...</>
                            : <><SendOutlined /> Gửi lời mời</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

const ROLE_DESCRIPTIONS = {
    MANAGER: 'Quản lý kho, tạo phiếu, theo dõi tồn kho',
    ACCOUNTANT: 'Xem báo cáo tài chính, lịch sử giao dịch',
    SALE: 'Xem tồn kho, tạo đơn xuất hàng',
    STAFF: 'Xử lý phiếu nhập/xuất, kiểm kê thực tế',
};

export default InviteMemberModal;
