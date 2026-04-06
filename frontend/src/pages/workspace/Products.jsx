import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    ShoppingOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, LoadingOutlined, WarningOutlined, SearchOutlined,
    BarcodeOutlined, CheckCircleOutlined, SwapOutlined, InboxOutlined,
} from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import pageStyles from './WorkspacePage.module.css';
import s from './Personnel.module.css';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtVnd = (n) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';
const fmtNum = (n) => n != null ? n.toLocaleString('vi-VN') : '—';
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.3px' };
const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
    fontSize: 13, color: '#0F172A', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
};

// ─── STOCK LEVEL BADGE ─────────────────────────────────────────────────────────
const StockBadge = ({ current, min }) => {
    if (current == null) return <span style={{ color: '#94A3B8' }}>—</span>;
    const low = min != null && current <= min;
    const empty = current === 0;
    if (empty) return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>Hết hàng</span>;
    if (low)   return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>Sắp hết ({current})</span>;
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: '#DCFCE7', color: '#16A34A' }}>{fmtNum(current)}</span>;
};

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
const ProductModal = ({ initial, onSave, onClose, saving }) => {
    const [form, setForm] = useState({
        productCode: initial?.productCode || '',
        productName: initial?.productName || '',
        category: initial?.category || '',
        description: initial?.description || '',
        price: initial?.price || '',
        cost: initial?.cost || '',
        mainUnit: initial?.mainUnit || '',
        minStock: initial?.minStock || '',
        maxStock: initial?.maxStock || '',
        supplier: initial?.supplier || '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto'
        }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 560, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', margin: 'auto' }}
                onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
                    {initial ? '✏️ Chỉnh sửa sản phẩm' : '📦 Thêm sản phẩm mới'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Mã SKU *</label>
                        <input style={inputStyle} placeholder="SP-001, SKU123..." value={form.productCode} onChange={e => set('productCode', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Đơn vị chính *</label>
                        <input style={inputStyle} placeholder="Chai, Thùng, Cái..." value={form.mainUnit} onChange={e => set('mainUnit', e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Tên sản phẩm *</label>
                    <input style={inputStyle} placeholder="Tên đầy đủ sản phẩm..." value={form.productName} onChange={e => set('productName', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Danh mục</label>
                        <input style={inputStyle} placeholder="Đồ uống, Bánh kẹo..." value={form.category} onChange={e => set('category', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Nhà cung cấp</label>
                        <input style={inputStyle} placeholder="Tên NCC..." value={form.supplier} onChange={e => set('supplier', e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Giá bán (VNĐ)</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" value={form.price} onChange={e => set('price', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Giá vốn (VNĐ)</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" value={form.cost} onChange={e => set('cost', e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Tồn tối thiểu</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Tồn tối đa</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" value={form.maxStock} onChange={e => set('maxStock', e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Mô tả</label>
                    <input style={inputStyle} placeholder="Ghi chú thêm..." value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                    <button className={s.btnGhost} onClick={onClose} disabled={saving}>Hủy</button>
                    <button className={s.btnPrimary}
                        disabled={saving || !form.productCode.trim() || !form.productName.trim() || !form.mainUnit.trim()}
                        onClick={() => onSave(form)}>
                        {saving ? <LoadingOutlined spin /> : <CheckCircleOutlined />}
                        {initial ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Products = () => {
    const { workspaceId } = useParams();
    const { isWorkspaceManager } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
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
                `/v1/products`,
                { headers: { 'X-Workspace-Id': workspaceId } }
            );
            const data = res.data?.data || res.data || [];
            setProducts(Array.isArray(data) ? data : []);
            setIsDemo(false);
        } catch (e) {
            if (e.response?.status === 404 || e.response?.status === 405) {
                setProducts(DEMO_PRODUCTS);
                setIsDemo(true);
            } else {
                setError('Không thể tải sản phẩm: ' + (e.response?.data?.message || e.message));
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
                price: form.price ? parseFloat(form.price) : null,
                cost: form.cost ? parseFloat(form.cost) : null,
                minStock: form.minStock ? parseInt(form.minStock) : null,
                maxStock: form.maxStock ? parseInt(form.maxStock) : null,
                tenantId: workspaceId,
            };
            if (editTarget) {
                await axiosClient.put(`/v1/products/${editTarget.id}`, payload, { headers: { 'X-Workspace-Id': workspaceId } });
            } else {
                await axiosClient.post(`/v1/products`, payload, { headers: { 'X-Workspace-Id': workspaceId } });
            }
            setShowModal(false); setEditTarget(null);
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Xóa sản phẩm "${p.productName}"?`)) return;
        try {
            await axiosClient.delete(`/v1/products/${p.id}`, { headers: { 'X-Workspace-Id': workspaceId } });
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi xóa sản phẩm');
        }
    };

    // ── Filter ─────────────────────────────────────────────────
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const mQ = !q || p.productName?.toLowerCase().includes(q) || p.productCode?.toLowerCase().includes(q) || p.supplier?.toLowerCase().includes(q);
        const mC = !filterCategory || p.category === filterCategory;
        return mQ && mC;
    });

    // ── Stats ─────────────────────────────────────────────────────
    const lowStock = products.filter(p => p.minStock != null && p.currentStock != null && p.currentStock <= p.minStock).length;
    const outOfStock = products.filter(p => p.currentStock === 0).length;

    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>
                        <ShoppingOutlined /> Sản phẩm
                    </h1>
                    <p className={pageStyles.pageSubtitle}>
                        {isDemo && <span style={{ color: '#D97706', fontWeight: 600, marginRight: 8 }}>🎭 Demo —</span>}
                        {products.length} sản phẩm
                        {lowStock > 0 && <span style={{ color: '#D97706', marginLeft: 8 }}>· ⚠️ {lowStock} sắp hết</span>}
                        {outOfStock > 0 && <span style={{ color: '#DC2626', marginLeft: 8 }}>· 🔴 {outOfStock} hết hàng</span>}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={s.btnGhost} onClick={load} disabled={loading}>
                        <ReloadOutlined spin={loading} /> Làm mới
                    </button>
                    {canManage && (
                        <button className={s.btnPrimary} onClick={() => { setEditTarget(null); setShowModal(true); }}>
                            <PlusOutlined /> Thêm sản phẩm
                        </button>
                    )}
                </div>
            </div>

            {/* STATS */}
            <div className={pageStyles.statGrid}>
                <div className={pageStyles.statCard}>
                    <div className={`${pageStyles.statIcon} ${pageStyles.orange}`}><ShoppingOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Tổng sản phẩm</span>
                        <span className={pageStyles.statValue}>{products.length}</span>
                    </div>
                </div>
                <div className={pageStyles.statCard}>
                    <div className={`${pageStyles.statIcon} ${pageStyles.blue}`}><BarcodeOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Danh mục</span>
                        <span className={pageStyles.statValue}>{categories.length}</span>
                    </div>
                </div>
                <div className={pageStyles.statCard}>
                    <div className={pageStyles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}><InboxOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Sắp hết hàng</span>
                        <span className={pageStyles.statValue} style={{ color: lowStock > 0 ? '#D97706' : '#16A34A' }}>{lowStock}</span>
                    </div>
                </div>
                <div className={pageStyles.statCard}>
                    <div className={pageStyles.statIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><WarningOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Hết hàng</span>
                        <span className={pageStyles.statValue} style={{ color: outOfStock > 0 ? '#DC2626' : '#16A34A' }}>{outOfStock}</span>
                    </div>
                </div>
            </div>

            {/* FILTER */}
            <div className={s.card} style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <SearchOutlined style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
                    <input style={{ ...inputStyle, paddingLeft: 32 }}
                        placeholder="Tìm theo tên, SKU, nhà cung cấp..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', background: '#fff', fontFamily: 'inherit' }}
                    value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* ERROR */}
            {error && <div className={s.errorBox}><WarningOutlined /> {error}</div>}

            {/* LOADING */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60, gap: 10, color: '#64748B' }}>
                    <LoadingOutlined style={{ fontSize: 24, color: '#F97316' }} spin />
                    <span>Đang tải sản phẩm...</span>
                </div>
            )}

            {/* TABLE */}
            {!loading && (
                filtered.length === 0 ? (
                    <div className={pageStyles.placeholderCard}>
                        <div className={pageStyles.placeholderIcon}><ShoppingOutlined /></div>
                        <h3 className={pageStyles.placeholderTitle}>Chưa có sản phẩm nào</h3>
                        <p className={pageStyles.placeholderText}>
                            {canManage ? 'Bấm "Thêm sản phẩm" để bắt đầu quản lý danh mục.' : 'Chưa có dữ liệu sản phẩm.'}
                        </p>
                    </div>
                ) : (
                    <div className={s.card} style={{ padding: 0, overflow: 'hidden' }}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    {['Sản phẩm', 'SKU', 'Danh mục', 'Tồn kho', 'Giá bán', 'Giá vốn', 'Đơn vị', 'NCC', canManage ? '' : null]
                                        .filter(Boolean).map(h => (
                                            <th key={h} className={s.th}>{h}</th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => (
                                    <tr key={p.id} className={i % 2 === 0 ? s.trEven : s.trOdd}>
                                        <td className={s.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: 10,
                                                    background: 'linear-gradient(135deg,#FFF7ED,#FED7AA)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#EA580C', fontSize: 16, flexShrink: 0
                                                }}>📦</div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>{p.productName}</div>
                                                    {p.description && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{p.description}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={s.td} style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
                                            <BarcodeOutlined style={{ marginRight: 4, fontSize: 12 }} />
                                            {p.productCode || '—'}
                                        </td>
                                        <td className={s.td}>
                                            {p.category
                                                ? <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#EFF6FF', color: '#2563EB' }}>{p.category}</span>
                                                : <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>}
                                        </td>
                                        <td className={s.td}>
                                            <StockBadge current={p.currentStock} min={p.minStock} />
                                        </td>
                                        <td className={s.td} style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{fmtVnd(p.price)}</td>
                                        <td className={s.td} style={{ fontSize: 13, color: '#64748B' }}>{fmtVnd(p.cost)}</td>
                                        <td className={s.td} style={{ fontSize: 12, color: '#475569' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <SwapOutlined style={{ fontSize: 11 }} />
                                                {p.mainUnit || '—'}
                                            </div>
                                        </td>
                                        <td className={s.td} style={{ fontSize: 12, color: '#64748B' }}>{p.supplier || '—'}</td>
                                        {canManage && (
                                            <td className={s.td} style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                    <button className={s.btnGhost} style={{ padding: '5px 10px' }}
                                                        onClick={() => { setEditTarget(p); setShowModal(true); }}>
                                                        <EditOutlined />
                                                    </button>
                                                    <button className={s.btnDanger} style={{ padding: '5px 10px' }}
                                                        onClick={() => handleDelete(p)}>
                                                        <DeleteOutlined />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* MODAL */}
            {showModal && (
                <ProductModal
                    initial={editTarget}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditTarget(null); }}
                    saving={saving}
                />
            )}
        </div>
    );
};

// ─── DEMO DATA ─────────────────────────────────────────────────────────────────
const DEMO_PRODUCTS = [
    { id: '1', productCode: 'BIA-330', productName: 'Bia lon 330ml', category: 'Đồ uống', price: 18000, cost: 12000, mainUnit: 'Lon', currentStock: 500, minStock: 50, supplier: 'Sabeco' },
    { id: '2', productCode: 'NUOC-500', productName: 'Nước suối chai 500ml', category: 'Đồ uống', price: 6000, cost: 3500, mainUnit: 'Chai', currentStock: 20, minStock: 100, supplier: 'Lavie' },
    { id: '3', productCode: 'BANH-1', productName: 'Bánh quy bơ hộp', category: 'Bánh kẹo', price: 45000, cost: 30000, mainUnit: 'Hộp', currentStock: 0, minStock: 20, supplier: 'Kinh Đô' },
    { id: '4', productCode: 'CF-100', productName: 'Cà phê hòa tan G7', category: 'Đồ uống', price: 65000, cost: 45000, mainUnit: 'Hộp', currentStock: 150, minStock: 30, supplier: 'Trung Nguyên' },
];

export default Products;
