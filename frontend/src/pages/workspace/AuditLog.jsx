import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    AuditOutlined, SearchOutlined, ReloadOutlined, FilterOutlined,
    LoadingOutlined, WarningOutlined, UserOutlined, ClockCircleOutlined,
    CalendarOutlined, DownloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import pageStyles from './WorkspacePage.module.css';
import s from './Personnel.module.css';

// ─── ACTION TYPE LABELS ────────────────────────────────────────────────────────
const ACTION_CONFIG = {
    CREATE: { label: 'Tạo mới', color: '#16A34A', bg: '#DCFCE7' },
    UPDATE: { label: 'Cập nhật', color: '#2563EB', bg: '#EFF6FF' },
    DELETE: { label: 'Xóa', color: '#DC2626', bg: '#FEE2E2' },
    APPROVE: { label: 'Phê duyệt', color: '#7C3AED', bg: '#EDE9FE' },
    REJECT: { label: 'Từ chối', color: '#D97706', bg: '#FEF3C7' },
    LOGIN: { label: 'Đăng nhập', color: '#0891B2', bg: '#ECFEFF' },
    INVITE: { label: 'Mời', color: '#16A34A', bg: '#DCFCE7' },
    REMOVE: { label: 'Xóa thành viên', color: '#DC2626', bg: '#FEE2E2' },
};

// ─── ENTITY TYPE LABELS ────────────────────────────────────────────────────────
const ENTITY_LABELS = {
    PRODUCT: 'Sản phẩm',
    VOUCHER: 'Phiếu kho',
    STOCKTAKE: 'Kiểm kê',
    MEMBER: 'Thành viên',
    WORKSPACE: 'Kho',
    INVITATION: 'Lời mời',
};

/**
 * AuditLog.jsx — Full Audit Log Viewer cho Workspace OWNER.
 * Hiển thị toàn bộ lịch sử thao tác, filter theo actor/action/date.
 * Kết nối: GET /api/v1/manager/audit-log?workspaceId={id}&...
 * Fallback: Nếu API chưa có → hiển thị mock data + badge "Demo"
 */
const AuditLog = () => {
    const { workspaceId } = useParams();
    const { currentWorkspace } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDemo, setIsDemo] = useState(false);

    // Filter state
    const [searchActor, setSearchActor] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterEntity, setFilterEntity] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Detail modal
    const [selectedLog, setSelectedLog] = useState(null);

    // ── Fetch logs ────────────────────────────────────────────────
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (filterAction) params.action = filterAction;
            if (filterEntity) params.entityType = filterEntity;
            if (dateFrom) params.from = dateFrom;
            if (dateTo) params.to = dateTo;

            const res = await axiosClient.get(
                `/v1/manager/audit-log`,
                {
                    headers: { 'X-Workspace-Id': workspaceId },
                    params,
                }
            );
            const data = res.data?.data || res.data || [];
            setLogs(Array.isArray(data) ? data : []);
            setIsDemo(false);
        } catch (e) {
            // Nếu API chưa có (404/500) → dùng demo data
            if (e.response?.status === 404 || e.response?.status === 405) {
                setLogs(DEMO_LOGS);
                setIsDemo(true);
            } else {
                setError('Không thể tải audit log: ' + (e.response?.data?.message || e.message));
            }
        } finally {
            setLoading(false);
        }
    }, [workspaceId, filterAction, filterEntity, dateFrom, dateTo]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // ── Filter by actor name (client side) ───────────────────────
    const filtered = logs.filter(log => {
        if (!searchActor) return true;
        const q = searchActor.toLowerCase();
        return (
            log.actorName?.toLowerCase().includes(q) ||
            log.actorEmail?.toLowerCase().includes(q)
        );
    });

    // ── Export CSV ────────────────────────────────────────────────
    const exportCsv = () => {
        const rows = [
            ['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Chi tiết'],
            ...filtered.map(l => [
                new Date(l.timestamp || l.createdAt).toLocaleString('vi-VN'),
                l.actorName || l.actorEmail || '—',
                l.action || '—',
                l.entityType || '—',
                l.description || '',
            ])
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${workspaceId}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Helpers ──────────────────────────────────────────────────
    const getActionCfg = (action) => ACTION_CONFIG[action] || { label: action, color: '#64748B', bg: '#F1F5F9' };
    const fmtTime = (ts) => ts ? new Date(ts).toLocaleString('vi-VN') : '—';
    const initials = (name, email) => ((name || email || '?')[0]).toUpperCase();

    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>
                        <AuditOutlined /> Nhật ký hệ thống
                    </h1>
                    <p className={pageStyles.pageSubtitle}>
                        {isDemo && <span style={{ color: '#D97706', fontWeight: 600, marginRight: 8 }}>🎭 Demo data —</span>}
                        Lịch sử thao tác của mọi thành viên trong kho · {filtered.length} bản ghi
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={s.btnGhost} onClick={fetchLogs} disabled={loading}>
                        <ReloadOutlined spin={loading} /> Làm mới
                    </button>
                    <button className={s.btnPrimary} onClick={exportCsv} disabled={filtered.length === 0}>
                        <DownloadOutlined /> Xuất CSV
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className={s.card} style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <FilterOutlined style={{ color: '#94A3B8' }} />
                <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                    <SearchOutlined style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
                    <input
                        style={{ width: '100%', paddingLeft: 32, paddingRight: 12, height: 36, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        placeholder="Tìm theo tên, email người thực hiện..."
                        value={searchActor}
                        onChange={e => setSearchActor(e.target.value)}
                    />
                </div>
                <select
                    style={{ padding: '0 12px', height: 36, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', background: '#fff', fontFamily: 'inherit' }}
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                >
                    <option value="">Tất cả hành động</option>
                    {Object.entries(ACTION_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
                <select
                    style={{ padding: '0 12px', height: 36, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', background: '#fff', fontFamily: 'inherit' }}
                    value={filterEntity}
                    onChange={e => setFilterEntity(e.target.value)}
                >
                    <option value="">Tất cả đối tượng</option>
                    {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ padding: '0 10px', height: 36, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', fontFamily: 'inherit' }} />
                <span style={{ fontSize: 12, color: '#94A3B8' }}>đến</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ padding: '0 10px', height: 36, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', fontFamily: 'inherit' }} />
            </div>

            {/* ERROR */}
            {error && !isDemo && (
                <div className={s.errorBox}><WarningOutlined /> {error}</div>
            )}

            {/* LOADING */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#94A3B8', gap: 10 }}>
                    <LoadingOutlined style={{ fontSize: 24, color: '#F97316' }} spin />
                    <span>Đang tải nhật ký...</span>
                </div>
            )}

            {/* TABLE */}
            {!loading && (
                <div className={s.card}>
                    {filtered.length === 0 ? (
                        <div className={pageStyles.placeholderCard} style={{ minHeight: 280 }}>
                            <div className={pageStyles.placeholderIcon}><AuditOutlined /></div>
                            <h3 className={pageStyles.placeholderTitle}>Không có bản ghi nào</h3>
                            <p className={pageStyles.placeholderText}>Thử thay đổi bộ lọc để xem kết quả khác.</p>
                        </div>
                    ) : (
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    {['Thời gian', 'Người thực hiện', 'Hành động', 'Đối tượng', 'Mô tả', ''].map(h => (
                                        <th key={h} className={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((log, i) => {
                                    const cfg = getActionCfg(log.action);
                                    return (
                                        <tr key={log.id || i} className={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td className={s.td} style={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                {fmtTime(log.timestamp || log.createdAt)}
                                            </td>
                                            <td className={s.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: 8,
                                                        background: 'linear-gradient(135deg,#F97316,#F59E0B)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0
                                                    }}>
                                                        {initials(log.actorName, log.actorEmail)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>
                                                            {log.actorName || 'Ẩn danh'}
                                                        </div>
                                                        {log.actorEmail && (
                                                            <div style={{ fontSize: 11, color: '#94A3B8' }}>{log.actorEmail}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={s.td}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 20, fontSize: 12,
                                                    fontWeight: 600, color: cfg.color, background: cfg.bg
                                                }}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className={s.td}>
                                                <span style={{ fontSize: 12, color: '#475569' }}>
                                                    {ENTITY_LABELS[log.entityType] || log.entityType || '—'}
                                                </span>
                                            </td>
                                            <td className={s.td} style={{ maxWidth: 300 }}>
                                                <span style={{ fontSize: 13, color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {log.description || log.message || '—'}
                                                </span>
                                            </td>
                                            <td className={s.td} style={{ textAlign: 'right' }}>
                                                {(log.before || log.after) && (
                                                    <button
                                                        className={s.btnGhost}
                                                        style={{ padding: '4px 10px', fontSize: 12 }}
                                                        onClick={() => setSelectedLog(log)}
                                                        title="Xem chi tiết thay đổi"
                                                    >
                                                        <EyeOutlined />
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

            {/* DIFF DETAIL MODAL */}
            {selectedLog && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
                    backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 20
                }}
                    onClick={() => setSelectedLog(null)}
                >
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 600, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                            Chi tiết thay đổi
                        </h3>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
                            {selectedLog.actorName || selectedLog.actorEmail} · {fmtTime(selectedLog.timestamp || selectedLog.createdAt)}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 6, textTransform: 'uppercase' }}>Trước</div>
                                <pre style={{ background: '#FEF2F2', padding: 12, borderRadius: 8, fontSize: 12, color: '#7F1D1D', overflowX: 'auto', margin: 0 }}>
                                    {selectedLog.before ? JSON.stringify(selectedLog.before, null, 2) : 'Không có'}
                                </pre>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginBottom: 6, textTransform: 'uppercase' }}>Sau</div>
                                <pre style={{ background: '#F0FDF4', padding: 12, borderRadius: 8, fontSize: 12, color: '#14532D', overflowX: 'auto', margin: 0 }}>
                                    {selectedLog.after ? JSON.stringify(selectedLog.after, null, 2) : 'Không có'}
                                </pre>
                            </div>
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                            <button className={s.btnGhost} onClick={() => setSelectedLog(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── DEMO DATA (khi API chưa ready) ──────────────────────────────────────────
const DEMO_LOGS = [
    {
        id: '1', timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        actorName: 'Nguyễn Văn A', actorEmail: 'a@example.com',
        action: 'CREATE', entityType: 'VOUCHER',
        description: 'Tạo phiếu nhập kho PN-001 với 5 sản phẩm',
        before: null, after: { voucherCode: 'PN-001', status: 'PENDING' }
    },
    {
        id: '2', timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        actorName: 'Trần Thị B', actorEmail: 'b@example.com',
        action: 'UPDATE', entityType: 'PRODUCT',
        description: 'Cập nhật giá bán sản phẩm "Bia lon 330ml" từ 15,000đ → 18,000đ',
        before: { price: 15000 }, after: { price: 18000 }
    },
    {
        id: '3', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        actorName: 'Lê Văn C', actorEmail: 'c@example.com',
        action: 'INVITE', entityType: 'MEMBER',
        description: 'Gửi lời mời tham gia kho tới d@example.com với vai trò STAFF',
        before: null, after: null
    },
    {
        id: '4', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
        actorName: 'Nguyễn Văn A', actorEmail: 'a@example.com',
        action: 'APPROVE', entityType: 'STOCKTAKE',
        description: 'Phê duyệt phiếu kiểm kê KK-003, chênh lệch tồn kho đã được điều chỉnh',
        before: { status: 'PENDING_APPROVAL' }, after: { status: 'APPROVED' }
    },
    {
        id: '5', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        actorName: 'Trần Thị B', actorEmail: 'b@example.com',
        action: 'DELETE', entityType: 'PRODUCT',
        description: 'Xóa sản phẩm "Nước suối chai nhỏ" khỏi danh mục',
        before: { productName: 'Nước suối chai nhỏ', isActive: true }, after: { isActive: false }
    },
];

export default AuditLog;
