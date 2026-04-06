import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AppstoreOutlined, ShoppingOutlined, InboxOutlined, DollarOutlined,
    SwapOutlined, RiseOutlined, ReloadOutlined, LoadingOutlined,
    WarningOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined,
    ArrowUpOutlined, ArrowDownOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import pageStyles from './WorkspacePage.module.css';

/**
 * Overview.jsx — Executive Dashboard.
 * Hiển thị: Stats cards (tổng hàng, tồn kho, phiếu hôm nay, giá trị)
 *            + Quick Actions + Recent vouchers
 * API: /api/v1/manager/vouchers (X-Workspace-Id)
 *      /api/v1/products (X-Workspace-Id)
 */
const Overview = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { currentWorkspace, getWorkspaceRole, isWorkspaceManager, isWorkspaceAccountant } = useAuth();
    const role = getWorkspaceRole();

    const [vouchers, setVouchers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [vRes, pRes] = await Promise.allSettled([
                axiosClient.get('/v1/manager/vouchers', { headers: { 'X-Workspace-Id': workspaceId } }),
                axiosClient.get('/v1/products', { headers: { 'X-Workspace-Id': workspaceId } }),
            ]);
            if (vRes.status === 'fulfilled') {
                const vData = vRes.value.data?.data || vRes.value.data || [];
                setVouchers(Array.isArray(vData) ? vData : []);
            }
            if (pRes.status === 'fulfilled') {
                const pData = pRes.value.data?.data || pRes.value.data || [];
                setProducts(Array.isArray(pData) ? pData : []);
            }
        } catch (_) { }
        finally { setLoading(false); }
    }, [workspaceId]);

    useEffect(() => { load(); }, [load]);

    // ── Computed stats ────────────────────────────────────────────
    const today = new Date().toDateString();
    const todayVouchers = vouchers.filter(v => v.createdAt && new Date(v.createdAt).toDateString() === today);
    const pending = vouchers.filter(v => v.status === 'PENDING');
    const processing = vouchers.filter(v => v.status === 'PROCESSING');
    const totalStock = products.reduce((s, p) => s + (p.currentStock || 0), 0);
    const totalValue = products.reduce((s, p) => s + (p.currentStock || 0) * (p.cost || 0), 0);
    const lowStockProducts = products.filter(p => p.minStock != null && p.currentStock != null && p.currentStock <= p.minStock && p.currentStock > 0);
    const outOfStock = products.filter(p => p.currentStock === 0);
    const inbound = todayVouchers.filter(v => v.type === 'INBOUND').length;
    const outbound = todayVouchers.filter(v => v.type === 'OUTBOUND').length;

    const fmtVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n);
    const fmtNum = (n) => n.toLocaleString('vi-VN');
    const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—';

    const voucherTypeLabel = { INBOUND: 'Nhập kho', OUTBOUND: 'Xuất kho', TRANSFER: 'Điều chuyển' };
    const voucherStatusCfg = {
        PENDING: { label: 'Chờ xử lý', bg: '#FEF3C7', color: '#D97706' },
        PROCESSING: { label: 'Đang xử lý', bg: '#EFF6FF', color: '#2563EB' },
        COMPLETED: { label: 'Hoàn tất', bg: '#DCFCE7', color: '#16A34A' },
        CANCELLED: { label: 'Đã hủy', bg: '#F1F5F9', color: '#64748B' },
    };

    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>
                        Xin chào, <span style={{ color: '#F97316' }}>{currentWorkspace?.name}</span> 👋
                    </h1>
                    <p className={pageStyles.pageSubtitle}>
                        Tổng quan hoạt động · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={load} disabled={loading}
                    >
                        <ReloadOutlined spin={loading} /> Làm mới
                    </button>
                </div>
            </div>

            {/* STATS GRID */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40, gap: 10, color: '#64748B' }}>
                    <LoadingOutlined style={{ fontSize: 22, color: '#F97316' }} spin />
                    <span>Đang tải dashboard...</span>
                </div>
            ) : (
                <>
                    {/* Row 1 */}
                    <div className={pageStyles.statGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {/* Products */}
                        <div className={pageStyles.statCard} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => navigate(`/workspace/${workspaceId}/products`)}>
                            <div className={`${pageStyles.statIcon} ${pageStyles.orange}`}><ShoppingOutlined /></div>
                            <div className={pageStyles.statInfo}>
                                <span className={pageStyles.statLabel}>Sản phẩm</span>
                                <span className={pageStyles.statValue}>{fmtNum(products.length)}</span>
                                {outOfStock.length > 0 && (
                                    <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: '#DC2626' }}>
                                        ⚠️ {outOfStock.length} hết hàng
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stock */}
                        <div className={pageStyles.statCard}>
                            <div className={`${pageStyles.statIcon} ${pageStyles.blue}`}><InboxOutlined /></div>
                            <div className={pageStyles.statInfo}>
                                <span className={pageStyles.statLabel}>Tổng tồn kho</span>
                                <span className={pageStyles.statValue}>{fmtNum(totalStock)}</span>
                                {lowStockProducts.length > 0 && (
                                    <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: '#D97706' }}>
                                        🔔 {lowStockProducts.length} sắp hết
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Today's vouchers */}
                        <div className={pageStyles.statCard} style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/workspace/${workspaceId}/inventory`)}>
                            <div className={`${pageStyles.statIcon} ${pageStyles.green}`}><SwapOutlined /></div>
                            <div className={pageStyles.statInfo}>
                                <span className={pageStyles.statLabel}>Phiếu hôm nay</span>
                                <span className={pageStyles.statValue}>{todayVouchers.length}</span>
                                <div style={{ marginTop: 4, fontSize: 11, color: '#64748B' }}>
                                    <span style={{ color: '#16A34A', fontWeight: 600 }}>↑{inbound} nhập</span>
                                    <span style={{ margin: '0 4px' }}>·</span>
                                    <span style={{ color: '#EA580C', fontWeight: 600 }}>↓{outbound} xuất</span>
                                </div>
                            </div>
                        </div>

                        {/* Total value — only for OWNER/ACCOUNTANT */}
                        {isWorkspaceAccountant() && (
                            <div className={pageStyles.statCard}>
                                <div className={`${pageStyles.statIcon} ${pageStyles.purple}`}><DollarOutlined /></div>
                                <div className={pageStyles.statInfo}>
                                    <span className={pageStyles.statLabel}>Giá trị tồn kho</span>
                                    <span className={pageStyles.statValue} style={{ fontSize: 18 }}>{fmtVnd(totalValue)}</span>
                                    <div style={{ marginTop: 4, fontSize: 11, color: '#94A3B8' }}>Tính theo giá vốn</div>
                                </div>
                            </div>
                        )}

                        {/* Pending vouchers */}
                        {isWorkspaceManager() && (
                            <div className={pageStyles.statCard} style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/workspace/${workspaceId}/inventory`)}>
                                <div className={pageStyles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
                                    <ClockCircleOutlined />
                                </div>
                                <div className={pageStyles.statInfo}>
                                    <span className={pageStyles.statLabel}>Chờ phê duyệt</span>
                                    <span className={pageStyles.statValue} style={{ color: pending.length > 0 ? '#D97706' : '#16A34A' }}>
                                        {pending.length}
                                    </span>
                                    {processing.length > 0 && (
                                        <div style={{ marginTop: 4, fontSize: 11, color: '#2563EB', fontWeight: 600 }}>
                                            🔄 {processing.length} đang xử lý
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ALERT: Low stock */}
                    {lowStockProducts.length > 0 && (
                        <div style={{
                            background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12,
                            padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start'
                        }}>
                            <WarningOutlined style={{ color: '#D97706', fontSize: 18, marginTop: 1 }} />
                            <div>
                                <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>Cảnh báo tồn kho thấp</div>
                                <div style={{ fontSize: 13, color: '#92400E', marginTop: 2 }}>
                                    {lowStockProducts.slice(0, 3).map(p => p.productName).join(', ')}
                                    {lowStockProducts.length > 3 && ` và ${lowStockProducts.length - 3} sản phẩm khác`}
                                    {' '}đang dưới ngưỡng tối thiểu.
                                </div>
                            </div>
                            <button
                                style={{ marginLeft: 'auto', flexShrink: 0, padding: '6px 14px', borderRadius: 7, border: '1px solid #FDE68A', background: 'transparent', color: '#92400E', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                                onClick={() => navigate(`/workspace/${workspaceId}/products`)}
                            >
                                Xem sản phẩm →
                            </button>
                        </div>
                    )}

                    {/* RECENT VOUCHERS */}
                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileTextOutlined style={{ color: '#F97316' }} /> Phiếu kho gần đây
                            </h3>
                            {isWorkspaceManager() && (
                                <button
                                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                                    onClick={() => navigate(`/workspace/${workspaceId}/inventory`)}
                                >
                                    Xem tất cả →
                                </button>
                            )}
                        </div>
                        {vouchers.length === 0 ? (
                            <div className={pageStyles.placeholderCard} style={{ minHeight: 200 }}>
                                <div className={pageStyles.placeholderIcon}><SwapOutlined /></div>
                                <h3 className={pageStyles.placeholderTitle}>Chưa có phiếu kho nào</h3>
                                <p className={pageStyles.placeholderText}>Phiếu nhập / xuất kho sẽ hiện tại đây.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC' }}>
                                        {['Mã phiếu', 'Tiêu đề', 'Loại', 'Trạng thái', 'Ưu tiên', 'Tạo lúc'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #E2E8F0' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {vouchers.slice(0, 8).map((v, i) => {
                                        const sCfg = voucherStatusCfg[v.status] || { label: v.status, bg: '#F1F5F9', color: '#64748B' };
                                        const typeIcon = v.type === 'INBOUND' ? '↑' : v.type === 'OUTBOUND' ? '↓' : '⇄';
                                        const typeColor = v.type === 'INBOUND' ? '#16A34A' : v.type === 'OUTBOUND' ? '#EA580C' : '#2563EB';
                                        return (
                                            <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer', transition: 'background 0.15s' }}
                                                onClick={() => navigate(`/workspace/${workspaceId}/voucher/${v.id}`)}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FFF7ED'}
                                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA'}
                                            >
                                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#475569', fontWeight: 600 }}>
                                                    {v.voucherCode || v.id?.slice(-6)}
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: 500 }}>
                                                    {v.title || '—'}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 13, color: typeColor }}>
                                                        {typeIcon} {voucherTypeLabel[v.type] || v.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: sCfg.bg, color: sCfg.color }}>
                                                        {sCfg.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {v.priority && (
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                            background: v.priority === 'HIGH' ? '#FEE2E2' : v.priority === 'NORMAL' ? '#EFF6FF' : '#F8FAFC',
                                                            color: v.priority === 'HIGH' ? '#DC2626' : v.priority === 'NORMAL' ? '#2563EB' : '#64748B',
                                                        }}>
                                                            {v.priority === 'HIGH' ? '🔴' : v.priority === 'NORMAL' ? '🟡' : '⚪'} {v.priority}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                                                    {fmtDate(v.createdAt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* QUICK ACTIONS */}
                    {isWorkspaceManager() && (
                        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '18px 24px' }}>
                            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                                ⚡ Thao tác nhanh
                            </h3>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {[
                                    { label: '📦 Tạo phiếu nhập', path: 'inventory', color: '#16A34A', bg: '#DCFCE7' },
                                    { label: '📤 Tạo phiếu xuất', path: 'inventory', color: '#EA580C', bg: '#FFF7ED' },
                                    { label: '👥 Quản lý nhân sự', path: 'personnel', color: '#2563EB', bg: '#EFF6FF' },
                                    { label: '📊 Kiểm kê kho', path: 'stocktake', color: '#7C3AED', bg: '#EDE9FE' },
                                    { label: '📝 Nhật ký thao tác', path: 'audit-log', color: '#0891B2', bg: '#ECFEFF' },
                                ].map(a => (
                                    <button key={a.path + a.label}
                                        onClick={() => navigate(`/workspace/${workspaceId}/${a.path}`)}
                                        style={{
                                            padding: '10px 18px', borderRadius: 10, border: `1px solid ${a.bg}`,
                                            background: a.bg, color: a.color, fontWeight: 600, fontSize: 13,
                                            cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.95)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
                                    >
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Overview;
