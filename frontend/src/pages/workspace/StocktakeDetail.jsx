import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeftOutlined, CheckCircleFilled, LoadingOutlined,
    WarningOutlined, CheckOutlined,
    AuditOutlined, PlayCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import {
    getStocktakeTicket, startStocktake, updateCount, submitStocktake
} from '../../api/staffApi';
import sharedStyles from './WorkspacePage.module.css';
import styles from './StocktakeDetail.module.css';

// ──────────────────────────────────────────
// Toast
// ──────────────────────────────────────────
const Toast = ({ message, type }) => (
    <div className={`${styles.toast} ${styles[`toast${type}`]}`}>{message}</div>
);

// ──────────────────────────────────────────
// Stocktake — Main page (for Staff working on a ticketId)
// ──────────────────────────────────────────
const StocktakePage = () => {
    const { workspaceId, ticketId } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [updatingCode, setUpdatingCode] = useState(null);
    const [toast, setToast] = useState(null);
    // Local input values per productCode → debounce save
    const [localValues, setLocalValues] = useState({});

    const showToast = useCallback((message, type = 'Success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Fetch ticket
    const fetchTicket = useCallback(async () => {
        try {
            const res = await getStocktakeTicket(ticketId);
            setTicket(res.data);
            // Init local values
            const init = {};
            res.data.items?.forEach(i => {
                init[i.productCode] = i.actualQuantity ?? '';
            });
            setLocalValues(init);
        } catch {
            showToast('Không thể tải phiếu kiểm kê.', 'Error');
        }
        setLoading(false);
    }, [ticketId]);

    useEffect(() => { fetchTicket(); }, [fetchTicket]);

    // START
    const handleStart = async () => {
        if (starting) return; // guard double-click
        setStarting(true);
        try {
            const res = await startStocktake(ticketId);
            setTicket(res.data);
            showToast('✅ Bắt đầu kiểm kê! Nhập số lượng thực tế vào từng ô.', 'Success');
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi khi bắt đầu.', 'Error');
        }
        setStarting(false);
    };

    // UPDATE COUNT (on blur or Enter)
    const handleCountBlur = async (productCode) => {
        if (updatingCode !== null) return; // wait for previous update
        const val = localValues[productCode];
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed < 0) return;

        // Skip if same as server value
        const serverItem = ticket?.items?.find(i => i.productCode === productCode);
        if (serverItem?.actualQuantity === parsed && serverItem?.counted) return;

        setUpdatingCode(productCode);
        try {
            const res = await updateCount(ticketId, productCode, parsed);
            setTicket(res.data);
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi cập nhật.', 'Error');
        }
        setUpdatingCode(null);
    };

    // SUBMIT
    const handleSubmit = async () => {
        if (submitting) return; // guard double-click
        if (!window.confirm('Gửi báo cáo kiểm kê? Sau khi gửi, Manager sẽ xem xét chênh lệch.')) return;
        setSubmitting(true);
        try {
            await submitStocktake(ticketId);
            showToast('🎉 Báo cáo đã gửi thành công! Chờ Manager duyệt.', 'Success');
            setTimeout(() => navigate(`/workspace/${workspaceId}/staff-tasks`), 2200);
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi khi gửi báo cáo.', 'Error');
        }
        setSubmitting(false);
    };

    // ── derived
    const items = ticket?.items || [];
    const countedItems = items.filter(i => i.counted || i.actualQuantity !== null).length;
    const totalItems = items.length;
    const progress = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;
    const canSubmit = ticket?.status === 'IN_PROGRESS' && countedItems === totalItems && totalItems > 0;

    if (loading) return (
        <div className={sharedStyles.pageContainer}>
            <div className={styles.loadingState}>
                <LoadingOutlined style={{ fontSize: 32, color: '#F97316' }} />
                <p>Đang tải phiếu kiểm kê...</p>
            </div>
        </div>
    );

    if (!ticket) return (
        <div className={sharedStyles.pageContainer}>
            <div className={styles.loadingState}>
                <WarningOutlined style={{ fontSize: 32, color: '#EF4444' }} />
                <p>Không tìm thấy phiếu kiểm kê.</p>
            </div>
        </div>
    );

    return (
        <div className={sharedStyles.pageContainer}>
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Header */}
            <div className={sharedStyles.pageHeader}>
                <div className={sharedStyles.pageHeaderLeft}>
                    <button className={styles.backBtn} onClick={() => navigate(`/workspace/${workspaceId}/staff-tasks`)}>
                        <ArrowLeftOutlined /> Quay lại
                    </button>
                    <h1 className={sharedStyles.pageTitle}>
                        <span className={styles.typeTag}><AuditOutlined /> Kiểm kê</span>
                        {ticket.ticketCode}
                    </h1>
                    <p className={sharedStyles.pageSubtitle}>{ticket.title} · {ticket.locationCode}</p>
                </div>

                <div className={styles.headerActions}>
                    {ticket.status === 'PENDING' && (
                        <button className={styles.startBtn} onClick={handleStart} disabled={starting}>
                            {starting ? <LoadingOutlined /> : <PlayCircleOutlined />} Bắt đầu kiểm kê
                        </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                        <button
                            className={`${styles.submitBtn} ${!canSubmit ? styles.submitBtnDisabled : ''}`}
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            title={!canSubmit ? `Còn ${totalItems - countedItems} sản phẩm chưa nhập` : 'Gửi báo cáo kiểm kê'}
                        >
                            {submitting ? <LoadingOutlined /> : <CheckOutlined />}
                            {canSubmit ? 'Gửi báo cáo' : `Còn ${totalItems - countedItems} chưa nhập`}
                        </button>
                    )}
                    {ticket.status === 'SUBMITTED' && (
                        <span className={styles.submittedTag}><CheckCircleFilled /> Đã gửi báo cáo</span>
                    )}
                </div>
            </div>

            {/* Progress header */}
            <div className={styles.progressHeader}>
                <div className={styles.progressInfo}>
                    <span>Tiến độ kiểm kê: <strong>{countedItems}/{totalItems} sản phẩm</strong></span>
                    <span className={styles.progressPct}>{progress}%</span>
                </div>
                <div className={styles.progressBarWrap}>
                    <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
                </div>

                {ticket.status === 'PENDING' && (
                    <div className={styles.pendingNotice}>
                        <ClockCircleOutlined /> Bấm <strong>"Bắt đầu kiểm kê"</strong> để mở giao diện nhập số lượng.
                    </div>
                )}
            </div>

            {/* Warning banner */}
            <div className={styles.warningBanner}>
                <WarningOutlined />
                <span>Số lượng hệ thống bị ẩn để đảm bảo tính chính xác. Hãy đếm thực tế và nhập vào ô bên dưới.</span>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Mã SP</th>
                            <th className={styles.th}>Tên sản phẩm</th>
                            <th className={styles.th}>Vị trí</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Số lượng thực tế</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => {
                            const isCounted = item.counted || item.actualQuantity !== null;
                            const isUpdating = updatingCode === item.productCode;
                            const isEditable = ticket.status === 'IN_PROGRESS';

                            return (
                                <tr
                                    key={item.productCode}
                                    className={`${styles.tr} ${isCounted ? styles.trCounted : styles.trUncounted}`}
                                >
                                    <td className={styles.td}>
                                        <code className={styles.codeCell}>{item.productCode}</code>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.productName}>{item.productName}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.locationCell}>{item.locationCode || '—'}</span>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>
                                        <div className={styles.countInputWrap}>
                                            <input
                                                type="number"
                                                min="0"
                                                className={`${styles.countInput} ${isCounted ? styles.countInputDone : ''}`}
                                                value={localValues[item.productCode] ?? ''}
                                                placeholder="—"
                                                disabled={!isEditable || isUpdating}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === '' || parseInt(val, 10) >= 0) {
                                                        setLocalValues(prev => ({
                                                            ...prev,
                                                            [item.productCode]: val
                                                        }));
                                                    }
                                                }}
                                                onBlur={() => handleCountBlur(item.productCode)}
                                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                                            />
                                            {isUpdating && <LoadingOutlined className={styles.inputSpinner} />}
                                        </div>
                                    </td>
                                    <td className={`${styles.td} ${styles.tdCenter}`}>
                                        {isCounted
                                            ? <span className={styles.statusDone}><CheckCircleFilled /> Đã nhập</span>
                                            : <span className={styles.statusPending}>Chưa nhập</span>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StocktakePage;
