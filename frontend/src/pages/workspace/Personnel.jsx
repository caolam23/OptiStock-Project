import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    TeamOutlined, MailOutlined, PlusOutlined, SyncOutlined, UserDeleteOutlined,
    EditOutlined, ClockCircleOutlined, StopOutlined, CheckCircleOutlined,
    LoadingOutlined, WarningOutlined, CrownOutlined, UserOutlined, LockOutlined,
} from '@ant-design/icons';
import {
    getMembers, getPendingInvitations, updateMemberRole, removeMember, cancelInvitation,
} from '../../api/managerApi';
import { useAuth } from '../../context/AuthContext';
import InviteMemberModal from './InviteMemberModal';
import pageStyles from './WorkspacePage.module.css';
import s from './Personnel.module.css';

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
const ROLE_MAP = {
    OWNER: { label: 'Chủ kho', icon: <CrownOutlined />, color: '#F97316', bg: '#FFF7ED' },
    MANAGER: { label: 'Quản lý', icon: <UserOutlined />, color: '#2563EB', bg: '#EFF6FF' },
    ACCOUNTANT: { label: 'Kế toán', icon: <UserOutlined />, color: '#7C3AED', bg: '#F5F3FF' },
    SALE: { label: 'Bán hàng', icon: <UserOutlined />, color: '#0891B2', bg: '#ECFEFF' },
    STAFF: { label: 'Nhân viên kho', icon: <UserOutlined />, color: '#64748B', bg: '#F8FAFC' },
};

const INVITABLE_ROLES = [
    { value: 'MANAGER', label: 'Quản lý', ownerOnly: true },
    { value: 'ACCOUNTANT', label: 'Kế toán', ownerOnly: false },
    { value: 'SALE', label: 'Bán hàng', ownerOnly: false },
    { value: 'STAFF', label: 'Nhân viên kho', ownerOnly: false },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const Personnel = () => {
    const { workspaceId } = useParams();
    const { currentWorkspace, userId: myUserId } = useAuth();
    const myRole = currentWorkspace?.role || null;

    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('members');
    const [showInvite, setShowInvite] = useState(false);

    // ── Data fetching ─────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [m, inv] = await Promise.all([
                getMembers(workspaceId),
                getPendingInvitations(workspaceId),
            ]);
            setMembers(Array.isArray(m) ? m : []);
            setInvitations(Array.isArray(inv) ? inv : []);
        } catch {
            setError('Không thể tải danh sách nhân sự');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => { load(); }, [load]);

    // ── SSE: realtime push khi có người accept lời mời ────────
    useEffect(() => {
        const url = `http://localhost:8080/api/v1/workspaces/${workspaceId}/personnel/events`;
        let es;
        try {
            es = new EventSource(url); // không cần withCredentials — endpoint là permitAll

            es.addEventListener('personnel-updated', () => {
                load(); // Có người mới join → reload ngay lập tức
            });

            es.onerror = () => {
                // EventSource tự động reconnect, không cần xử lý thêm
            };
        } catch {
            // Fallback: poll 30s nếu SSE không được hỗ trợ
            const timer = setInterval(load, 30000);
            return () => clearInterval(timer);
        }

        return () => { if (es) es.close(); };
    }, [workspaceId, load]);

    // ── Permission helpers ────────────────────────────────────
    const canManage = (targetRole) => {
        if (myRole === 'OWNER') return true;
        if (myRole === 'MANAGER') return ['STAFF', 'ACCOUNTANT', 'SALE'].includes(targetRole);
        return false;
    };

    // ── Handlers ──────────────────────────────────────────────
    const handleKick = async (member) => {
        if (!window.confirm(`Xóa ${member.email} khỏi kho?`)) return;
        try {
            await removeMember(workspaceId, member.userId);
            load();
        } catch (e) { alert(e?.response?.data?.message || 'Lỗi khi xóa thành viên'); }
    };

    const handleRoleChange = async (member, newRole) => {
        try {
            await updateMemberRole(workspaceId, member.userId, newRole);
            load();
        } catch (e) { alert(e?.response?.data?.message || 'Lỗi khi đổi role'); }
    };

    const handleCancelInvite = async (invite) => {
        if (!window.confirm(`Hủy lời mời gửi tới ${invite.invitedEmail}?`)) return;
        try {
            await cancelInvitation(workspaceId, invite.id);
            load();
        } catch (e) { alert(e?.response?.data?.message || 'Lỗi khi hủy lời mời'); }
    };

    const invitableRoles = INVITABLE_ROLES.filter(r =>
        myRole === 'OWNER' ? true : !r.ownerOnly
    );

    // ── Render ────────────────────────────────────────────────
    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>Nhân sự</h1>
                    <p className={pageStyles.pageSubtitle}>
                        {members.length} thành viên · {invitations.length} lời mời đang chờ
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={s.btnGhost} onClick={load} disabled={loading}>
                        <SyncOutlined spin={loading} /> Làm mới
                    </button>
                    {(myRole === 'OWNER' || myRole === 'MANAGER') && (
                        <button className={s.btnPrimary} onClick={() => setShowInvite(true)}>
                            <PlusOutlined /> Mời thành viên
                        </button>
                    )}
                </div>
            </div>

            {/* TABS */}
            <div className={s.tabBar}>
                <button className={tab === 'members' ? s.tabActive : s.tabInactive} onClick={() => setTab('members')}>
                    <TeamOutlined /> Nhân sự ({members.length})
                </button>
                <button className={tab === 'invitations' ? s.tabActive : s.tabInactive} onClick={() => setTab('invitations')}>
                    <MailOutlined /> Đang chờ ({invitations.length})
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 64, color: '#94A3B8' }}>
                    <LoadingOutlined style={{ fontSize: 28, color: '#F97316' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Đang tải...</span>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className={s.errorBox}><WarningOutlined /> {error}</div>
            )}

            {/* MEMBERS TAB */}
            {!loading && !error && tab === 'members' && (
                <div className={s.card}>
                    {members.length === 0 ? (
                        <div className={pageStyles.placeholderCard}>
                            <div className={pageStyles.placeholderIcon}><TeamOutlined /></div>
                            <h3 className={pageStyles.placeholderTitle}>Chưa có thành viên nào</h3>
                        </div>
                    ) : (
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    {['Thành viên', 'Vai trò', 'Tham gia', ''].map(h => (
                                        <th key={h} className={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m, i) => {
                                    const roleInfo = ROLE_MAP[m.role] || { label: m.role, color: '#64748B', bg: '#F8FAFC' };
                                    const isMe = m.userId === myUserId;
                                    const manageable = canManage(m.role) && !isMe && m.role !== 'OWNER';
                                    return (
                                        <tr key={m.userId} className={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td className={s.td}>
                                                <div className={s.memberRow}>
                                                    <div className={s.avatar}>
                                                        {(m.fullName || m.email || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className={s.memberName}>
                                                            {m.fullName || m.email}
                                                            {isMe && <span className={s.selfTag}>Bạn</span>}
                                                        </div>
                                                        {m.fullName && <div className={s.memberEmail}>{m.email}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={s.td}>
                                                {manageable
                                                    ? <RoleSelect
                                                        value={m.role}
                                                        roles={INVITABLE_ROLES.filter(r => myRole === 'OWNER' ? true : !r.ownerOnly)}
                                                        onChange={newRole => handleRoleChange(m, newRole)}
                                                        roleInfo={roleInfo}
                                                    />
                                                    : <RoleBadge info={roleInfo} />
                                                }
                                            </td>
                                            <td className={s.td} style={{ fontSize: 12, color: '#64748B' }}>
                                                {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td className={s.td} style={{ textAlign: 'right' }}>
                                                {manageable && (
                                                    <button className={s.btnDanger} onClick={() => handleKick(m)} title="Xóa khỏi kho">
                                                        <UserDeleteOutlined />
                                                    </button>
                                                )}
                                                {m.role === 'OWNER' && <LockOutlined style={{ color: '#94A3B8', fontSize: 14 }} />}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* INVITATIONS TAB */}
            {!loading && !error && tab === 'invitations' && (
                <div className={s.card}>
                    {invitations.length === 0 ? (
                        <div className={pageStyles.placeholderCard} style={{ minHeight: 280 }}>
                            <div className={pageStyles.placeholderIcon}><MailOutlined /></div>
                            <h3 className={pageStyles.placeholderTitle}>Không có lời mời nào đang chờ</h3>
                            <p className={pageStyles.placeholderText}>Bấm "Mời thành viên" để gửi lời mời mới.</p>
                        </div>
                    ) : (
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    {['Email', 'Vai trò', 'Hết hạn', 'Trạng thái', ''].map(h => (
                                        <th key={h} className={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map((inv, i) => {
                                    const expired = inv.expiresAt && new Date(inv.expiresAt) < new Date();
                                    const roleInfo = ROLE_MAP[inv.role] || { label: inv.role, color: '#64748B', bg: '#F8FAFC' };
                                    return (
                                        <tr key={inv.id} className={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td className={s.td} style={{ fontWeight: 500, color: '#0F172A' }}>{inv.invitedEmail}</td>
                                            <td className={s.td}><RoleBadge info={roleInfo} /></td>
                                            <td className={s.td} style={{ fontSize: 12, color: expired ? '#DC2626' : '#64748B' }}>
                                                {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td className={s.td}>
                                                <span className={expired ? s.badgeExpired : s.badgePending}>
                                                    <ClockCircleOutlined /> {expired ? 'Hết hạn' : 'Chờ xác nhận'}
                                                </span>
                                            </td>
                                            <td className={s.td} style={{ textAlign: 'right' }}>
                                                {(myRole === 'OWNER' || myRole === 'MANAGER') && (
                                                    <button className={s.btnDanger} onClick={() => handleCancelInvite(inv)} title="Hủy lời mời">
                                                        <StopOutlined />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* INVITE MODAL */}
            {showInvite && (
                <InviteMemberModal
                    workspaceId={workspaceId}
                    invitableRoles={invitableRoles}
                    onClose={() => setShowInvite(false)}
                    onSent={() => { setShowInvite(false); load(); setTab('invitations'); }}
                />
            )}
        </div>
    );
};

// ─── ROLE BADGE ───────────────────────────────────────────────────────────────
const RoleBadge = ({ info }) => (
    <span
        className={s.roleBadge}
        style={{ color: info.color, background: info.bg }}
    >
        {info.icon} {info.label}
    </span>
);

// ─── ROLE SELECT (fixed-position dropdown, không bị cắt bởi overflow) ────────
const RoleSelect = ({ value, roles, onChange, roleInfo }) => {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, left: rect.left });
        }
        setOpen(o => !o);
    };

    return (
        <>
            <button
                ref={btnRef}
                className={s.roleBtn}
                style={{ color: roleInfo.color, background: roleInfo.bg, borderColor: roleInfo.color + '40' }}
                onClick={handleOpen}
            >
                {roleInfo.icon} {roleInfo.label}
                <EditOutlined style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }} />
            </button>

            {/* Overlay để đóng dropdown khi click ra ngoài */}
            {open && <div className={s.dropdownOverlay} onClick={() => setOpen(false)} />}

            {/* Dropdown menu dùng position:fixed → không bao giờ bị cắt */}
            {open && (
                <div
                    className={s.dropdown}
                    style={{ top: menuPos.top, left: menuPos.left }}
                >
                    {roles.map(r => (
                        <button
                            key={r.value}
                            className={r.value === value ? s.dropdownItemActive : s.dropdownItem}
                            onClick={() => { onChange(r.value); setOpen(false); }}
                        >
                            {r.label}
                            {r.value === value && <CheckCircleOutlined style={{ color: '#16A34A', marginLeft: 6 }} />}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};

export default Personnel;
