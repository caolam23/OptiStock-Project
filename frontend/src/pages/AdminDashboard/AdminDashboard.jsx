import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import {
    DashboardOutlined, TeamOutlined, ShopOutlined, SettingOutlined,
    SearchOutlined, LockOutlined, UnlockOutlined, DeleteOutlined,
    CheckCircleOutlined, StopOutlined, ReloadOutlined, LoadingOutlined,
    WarningOutlined, ClockCircleOutlined, CalendarOutlined,
    UserOutlined, CrownOutlined, GlobalOutlined, BarChartOutlined,
    LogoutOutlined, ArrowLeftOutlined, PlusOutlined,
} from '@ant-design/icons';
import styles from './AdminDashboard.module.css';

// ─── NAV CONFIG ────────────────────────────────────────────────────────────────
const NAV_SUPER = [
    { key: 'overview', label: 'Tổng quan', icon: <DashboardOutlined /> },
    { key: 'tenants', label: 'Quản lý Workspace', icon: <ShopOutlined /> },
    { key: 'users', label: 'Quản lý Tài khoản', icon: <TeamOutlined /> },
    { key: 'monitor', label: 'Giám sát Hệ thống', icon: <BarChartOutlined /> },
];

// ─── SUBSCRIPTION BADGE ────────────────────────────────────────────────────────
const PlanBadge = ({ plan }) => {
    const map = {
        FREE: 'free', BASIC: 'basic', PRO: 'pro', ENTERPRISE: 'enterprise'
    };
    return (
        <span className={`${styles.badge} ${styles[map[plan] || 'free']}`}>
            {plan || 'FREE'}
        </span>
    );
};

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        ACTIVE: 'active', LOCKED: 'locked', SUSPENDED: 'suspended',
        EXPIRED: 'expired', INACTIVE: 'inactive'
    };
    const labels = {
        ACTIVE: 'Hoạt động', LOCKED: 'Đã khóa', SUSPENDED: 'Tạm dừng',
        EXPIRED: 'Hết hạn', INACTIVE: 'Vô hiệu'
    };
    const cls = map[status] || 'inactive';
    return (
        <span className={`${styles.badge} ${styles[cls]}`}>
            {status === 'ACTIVE' && <CheckCircleOutlined />}
            {status === 'LOCKED' && <LockOutlined />}
            {(status === 'INACTIVE' || status === 'SUSPENDED') && <StopOutlined />}
            {status === 'EXPIRED' && <ClockCircleOutlined />}
            {' '}{labels[status] || status}
        </span>
    );
};

// ─── CONFIRM MODAL ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, desc, dangerous, onConfirm, onCancel, loading,
    extraInput, extraInputLabel, extraInputValue, onExtraInput }) => (
    <div className={styles.modalOverlay} onClick={onCancel}>
        <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
                {dangerous
                    ? <WarningOutlined style={{ color: '#DC2626' }} />
                    : <CheckCircleOutlined style={{ color: '#6366F1' }} />}
                {title}
            </h3>
            <p className={styles.modalDesc}>{desc}</p>
            {extraInput && (
                <input
                    className={styles.modalInput}
                    type="number"
                    min={1}
                    placeholder={extraInputLabel}
                    value={extraInputValue}
                    onChange={e => onExtraInput(e.target.value)}
                    autoFocus
                />
            )}
            <div className={styles.modalActions}>
                <button className={styles.btnGhost} onClick={onCancel} disabled={loading}>Hủy</button>
                <button
                    className={dangerous ? styles.btnDanger : styles.btnPrimary}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? <LoadingOutlined spin /> : 'Xác nhận'}
                </button>
            </div>
        </div>
    </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { isSuperAdmin, user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [tenants, setTenants] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [searchTenant, setSearchTenant] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [filterActive, setFilterActive] = useState('');

    // Modal state
    const [modal, setModal] = useState(null);
    // { type: 'lock'|'unlock'|'deactivate'|'activate'|'delete'|'renew', target }
    const [renewDays, setRenewDays] = useState('30');
    const [actionLoading, setActionLoading] = useState(false);

    const superAdmin = isSuperAdmin();

    // ── Load data ────────────────────────────────────────────────
    useEffect(() => {
        if (superAdmin) {
            loadTenants();
            loadUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTenants = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await adminApi.getAllTenants();
            setTenants(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) {
            setError('Lỗi tải danh sách workspace: ' + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const res = await adminApi.getAllUsers();
            setUsers(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) {
            setError('Lỗi tải danh sách người dùng: ' + (e.response?.data?.message || e.message));
        }
    };

    // ── Stats ────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.status === 'ACTIVE').length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
    }), [tenants, users]);

    // ── Filtered lists ────────────────────────────────────────────
    const filteredTenants = useMemo(() => {
        return tenants.filter(t => {
            const q = searchTenant.toLowerCase();
            const matchQ = !q || t.companyName?.toLowerCase().includes(q)
                || t.ownerEmail?.toLowerCase().includes(q)
                || t.tenantId?.toLowerCase().includes(q);
            const matchStatus = !filterStatus || t.status === filterStatus;
            return matchQ && matchStatus;
        });
    }, [tenants, searchTenant, filterStatus]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const q = searchUser.toLowerCase();
            const matchQ = !q || u.fullName?.toLowerCase().includes(q)
                || u.email?.toLowerCase().includes(q);
            const matchActive = filterActive === '' ? true
                : filterActive === 'active' ? u.isActive
                : !u.isActive;
            return matchQ && matchActive;
        });
    }, [users, searchUser, filterActive]);

    // ── Actions ──────────────────────────────────────────────────
    const openModal = (type, target) => {
        setModal({ type, target });
        if (type === 'renew') setRenewDays('30');
    };

    const closeModal = () => { setModal(null); setActionLoading(false); };

    const handleConfirm = async () => {
        if (!modal) return;
        setActionLoading(true);
        try {
            const { type, target } = modal;
            if (type === 'lock')       await adminApi.lockTenant(target.tenantId);
            if (type === 'unlock')     await adminApi.unlockTenant(target.tenantId);
            if (type === 'renew')      await adminApi.renewSubscription(target.tenantId, renewDays);
            if (type === 'deactivate') await adminApi.deactivateUser(target.id);
            if (type === 'activate')   await adminApi.activateUser(target.id);
            if (type === 'deleteUser') await adminApi.deleteUser(target.id);
            closeModal();
            loadTenants();
            loadUsers();
        } catch (e) {
            setError(e.response?.data?.message || e.message);
            closeModal();
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    // ── Modal config per type ─────────────────────────────────────
    const getModalProps = () => {
        if (!modal) return {};
        const { type, target } = modal;
        const cfg = {
            lock:       { title: 'Khóa Workspace', desc: `Khóa "${target?.companyName}"? Người dùng trong kho sẽ không thể đăng nhập.`, dangerous: true },
            unlock:     { title: 'Mở khóa Workspace', desc: `Mở khóa "${target?.companyName}"?`, dangerous: false },
            renew:      { title: 'Gia hạn dịch vụ', desc: `Gia hạn dịch vụ cho "${target?.companyName}".`, dangerous: false, extraInput: true, extraInputLabel: 'Số ngày gia hạn' },
            deactivate: { title: 'Vô hiệu hóa tài khoản', desc: `Vô hiệu hóa "${target?.email}"?`, dangerous: true },
            activate:   { title: 'Kích hoạt tài khoản', desc: `Kích hoạt "${target?.email}"?`, dangerous: false },
            deleteUser: { title: 'Xóa tài khoản', desc: `Xóa vĩnh viễn "${target?.email}"? Hành động không thể hoàn tác!`, dangerous: true },
        };
        return cfg[type] || {};
    };

    // ── Render helpers ────────────────────────────────────────────
    const userInitial = (u) => (u?.fullName || u?.email || '?')[0].toUpperCase();

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';

    const daysLeft = (expiry) => {
        if (!expiry) return null;
        const diff = Math.ceil((new Date(expiry) - new Date()) / 86400000);
        return diff;
    };

    // ──────────────────────────────────────────────────────────────
    return (
        <div className={styles.adminShell}>

            {/* ─── LEFT SIDEBAR ─── */}
            <aside className={styles.adminSidebar}>
                <div className={styles.adminSidebarLogo}>
                    <div className={styles.adminLogoIcon}>⚡</div>
                    <div className={styles.adminLogoText}>
                        <span className={styles.adminLogoTitle}>OptiStock</span>
                        <span className={styles.adminLogoBadge}>Super Admin</span>
                    </div>
                </div>

                <nav className={styles.adminNav}>
                    {NAV_SUPER.map(item => (
                        <button
                            key={item.key}
                            className={`${styles.adminNavItem} ${activeTab === item.key ? styles.navActive : ''}`}
                            onClick={() => setActiveTab(item.key)}
                        >
                            <span className={styles.adminNavIcon}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className={styles.adminNavFooter}>
                    <div className={styles.adminNavEmail}>{user?.email}</div>
                    <button
                        className={styles.adminNavItem}
                        onClick={() => navigate('/dashboard')}
                    >
                        <span className={styles.adminNavIcon}><ArrowLeftOutlined /></span>
                        Về Dashboard
                    </button>
                    <button
                        className={styles.adminNavItem}
                        onClick={handleLogout}
                    >
                        <span className={styles.adminNavIcon}><LogoutOutlined /></span>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ─── MAIN CONTENT ─── */}
            <div className={styles.adminContent}>

                {/* Top Bar */}
                <div className={styles.adminTopBar}>
                    <div className={styles.adminTopBarLeft}>
                        <h1 className={styles.adminPageTitle}>
                            {activeTab === 'overview' && 'Tổng quan Hệ thống'}
                            {activeTab === 'tenants' && 'Quản lý Workspace'}
                            {activeTab === 'users' && 'Quản lý Tài khoản'}
                            {activeTab === 'monitor' && 'Giám sát Hệ thống'}
                        </h1>
                        <p className={styles.adminPageSubtitle}>
                            {activeTab === 'overview' && `${stats.activeTenants} kho đang hoạt động · ${stats.activeUsers} người dùng online`}
                            {activeTab === 'tenants' && `Tổng ${tenants.length} workspace trên nền tảng`}
                            {activeTab === 'users' && `Tổng ${users.length} tài khoản đã đăng ký`}
                            {activeTab === 'monitor' && 'Trạng thái server và API endpoints'}
                        </p>
                    </div>
                    <div className={styles.adminTopBarRight}>
                        <button className={styles.btnGhost} onClick={() => { loadTenants(); loadUsers(); }}>
                            <ReloadOutlined /> Làm mới
                        </button>
                        <div className={styles.adminAvatarBtn}><CrownOutlined /></div>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.adminBody}>
                    {error && (
                        <div className={styles.errorBanner}>
                            <WarningOutlined /> {error}
                        </div>
                    )}

                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIconWrap} ${styles.purple}`}><ShopOutlined /></div>
                                    <div className={styles.statInfo}>
                                        <div className={styles.statValue}>{stats.totalTenants}</div>
                                        <div className={styles.statLabel}>Tổng Workspace</div>
                                        <span className={`${styles.statBadge} ${styles.up}`}>
                                            {stats.activeTenants} đang hoạt động
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIconWrap} ${styles.blue}`}><TeamOutlined /></div>
                                    <div className={styles.statInfo}>
                                        <div className={styles.statValue}>{stats.totalUsers}</div>
                                        <div className={styles.statLabel}>Người dùng</div>
                                        <span className={`${styles.statBadge} ${styles.up}`}>
                                            {stats.activeUsers} đang kích hoạt
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIconWrap} ${styles.green}`}><CheckCircleOutlined /></div>
                                    <div className={styles.statInfo}>
                                        <div className={styles.statValue}>{stats.activeTenants}</div>
                                        <div className={styles.statLabel}>Kho đang hoạt động</div>
                                        <span className={`${styles.statBadge} ${stats.activeTenants > 0 ? styles.up : styles.neu}`}>
                                            {stats.totalTenants > 0 ? Math.round(stats.activeTenants / stats.totalTenants * 100) : 0}% tổng số
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={`${styles.statIconWrap} ${styles.orange}`}><LockOutlined /></div>
                                    <div className={styles.statInfo}>
                                        <div className={styles.statValue}>
                                            {tenants.filter(t => t.status === 'LOCKED').length}
                                        </div>
                                        <div className={styles.statLabel}>Kho bị khóa</div>
                                        <span className={`${styles.statBadge} ${styles.down}`}>Cần xem lại</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Tenants */}
                            <div className={styles.sectionCard}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>
                                        <span className={styles.sectionTitleIcon}><ShopOutlined /></span>
                                        Workspace gần đây
                                    </h2>
                                    <button className={styles.btnGhost} onClick={() => setActiveTab('tenants')}>
                                        Xem tất cả →
                                    </button>
                                </div>
                                {loading ? (
                                    <div className={styles.loading}><LoadingOutlined style={{ fontSize: 24, color: '#6366F1' }} spin /> Đang tải...</div>
                                ) : (
                                    <div className={styles.tableWrap}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Workspace</th>
                                                    <th>Chủ sở hữu</th>
                                                    <th>Gói</th>
                                                    <th>Trạng thái</th>
                                                    <th>Hết hạn</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tenants.slice(0, 5).map(t => (
                                                    <tr key={t.tenantId}>
                                                        <td>
                                                            <div className={styles.userCell}>
                                                                <div className={styles.userAvatar}
                                                                    style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                                                                    {(t.companyName || 'W')[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className={styles.userName}>{t.companyName}</div>
                                                                    <div className={styles.userEmail}>{t.tenantId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><div className={styles.userEmail}>{t.ownerEmail}</div></td>
                                                        <td><PlanBadge plan={t.subscriptionPlan} /></td>
                                                        <td><StatusBadge status={t.status} /></td>
                                                        <td>
                                                            {(() => {
                                                                const days = daysLeft(t.expiryDate);
                                                                return (
                                                                    <span style={{ fontSize: 12, color: days < 7 ? '#DC2626' : '#64748B' }}>
                                                                        {formatDate(t.expiryDate)}
                                                                        {days !== null && days < 7 && ` (còn ${days}d)`}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ═══ TENANTS TAB ═══ */}
                    {activeTab === 'tenants' && (
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionTitleIcon}><ShopOutlined /></span>
                                    Danh sách Workspace ({filteredTenants.length})
                                </h2>
                                <button className={styles.btnGhost} onClick={loadTenants} disabled={loading}>
                                    <ReloadOutlined spin={loading} /> Làm mới
                                </button>
                            </div>

                            {/* Filter bar */}
                            <div className={styles.filterBar}>
                                <div className={styles.searchWrap}>
                                    <SearchOutlined className={styles.searchIcon} />
                                    <input
                                        className={styles.searchInput}
                                        placeholder="Tìm theo tên, email, tenant ID..."
                                        value={searchTenant}
                                        onChange={e => setSearchTenant(e.target.value)}
                                    />
                                </div>
                                <select
                                    className={styles.filterSelect}
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="LOCKED">Đã khóa</option>
                                    <option value="SUSPENDED">Tạm dừng</option>
                                    <option value="EXPIRED">Hết hạn</option>
                                </select>
                            </div>

                            {loading ? (
                                <div className={styles.loading}><LoadingOutlined style={{ fontSize: 24, color: '#6366F1' }} spin /> Đang tải...</div>
                            ) : filteredTenants.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}><ShopOutlined /></div>
                                    <div className={styles.emptyText}>Không có workspace nào</div>
                                </div>
                            ) : (
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Workspace</th>
                                                <th>Chủ sở hữu</th>
                                                <th>Ngành</th>
                                                <th>Gói dịch vụ</th>
                                                <th>Trạng thái</th>
                                                <th>Hết hạn</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTenants.map((t, idx) => {
                                                const days = daysLeft(t.expiryDate);
                                                return (
                                                    <tr key={t.tenantId || idx}>
                                                        <td style={{ color: '#94A3B8', fontSize: 12 }}>{idx + 1}</td>
                                                        <td>
                                                            <div className={styles.userCell}>
                                                                <div className={styles.userAvatar}
                                                                    style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 10 }}>
                                                                    {(t.companyName || 'W')[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className={styles.userName}>{t.companyName || '—'}</div>
                                                                    <div className={styles.userEmail}>{t.tenantId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><div className={styles.userEmail}>{t.ownerEmail}</div></td>
                                                        <td><span className={`${styles.badge} ${styles.member}`}>{t.businessType || t.industryCode || '—'}</span></td>
                                                        <td><PlanBadge plan={t.subscriptionPlan} /></td>
                                                        <td><StatusBadge status={t.status} /></td>
                                                        <td>
                                                            <div style={{ fontSize: 12, color: days !== null && days < 7 ? '#DC2626' : '#64748B' }}>
                                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                                {formatDate(t.expiryDate)}
                                                                {days !== null && days < 7 && (
                                                                    <span style={{ marginLeft: 4, fontWeight: 600 }}>
                                                                        (còn {days}d)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={styles.actionsCell}>
                                                                {t.status === 'ACTIVE' ? (
                                                                    <button className={styles.btnWarning} onClick={() => openModal('lock', t)}>
                                                                        <LockOutlined /> Khóa
                                                                    </button>
                                                                ) : (
                                                                    <button className={styles.btnSuccess} onClick={() => openModal('unlock', t)}>
                                                                        <UnlockOutlined /> Mở
                                                                    </button>
                                                                )}
                                                                <button className={styles.btnPrimary} onClick={() => openModal('renew', t)}>
                                                                    <CalendarOutlined /> Gia hạn
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ USERS TAB ═══ */}
                    {activeTab === 'users' && (
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionTitleIcon}><TeamOutlined /></span>
                                    Quản lý Tài khoản ({filteredUsers.length})
                                </h2>
                                <button className={styles.btnGhost} onClick={loadUsers}>
                                    <ReloadOutlined /> Làm mới
                                </button>
                            </div>

                            {/* Filter bar */}
                            <div className={styles.filterBar}>
                                <div className={styles.searchWrap}>
                                    <SearchOutlined className={styles.searchIcon} />
                                    <input
                                        className={styles.searchInput}
                                        placeholder="Tìm theo tên, email..."
                                        value={searchUser}
                                        onChange={e => setSearchUser(e.target.value)}
                                    />
                                </div>
                                <select
                                    className={styles.filterSelect}
                                    value={filterActive}
                                    onChange={e => setFilterActive(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="active">Đang kích hoạt</option>
                                    <option value="inactive">Vô hiệu</option>
                                </select>
                            </div>

                            {filteredUsers.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}><UserOutlined /></div>
                                    <div className={styles.emptyText}>Không có tài khoản nào</div>
                                </div>
                            ) : (
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Người dùng</th>
                                                <th>Vai trò</th>
                                                <th>Workspace</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((u, idx) => {
                                                const isSA = u.roles?.includes('SUPER_ADMIN');
                                                return (
                                                    <tr key={u.id || idx}>
                                                        <td style={{ color: '#94A3B8', fontSize: 12 }}>{idx + 1}</td>
                                                        <td>
                                                            <div className={styles.userCell}>
                                                                {u.avatar
                                                                    ? <img src={u.avatar} alt={u.fullName} className={styles.userAvatarImg} />
                                                                    : <div className={styles.userAvatar}>{userInitial(u)}</div>
                                                                }
                                                                <div>
                                                                    <div className={styles.userName}>{u.fullName || '—'}</div>
                                                                    <div className={styles.userEmail}>{u.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {isSA
                                                                ? <span className={`${styles.badge} ${styles.superadmin}`}><CrownOutlined /> SUPER ADMIN</span>
                                                                : u.workspaces?.length > 0
                                                                    ? u.workspaces.map((ws, i) => (
                                                                        <span key={i} className={`${styles.badge} ${styles.member}`} style={{ margin: '1px 2px' }}>
                                                                            {ws.role}
                                                                        </span>
                                                                    ))
                                                                    : <span style={{ fontSize: 12, color: '#94A3B8' }}>Chưa có kho</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            {u.workspaces?.length > 0
                                                                ? u.workspaces.map((ws, i) => (
                                                                    <span key={i} className={styles.wsChip}>{ws.tenantName}</span>
                                                                ))
                                                                : <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                                        </td>
                                                        <td style={{ fontSize: 12, color: '#64748B' }}>
                                                            {formatDate(u.createdAt)}
                                                        </td>
                                                        <td>
                                                            {isSA ? (
                                                                <span style={{ fontSize: 12, color: '#94A3B8' }}>Được bảo vệ</span>
                                                            ) : (
                                                                <div className={styles.actionsCell}>
                                                                    {u.isActive ? (
                                                                        <button className={styles.btnWarning} onClick={() => openModal('deactivate', u)}>
                                                                            <StopOutlined /> Khóa
                                                                        </button>
                                                                    ) : (
                                                                        <button className={styles.btnSuccess} onClick={() => openModal('activate', u)}>
                                                                            <CheckCircleOutlined /> Kích hoạt
                                                                        </button>
                                                                    )}
                                                                    <button className={styles.btnDanger} onClick={() => openModal('deleteUser', u)}>
                                                                        <DeleteOutlined />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ SYSTEM MONITOR TAB ═══ */}
                    {activeTab === 'monitor' && (
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <span className={styles.sectionTitleIcon}><BarChartOutlined /></span>
                                    Giám sát Hệ thống
                                </h2>
                                <span style={{ fontSize: 12, color: '#94A3B8' }}>Cập nhật realtime</span>
                            </div>
                            <div className={styles.monitorGrid}>
                                <div className={styles.monitorCard}>
                                    <div className={styles.monitorLabel}>Tổng Workspace</div>
                                    <div className={styles.monitorValue}>{stats.totalTenants}</div>
                                    <div className={styles.monitorSub}>{stats.activeTenants} đang hoạt động</div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${styles.green}`}
                                            style={{ width: stats.totalTenants > 0 ? `${Math.round(stats.activeTenants / stats.totalTenants * 100)}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.monitorCard}>
                                    <div className={styles.monitorLabel}>Tổng Người dùng</div>
                                    <div className={styles.monitorValue}>{stats.totalUsers}</div>
                                    <div className={styles.monitorSub}>{stats.activeUsers} đang kích hoạt</div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill}`}
                                            style={{ width: stats.totalUsers > 0 ? `${Math.round(stats.activeUsers / stats.totalUsers * 100)}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.monitorCard}>
                                    <div className={styles.monitorLabel}>Kho bị khóa</div>
                                    <div className={styles.monitorValue} style={{ color: tenants.filter(t => t.status === 'LOCKED').length > 0 ? '#DC2626' : '#16A34A' }}>
                                        {tenants.filter(t => t.status === 'LOCKED').length}
                                    </div>
                                    <div className={styles.monitorSub}>Cần xem lại</div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${tenants.filter(t => t.status === 'LOCKED').length > 0 ? styles.red : styles.green}`}
                                            style={{ width: stats.totalTenants > 0 ? `${Math.round(tenants.filter(t => t.status === 'LOCKED').length / stats.totalTenants * 100)}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.monitorCard}>
                                    <div className={styles.monitorLabel}>Gói FREE</div>
                                    <div className={styles.monitorValue}>{tenants.filter(t => t.subscriptionPlan === 'FREE').length}</div>
                                    <div className={styles.monitorSub}>Kho đang dùng gói miễn phí</div>
                                </div>
                                <div className={styles.monitorCard}>
                                    <div className={styles.monitorLabel}>Gói PRO / ENTERPRISE</div>
                                    <div className={styles.monitorValue} style={{ color: '#7C3AED' }}>
                                        {tenants.filter(t => ['PRO', 'ENTERPRISE'].includes(t.subscriptionPlan)).length}
                                    </div>
                                    <div className={styles.monitorSub}>Khách hàng trả phí</div>
                                </div>
                                <div className={styles.monitorCard}>
                                    <div className={styles.monitorLabel}>Hết hạn &lt; 7 ngày</div>
                                    <div className={styles.monitorValue} style={{ color: tenants.filter(t => { const d = daysLeft(t.expiryDate); return d !== null && d < 7 && d >= 0; }).length > 0 ? '#D97706' : '#16A34A' }}>
                                        {tenants.filter(t => { const d = daysLeft(t.expiryDate); return d !== null && d < 7 && d >= 0; }).length}
                                    </div>
                                    <div className={styles.monitorSub}>Cần gia hạn sớm</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── CONFIRM MODAL ─── */}
            {modal && (
                <ConfirmModal
                    {...getModalProps()}
                    loading={actionLoading}
                    onConfirm={handleConfirm}
                    onCancel={closeModal}
                    extraInputValue={renewDays}
                    onExtraInput={setRenewDays}
                />
            )}
        </div>
    );
};

export default AdminDashboard;