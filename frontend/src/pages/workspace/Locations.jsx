import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    ContainerOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, LoadingOutlined, WarningOutlined, CheckCircleOutlined,
    SearchOutlined, EnvironmentOutlined, InboxOutlined,
} from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import pageStyles from './WorkspacePage.module.css';
import s from './Personnel.module.css';

/**
 * Location type config — khớp với model Location.java
 * type: DISPLAY, STORAGE, REPAIR, STAGING, INSPECTION
 */
const LOCATION_TYPES = [
    { value: 'STORAGE',    label: 'Kho chính',    color: '#2563EB', bg: '#EFF6FF', emoji: '📦' },
    { value: 'DISPLAY',    label: 'Khu trưng bày', color: '#7C3AED', bg: '#EDE9FE', emoji: '🏪' },
    { value: 'STAGING',    label: 'Khu tập hợp',  color: '#0891B2', bg: '#ECFEFF', emoji: '🔄' },
    { value: 'INSPECTION', label: 'Kiểm tra',      color: '#D97706', bg: '#FEF3C7', emoji: '🔍' },
    { value: 'REPAIR',     label: 'Sửa chữa',      color: '#DC2626', bg: '#FEE2E2', emoji: '🔧' },
];

const getTypeCfg = (type) => LOCATION_TYPES.find(t => t.value === type)
    || { value: type, label: type, color: '#64748B', bg: '#F8FAFC', emoji: '📍' };

// ─── LOCATION FORM MODAL ──────────────────────────────────────────────────────
const LocationModal = ({ initial, onSave, onClose, saving }) => {
    const [form, setForm] = useState({
        name: initial?.name || '',
        code: initial?.code || '',
        type: initial?.type || 'STORAGE',
        capacity: initial?.capacity || '',
        description: initial?.description || '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
                    {initial ? '✏️ Chỉnh sửa vị trí' : '📍 Thêm vị trí mới'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Tên vị trí *</label>
                        <input style={inputStyle} placeholder="VD: Kho A, Kệ 01..." value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Mã vị trí</label>
                        <input style={inputStyle} placeholder="VD: KHO-A, KE-01..." value={form.code} onChange={e => set('code', e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Loại vị trí *</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {LOCATION_TYPES.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => set('type', t.value)}
                                style={{
                                    padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
                                    borderColor: form.type === t.value ? t.color : '#E2E8F0',
                                    background: form.type === t.value ? t.bg : '#FAFAFA',
                                    color: form.type === t.value ? t.color : '#64748B',
                                    fontWeight: form.type === t.value ? 700 : 500,
                                    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                                    fontFamily: 'inherit'
                                }}
                            >
                                {t.emoji} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Sức chứa (units)</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0 = không giới hạn" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Mô tả</label>
                        <input style={inputStyle} placeholder="Ghi chú thêm..." value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                    <button className={s.btnGhost} onClick={onClose} disabled={saving}>Hủy</button>
                    <button className={s.btnPrimary} onClick={() => onSave(form)} disabled={saving || !form.name.trim()}>
                        {saving ? <LoadingOutlined spin /> : <CheckCircleOutlined />}
                        {initial ? 'Lưu thay đổi' : 'Thêm vị trí'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.3px' };
const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
    fontSize: 13, color: '#0F172A', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s'
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Locations = () => {
    const { workspaceId } = useParams();
    const { isWorkspaceManager } = useAuth();

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    const canManage = isWorkspaceManager();

    // ── Fetch ────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await axiosClient.get(
                `/v1/locations`,
                { headers: { 'X-Workspace-Id': workspaceId } }
            );
            const data = res.data?.data || res.data || [];
            setLocations(Array.isArray(data) ? data : []);
            setIsDemo(false);
        } catch (e) {
            if (e.response?.status === 404 || e.response?.status === 405) {
                setLocations(DEMO_LOCATIONS);
                setIsDemo(true);
            } else {
                setError('Không thể tải vị trí: ' + (e.response?.data?.message || e.message));
            }
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => { load(); }, [load]);

    // ── CRUD ─────────────────────────────────────────────────────
    const handleSave = async (form) => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                capacity: form.capacity ? parseInt(form.capacity) : null,
                tenantId: workspaceId,
            };
            if (editTarget) {
                await axiosClient.put(`/v1/locations/${editTarget.id}`, payload, { headers: { 'X-Workspace-Id': workspaceId } });
            } else {
                await axiosClient.post(`/v1/locations`, payload, { headers: { 'X-Workspace-Id': workspaceId } });
            }
            setShowModal(false);
            setEditTarget(null);
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi lưu vị trí');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (loc) => {
        if (!window.confirm(`Xóa vị trí "${loc.name}"?`)) return;
        try {
            await axiosClient.delete(`/v1/locations/${loc.id}`, { headers: { 'X-Workspace-Id': workspaceId } });
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi xóa vị trí');
        }
    };

    // ── Filter ───────────────────────────────────────────────────
    const filtered = locations.filter(loc => {
        const q = search.toLowerCase();
        const matchQ = !q || loc.name?.toLowerCase().includes(q) || loc.code?.toLowerCase().includes(q);
        const matchType = !filterType || loc.type === filterType;
        return matchQ && matchType;
    });

    // ── Stats ─────────────────────────────────────────────────────
    const totalCapacity = locations.reduce((s, l) => s + (l.capacity || 0), 0);
    const totalUsed = locations.reduce((s, l) => s + (l.currentCount || 0), 0);

    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>
                        <ContainerOutlined /> Kho & Vị trí
                    </h1>
                    <p className={pageStyles.pageSubtitle}>
                        {isDemo && <span style={{ color: '#D97706', fontWeight: 600, marginRight: 8 }}>🎭 Demo —</span>}
                        {locations.length} vị trí · Sức chứa: {totalUsed}/{totalCapacity || '∞'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={s.btnGhost} onClick={load} disabled={loading}>
                        <ReloadOutlined spin={loading} /> Làm mới
                    </button>
                    {canManage && (
                        <button className={s.btnPrimary} onClick={() => { setEditTarget(null); setShowModal(true); }}>
                            <PlusOutlined /> Thêm vị trí
                        </button>
                    )}
                </div>
            </div>

            {/* STATS */}
            <div className={pageStyles.statGrid}>
                <div className={pageStyles.statCard}>
                    <div className={`${pageStyles.statIcon} ${pageStyles.orange}`}><ContainerOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Tổng vị trí</span>
                        <span className={pageStyles.statValue}>{locations.length}</span>
                    </div>
                </div>
                {LOCATION_TYPES.slice(0, 3).map(t => (
                    <div key={t.value} className={pageStyles.statCard}>
                        <div className={pageStyles.statIcon} style={{ background: t.bg, color: t.color, fontSize: 20 }}>
                            {t.emoji}
                        </div>
                        <div className={pageStyles.statInfo}>
                            <span className={pageStyles.statLabel}>{t.label}</span>
                            <span className={pageStyles.statValue}>
                                {locations.filter(l => l.type === t.value).length}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTER BAR */}
            <div className={s.card} style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <SearchOutlined style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
                    <input
                        style={{ ...inputStyle, paddingLeft: 32 }}
                        placeholder="Tìm theo tên, mã vị trí..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select style={{ padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', background: '#fff', fontFamily: 'inherit' }}
                    value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">Tất cả loại</option>
                    {LOCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {/* ERROR */}
            {error && <div className={s.errorBox}><WarningOutlined /> {error}</div>}

            {/* LOADING */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60, gap: 10, color: '#64748B' }}>
                    <LoadingOutlined style={{ fontSize: 24, color: '#F97316' }} spin />
                    <span>Đang tải...</span>
                </div>
            )}

            {/* GRID */}
            {!loading && (
                filtered.length === 0 ? (
                    <div className={pageStyles.placeholderCard}>
                        <div className={pageStyles.placeholderIcon}><EnvironmentOutlined /></div>
                        <h3 className={pageStyles.placeholderTitle}>Chưa có vị trí nào</h3>
                        <p className={pageStyles.placeholderText}>
                            {canManage ? 'Bấm "Thêm vị trí" để tạo cấu trúc kho hàng.' : 'Chưa có dữ liệu vị trí trong kho này.'}
                        </p>
                    </div>
                ) : (
                    <div className={s.card} style={{ padding: 0, overflow: 'hidden' }}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    {['Tên vị trí', 'Mã', 'Loại', 'Sức chứa', 'Đang dùng', 'Tỷ lệ', 'Trạng thái', canManage ? '' : null]
                                        .filter(Boolean).map(h => (
                                            <th key={h} className={s.th}>{h}</th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((loc, i) => {
                                    const cfg = getTypeCfg(loc.type);
                                    const pct = loc.capacity ? Math.min(100, Math.round((loc.currentCount || 0) / loc.capacity * 100)) : null;
                                    const barColor = pct === null ? '#6366F1' : pct >= 90 ? '#DC2626' : pct >= 70 ? '#D97706' : '#16A34A';
                                    return (
                                        <tr key={loc.id} className={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td className={s.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 34, height: 34, borderRadius: 10, background: cfg.bg,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 16, flexShrink: 0
                                                    }}>
                                                        {cfg.emoji}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>{loc.name}</div>
                                                        {loc.description && <div style={{ fontSize: 11, color: '#94A3B8' }}>{loc.description}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={s.td} style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{loc.code || '—'}</td>
                                            <td className={s.td}>
                                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg }}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className={s.td} style={{ fontSize: 13, color: '#475569' }}>
                                                {loc.capacity ? `${loc.capacity.toLocaleString('vi-VN')}` : '∞'}
                                            </td>
                                            <td className={s.td} style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
                                                {(loc.currentCount || 0).toLocaleString('vi-VN')}
                                            </td>
                                            <td className={s.td} style={{ minWidth: 100 }}>
                                                {pct !== null ? (
                                                    <div>
                                                        <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
                                                        </div>
                                                        <div style={{ fontSize: 10, color: barColor, fontWeight: 600, marginTop: 2 }}>{pct}%</div>
                                                    </div>
                                                ) : <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>}
                                            </td>
                                            <td className={s.td}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                                                    background: loc.isActive !== false ? '#DCFCE7' : '#FEE2E2',
                                                    color: loc.isActive !== false ? '#16A34A' : '#DC2626'
                                                }}>
                                                    {loc.isActive !== false ? 'Hoạt động' : 'Tắt'}
                                                </span>
                                            </td>
                                            {canManage && (
                                                <td className={s.td} style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                        <button className={s.btnGhost} style={{ padding: '5px 10px' }}
                                                            onClick={() => { setEditTarget(loc); setShowModal(true); }}>
                                                            <EditOutlined />
                                                        </button>
                                                        <button className={s.btnDanger} style={{ padding: '5px 10px' }}
                                                            onClick={() => handleDelete(loc)}>
                                                            <DeleteOutlined />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* MODAL */}
            {showModal && (
                <LocationModal
                    initial={editTarget}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditTarget(null); }}
                    saving={saving}
                />
            )}
        </div>
    );
};

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_LOCATIONS = [
    { id: '1', name: 'Kho trung tâm', code: 'KHO-A', type: 'STORAGE', capacity: 1000, currentCount: 750, isActive: true, description: 'Kho chính' },
    { id: '2', name: 'Khu trưng bày', code: 'DISPLAY-01', type: 'DISPLAY', capacity: 200, currentCount: 120, isActive: true },
    { id: '3', name: 'Khu tập hợp', code: 'STAGE-01', type: 'STAGING', capacity: 300, currentCount: 45, isActive: true },
    { id: '4', name: 'Khu kiểm tra chất lượng', code: 'QC-01', type: 'INSPECTION', capacity: 100, currentCount: 30, isActive: true },
];

export default Locations;
