import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import invitationApi from '../../api/invitationApi';
import styles from './AcceptInvitation.module.css';

// ============================================================
// AcceptInvitation: Trang xử lý link mời thành viên
// Route: /accept-invitation?code=INV-xxxx
// ============================================================

const ROLE_DISPLAY = {
    MANAGER: { label: 'Quản lý kho', color: '#2563EB', bg: '#EFF6FF' },
    ACCOUNTANT: { label: 'Kế toán', color: '#7C3AED', bg: '#F5F3FF' },
    SALE: { label: 'Nhân viên bán hàng', color: '#059669', bg: '#ECFDF5' },
    STAFF: { label: 'Nhân viên kho', color: '#D97706', bg: '#FFFBEB' },
    OWNER: { label: 'Chủ kho', color: '#DC2626', bg: '#FEF2F2' },
};

const formatExpiry = (expiresAt) => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Đã hết hạn';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
    return `Còn ${hours} giờ`;
};

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [pageState, setPageState] = useState('loading'); // loading | info | success | rejected | error
    const [inviteInfo, setInviteInfo] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // ── Fetch invitation info ─────────────────────────────────
    useEffect(() => {
        if (!code) {
            setErrorMsg('Link mời không hợp lệ — không tìm thấy mã mời.');
            setPageState('error');
            return;
        }

        invitationApi.getInvitationInfo(code)
            .then(res => {
                setInviteInfo(res.data);
                setPageState('info');
            })
            .catch(err => {
                const msg = err.response?.data?.error || 'Lời mời không tồn tại hoặc đã hết hạn.';
                setErrorMsg(msg);
                setPageState('error');
            });
    }, [code]);

    // ── Accept ────────────────────────────────────────────────
    const handleAccept = async () => {
        setActionLoading(true);
        try {
            const res = await invitationApi.acceptInvitation(code);
            setSuccessData(res.data);
            setPageState('success');
        } catch (err) {
            const msg = err.response?.data?.error || 'Không thể chấp nhận lời mời. Vui lòng thử lại.';
            setErrorMsg(msg);
            setPageState('error');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Reject ────────────────────────────────────────────────
    const handleReject = async () => {
        if (!window.confirm('Bạn có chắc muốn từ chối lời mời này không?')) return;
        setActionLoading(true);
        try {
            await invitationApi.rejectInvitation(code);
            setPageState('rejected');
        } catch (err) {
            const msg = err.response?.data?.error || 'Không thể từ chối lời mời. Vui lòng thử lại.';
            setErrorMsg(msg);
            setPageState('error');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Login redirect ────────────────────────────────────────
    const handleLoginRedirect = () => {
        const encodedRedirect = encodeURIComponent(`/accept-invitation?code=${code}`);
        window.location.href = `/login?redirect=${encodedRedirect}`;
    };

    // ── Go to dashboard ──────────────────────────────────────
    const handleGoDashboard = () => {
        window.location.href = '/dashboard';
    };

    // ── Role badge ───────────────────────────────────────────
    const RoleBadge = ({ role }) => {
        const config = ROLE_DISPLAY[role] || { label: role, color: '#6B7280', bg: '#F9FAFB' };
        return (
            <span
                className={styles.roleBadge}
                style={{ color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}30` }}
            >
                {config.label}
            </span>
        );
    };

    // ════════════════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════════════════

    if (authLoading || pageState === 'loading') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Đang tải thông tin lời mời...</p>
                </div>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────
    if (pageState === 'error') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.iconWrap} style={{ background: '#FEF2F2' }}>
                        <span className={styles.iconLarge}>❌</span>
                    </div>
                    <h2 className={styles.title}>Lời Mời Không Hợp Lệ</h2>
                    <p className={styles.subtitle}>{errorMsg}</p>
                    <button className={styles.btnSecondary} onClick={() => window.location.href = '/login'}>
                        Về trang đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    // ── Success state ─────────────────────────────────────────
    if (pageState === 'success') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.iconWrap} style={{ background: '#ECFDF5' }}>
                        <span className={styles.iconLarge}>🎉</span>
                    </div>
                    <h2 className={styles.title}>Tham Gia Thành Công!</h2>
                    <p className={styles.subtitle}>
                        Bạn đã tham gia <strong>{successData?.tenantName}</strong> với vai trò{' '}
                        <RoleBadge role={successData?.role} />
                    </p>
                    <button className={styles.btnPrimary} onClick={handleGoDashboard}>
                        Vào Dashboard ngay →
                    </button>
                </div>
            </div>
        );
    }

    // ── Rejected state ────────────────────────────────────────
    if (pageState === 'rejected') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.iconWrap} style={{ background: '#FFF7ED' }}>
                        <span className={styles.iconLarge}>👋</span>
                    </div>
                    <h2 className={styles.title}>Đã Từ Chối Lời Mời</h2>
                    <p className={styles.subtitle}>Bạn đã từ chối lời mời tham gia workspace này.</p>
                    <button className={styles.btnSecondary} onClick={() => window.location.href = '/login'}>
                        Về trang đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    // ── Main info state ───────────────────────────────────────
    const role = inviteInfo?.role;
    const roleConfig = ROLE_DISPLAY[role] || { label: role, color: '#6B7280' };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logoRow}>
                    <div className={styles.logoIcon}>📦</div>
                    <span className={styles.logoText}>OptiStock</span>
                </div>

                {/* Header */}
                <div className={styles.iconWrap}>
                    <span className={styles.iconLarge}>✉️</span>
                </div>
                <h2 className={styles.title}>Bạn Được Mời Tham Gia!</h2>

                {/* Workspace info */}
                <div className={styles.infoBox}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>🏢 Kho hàng</span>
                        <span className={styles.infoValue}><strong>{inviteInfo?.tenantName}</strong></span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>👤 Vai trò</span>
                        <span className={styles.infoValue}><RoleBadge role={role} /></span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>📧 Dành cho</span>
                        <span className={styles.infoValue}>{inviteInfo?.invitedEmail}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>⏰ Thời hạn</span>
                        <span className={styles.infoValue} style={{ color: '#D97706' }}>
                            {formatExpiry(inviteInfo?.expiresAt)}
                        </span>
                    </div>
                </div>

                {/* Role description */}
                <p className={styles.roleDesc} style={{ color: roleConfig.color }}>
                    {ROLE_DISPLAY[role]?.label && `Với vai trò ${ROLE_DISPLAY[role].label}, bạn sẽ có quyền truy cập vào hệ thống kho hàng của ${inviteInfo?.tenantName}.`}
                </p>

                {/* Action buttons */}
                {isAuthenticated ? (
                    <div className={styles.actions}>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleAccept}
                            disabled={actionLoading}
                            id="btn-accept-invitation"
                        >
                            {actionLoading ? '⏳ Đang xử lý...' : '✅ Chấp Nhận Lời Mời'}
                        </button>
                        <button
                            className={styles.btnDanger}
                            onClick={handleReject}
                            disabled={actionLoading}
                            id="btn-reject-invitation"
                        >
                            ❌ Từ Chối
                        </button>
                    </div>
                ) : (
                    <div className={styles.actions}>
                        <p className={styles.loginNote}>
                            Vui lòng đăng nhập để chấp nhận lời mời này.
                        </p>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleLoginRedirect}
                            id="btn-login-to-accept"
                        >
                            🔐 Đăng Nhập Để Tham Gia
                        </button>
                    </div>
                )}

                <p className={styles.footNote}>
                    Lời mời từ hệ thống OptiStock — Quản lý kho thông minh
                </p>
            </div>
        </div>
    );
};

export default AcceptInvitation;
