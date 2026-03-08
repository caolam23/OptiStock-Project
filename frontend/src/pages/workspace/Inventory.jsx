import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    PlusOutlined,
    SyncOutlined,
    DownloadOutlined,
    UploadOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    LoadingOutlined,
    WarningOutlined,
    InboxOutlined,
    FireOutlined,
    MinusCircleOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { getAllVouchers } from '../../api/managerApi';
import CreateVoucherModal from './CreateVoucherModal';
import pageStyles from './WorkspacePage.module.css';
import s from './Inventory.module.css';

// ─── FILTER CONFIG ────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'INBOUND', label: 'Nhập kho', icon: <DownloadOutlined /> },
    { key: 'OUTBOUND', label: 'Xuất kho', icon: <UploadOutlined /> },
];
const STATUS_FILTERS = [
    { key: 'ALL', label: 'Mọi trạng thái' },
    { key: 'PENDING', label: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
    { key: 'PROCESSING', label: 'Đang xử lý', icon: <SyncOutlined spin /> },
    { key: 'COMPLETED', label: 'Hoàn tất', icon: <CheckCircleOutlined /> },
    { key: 'CANCELLED', label: 'Đã hủy', icon: <StopOutlined /> },
];

// ─── BADGE CONFIGS ────────────────────────────────────────────────────────────
const TYPE_MAP = {
    INBOUND: { label: 'Nhập', icon: <DownloadOutlined />, color: '#F97316', bg: '#FFF7ED' },
    OUTBOUND: { label: 'Xuất', icon: <UploadOutlined />, color: '#2563EB', bg: '#EFF6FF' },
};
const STATUS_MAP = {
    PENDING: { label: 'Chờ xử lý', icon: <ClockCircleOutlined />, color: '#64748B', bg: '#F1F5F9' },
    PROCESSING: { label: 'Đang xử lý', icon: <SyncOutlined />, color: '#F59E0B', bg: '#FFFBEB' },
    COMPLETED: { label: 'Hoàn tất', icon: <CheckCircleOutlined />, color: '#22C55E', bg: '#F0FDF4' },
    CANCELLED: { label: 'Đã hủy', icon: <StopOutlined />, color: '#EF4444', bg: '#FEF2F2' },
};
const PRIORITY_MAP = {
    HIGH: { label: 'Cao', icon: <FireOutlined />, color: '#DC2626' },
    NORMAL: { label: 'TB', icon: <MinusCircleOutlined />, color: '#F59E0B' },
    LOW: { label: 'Thấp', icon: <MinusCircleOutlined />, color: '#22C55E' },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Inventory = () => {
    const { workspaceId } = useParams();
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllVouchers(workspaceId);
            setVouchers(Array.isArray(data) ? data : []);
        } catch {
            setError('Không thể tải danh sách phiếu. Kiểm tra kết nối backend.');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => { load(); }, [load]);

    const filtered = vouchers.filter(v =>
        (filterType === 'ALL' || v.type === filterType) &&
        (filterStatus === 'ALL' || v.status === filterStatus)
    );

    return (
        <div className={pageStyles.pageContainer}>

            {/* HEADER */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>Nhập / Xuất kho</h1>
                    <p className={pageStyles.pageSubtitle}>
                        {vouchers.length > 0
                            ? `${vouchers.length} phiếu · ${vouchers.filter(v => v.status === 'PENDING').length} đang chờ xử lý`
                            : 'Tạo phiếu để bắt đầu quản lý hàng hóa'}
                    </p>
                </div>
                <div className={s.headerActions}>
                    <button className={s.btnGhost} onClick={load} disabled={loading}>
                        <SyncOutlined spin={loading} />
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                    <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
                        <PlusOutlined /> Tạo phiếu
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className={s.filterBar}>
                <FilterGroup options={TYPE_FILTERS} value={filterType} onChange={setFilterType} />
                <div className={s.filterDivider} />
                <FilterGroup options={STATUS_FILTERS} value={filterStatus} onChange={setFilterStatus} />
            </div>

            {/* STATES */}
            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} onRetry={load} />}
            {!loading && !error && filtered.length === 0 && (
                <EmptyState
                    hasFilter={filterType !== 'ALL' || filterStatus !== 'ALL'}
                    onClear={() => { setFilterType('ALL'); setFilterStatus('ALL'); }}
                    onCreate={() => setShowModal(true)}
                />
            )}

            {/* TABLE */}
            {!loading && !error && filtered.length > 0 && (
                <VoucherTable vouchers={filtered} />
            )}

            {/* MODAL */}
            {showModal && (
                <CreateVoucherModal
                    workspaceId={workspaceId}
                    onClose={() => setShowModal(false)}
                    onCreated={() => { setShowModal(false); load(); }}
                />
            )}
        </div>
    );
};

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────

const FilterGroup = ({ options, value, onChange }) => (
    <div className={s.filterGroup}>
        {options.map(o => (
            <button
                key={o.key}
                className={value === o.key ? s.tabActive : s.tabInactive}
                onClick={() => onChange(o.key)}
            >
                {o.icon && <span style={{ fontSize: 12 }}>{o.icon}</span>}
                {o.label}
            </button>
        ))}
    </div>
);

const VoucherTable = ({ vouchers }) => (
    <div className={s.tableCard}>
        <table className={s.table}>
            <thead>
                <tr>
                    {['Mã phiếu', 'Tiêu đề / Điểm đến', 'Loại', 'Ưu tiên', 'Trạng thái', 'Sản phẩm', 'Ngày tạo'].map(h => (
                        <th key={h} className={s.th}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {vouchers.map((v, i) => (
                    <tr key={v.id} className={`${s.tr} ${i % 2 === 0 ? s.trEven : s.trOdd}`}>
                        <td className={s.td}>
                            <span className={s.codeText}>{v.voucherCode || '—'}</span>
                        </td>
                        <td className={s.td} style={{ maxWidth: 240 }}>
                            <div className={s.voucherTitle}>{v.title || '—'}</div>
                            {v.destination && (
                                <div className={s.voucherDest}>
                                    <ArrowRightOutlined style={{ fontSize: 9 }} /> {v.destination}
                                </div>
                            )}
                        </td>
                        <td className={s.td}><Badge config={TYPE_MAP[v.type]} fallback={v.type} /></td>
                        <td className={s.td}><PriorityLabel priority={v.priority} /></td>
                        <td className={s.td}><Badge config={STATUS_MAP[v.status]} fallback={v.status} /></td>
                        <td className={`${s.td} ${s.tdCenter}`}>
                            <span className={s.itemCount}>{v.items?.length ?? 0}</span>
                        </td>
                        <td className={s.td} style={{ color: '#64748B', fontSize: 12 }}>
                            {v.createdAt ? new Date(v.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Badge = ({ config, fallback }) => {
    if (!config) return <span style={{ fontSize: 12, color: '#94A3B8' }}>{fallback || '—'}</span>;
    return (
        <span className={s.badge} style={{ background: config.bg, color: config.color }}>
            {config.icon} {config.label}
        </span>
    );
};

const PriorityLabel = ({ priority }) => {
    const p = PRIORITY_MAP[priority] || { label: priority || '—', color: '#94A3B8', icon: null };
    return (
        <span className={s.priorityLabel} style={{ color: p.color }}>
            {p.icon} {p.label}
        </span>
    );
};

const LoadingState = () => (
    <div className={s.loadingState}>
        <LoadingOutlined style={{ fontSize: 28, color: '#F97316' }} />
        <span className={s.loadingText}>Đang tải danh sách phiếu...</span>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className={s.errorBox}>
        <span className={s.errorMsg}>
            <WarningOutlined /> {message}
        </span>
        <button className={s.btnGhostSm} onClick={onRetry}>Thử lại</button>
    </div>
);

const EmptyState = ({ hasFilter, onClear, onCreate }) => (
    <div className={pageStyles.placeholderCard}>
        <div className={pageStyles.placeholderIcon}><InboxOutlined /></div>
        <h3 className={pageStyles.placeholderTitle}>
            {hasFilter ? 'Không tìm thấy phiếu nào' : 'Chưa có phiếu nào'}
        </h3>
        <p className={pageStyles.placeholderText}>
            {hasFilter
                ? 'Thay đổi bộ lọc để xem thêm phiếu.'
                : 'Tạo phiếu nhập/xuất đầu tiên để bắt đầu.'}
        </p>
        {hasFilter
            ? <button className={s.btnGhostSm} style={{ marginTop: 16 }} onClick={onClear}>Xóa bộ lọc</button>
            : <button className={s.btnPrimary} style={{ marginTop: 16 }} onClick={onCreate}><PlusOutlined /> Tạo phiếu đầu tiên</button>
        }
    </div>
);

export default Inventory;
