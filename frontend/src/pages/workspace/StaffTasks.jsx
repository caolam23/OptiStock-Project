import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    InboxOutlined, ReloadOutlined, ArrowRightOutlined,
    ClockCircleOutlined, FireOutlined, CheckCircleOutlined,
    AuditOutlined, ExclamationCircleOutlined,
    ImportOutlined, ExportOutlined, SyncOutlined,
    EnvironmentOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { getPendingInbound, getPendingOutbound, getPendingStocktakes } from '../../api/staffApi';
import sharedStyles from './WorkspacePage.module.css';
import styles from './StaffTasks.module.css';

// ──────────────────────────────────────────
// Priority badge
// ──────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
    const map = {
        HIGH: { label: 'Gấp', className: styles.priorityHigh },
        NORMAL: { label: 'Bình thường', className: styles.priorityNormal },
        LOW: { label: 'Thấp', className: styles.priorityLow },
    };
    const cfg = map[priority] || map.NORMAL;
    return <span className={`${styles.priorityBadge} ${cfg.className}`}>{cfg.label}</span>;
};

// ──────────────────────────────────────────
// Single Voucher Card (Nhập / Xuất)
// ──────────────────────────────────────────
const VoucherCard = ({ voucher, type, workspaceId }) => {
    const navigate = useNavigate();
    const totalItems = voucher.items?.length || 0;
    const doneItems = voucher.items?.filter(i => i.quantityActual > 0).length || 0;
    const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    const isProcessing = voucher.status === 'PROCESSING';

    return (
        <div
            className={`${styles.voucherCard} ${type === 'INBOUND' ? styles.cardInbound : styles.cardOutbound}`}
            onClick={() => navigate(`/workspace/${workspaceId}/voucher/${voucher.id}`)}
        >
            <div className={styles.cardTop}>
                <div className={styles.cardCode}>
                    <span className={`${styles.typeTag} ${type === 'INBOUND' ? styles.tagInbound : styles.tagOutbound}`}>
                        {type === 'INBOUND' ? <><ImportOutlined /> Nhập</> : <><ExportOutlined /> Xuất</>}
                    </span>
                    <strong>{voucher.voucherCode}</strong>
                </div>
                <PriorityBadge priority={voucher.priority} />
            </div>

            <p className={styles.cardTitle}>{voucher.title || 'Không có tiêu đề'}</p>

            <div className={styles.cardMeta}>
                <span><AppstoreOutlined /> {totalItems} sản phẩm</span>
                {isProcessing && (
                    <span className={styles.processingTag}><FireOutlined /> Đang xử lý</span>
                )}
            </div>

            {isProcessing && totalItems > 0 && (
                <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{doneItems}/{totalItems}</span>
                </div>
            )}

            <button className={`${styles.actionBtn} ${type === 'INBOUND' ? styles.btnBlue : styles.btnOrange}`}>
                Xử lý <ArrowRightOutlined />
            </button>
        </div>
    );
};

// ──────────────────────────────────────────
// Single Stocktake Card
// ──────────────────────────────────────────
const StocktakeCard = ({ ticket, workspaceId }) => {
    const navigate = useNavigate();
    const progress = ticket.totalItems > 0
        ? Math.round((ticket.countedItems / ticket.totalItems) * 100) : 0;

    return (
        <div
            className={`${styles.voucherCard} ${styles.cardStocktake}`}
            onClick={() => navigate(`/workspace/${workspaceId}/stocktake/${ticket.id}`)}
        >
            <div className={styles.cardTop}>
                <div className={styles.cardCode}>
                    <span className={`${styles.typeTag} ${styles.tagStocktake}`}>
                        <AuditOutlined /> Kiểm kê
                    </span>
                    <strong>{ticket.ticketCode}</strong>
                </div>
                <span className={styles.statusBadge}>{ticket.status === 'IN_PROGRESS' ? <><SyncOutlined spin /> Đang kê</> : <><ClockCircleOutlined /> Chờ</>}</span>
            </div>

            <p className={styles.cardTitle}>{ticket.title}</p>

            <div className={styles.cardMeta}>
                <span><AppstoreOutlined /> {ticket.totalItems} sản phẩm</span>
                {ticket.locationCode && (
                    <span><EnvironmentOutlined /> {ticket.locationCode}</span>
                )}
            </div>

            {ticket.countedItems > 0 && (
                <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                        <div className={`${styles.progressFill} ${styles.fillGreen}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{ticket.countedItems}/{ticket.totalItems}</span>
                </div>
            )}

            <button className={`${styles.actionBtn} ${styles.btnGreen}`}>
                Kiểm kê <ArrowRightOutlined />
            </button>
        </div>
    );
};

// ──────────────────────────────────────────
// Column (1/3 of kanban)
// ──────────────────────────────────────────
const Column = ({ title, icon, count, color, loading, children, emptyText }) => (
    <div className={styles.column}>
        <div className={`${styles.columnHeader} ${styles[`header${color}`]}`}>
            <div className={styles.columnTitle}>
                <span className={styles.columnIcon}>{icon}</span>
                <span>{title}</span>
            </div>
            <span className={`${styles.countBadge} ${styles[`badge${color}`]}`}>{count}</span>
        </div>

        <div className={styles.columnBody}>
            {loading ? (
                <>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </>
            ) : count === 0 ? (
                <div className={styles.emptyCol}>
                    <CheckCircleOutlined className={styles.emptyIcon} />
                    <p>{emptyText}</p>
                </div>
            ) : children}
        </div>
    </div>
);

// ──────────────────────────────────────────
// StaffTasks — Main Page
// ──────────────────────────────────────────
const StaffTasks = () => {
    const { workspaceId } = useParams();
    const [inbound, setInbound] = useState([]);
    const [outbound, setOutbound] = useState([]);
    const [stocktakes, setStocktakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [inRes, outRes, stRes] = await Promise.allSettled([
                getPendingInbound(),
                getPendingOutbound(),
                getPendingStocktakes(),
            ]);
            if (inRes.status === 'fulfilled') setInbound(inRes.value.data);
            if (outRes.status === 'fulfilled') setOutbound(outRes.value.data);
            if (stRes.status === 'fulfilled') setStocktakes(stRes.value.data);
        } catch (_) { }
        setLoading(false);
        setLastRefresh(new Date());
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const totalTasks = inbound.length + outbound.length + stocktakes.length;
    const now = lastRefresh.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={sharedStyles.pageContainer}>
            {/* Header */}
            <div className={sharedStyles.pageHeader}>
                <div className={sharedStyles.pageHeaderLeft}>
                    <h1 className={sharedStyles.pageTitle}>Bảng công việc</h1>
                    <p className={sharedStyles.pageSubtitle}>
                        {loading ? 'Đang tải...' : `${totalTasks} phiếu đang chờ/xử lý · Cập nhật lúc ${now}`}
                    </p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchAll} disabled={loading}>
                    <ReloadOutlined spin={loading} /> Làm mới
                </button>
            </div>

            {/* Stat counters */}
            <div className={sharedStyles.statGrid}>
                <div className={sharedStyles.statCard}>
                    <div className={`${sharedStyles.statIcon} ${sharedStyles.blue}`}><InboxOutlined /></div>
                    <div className={sharedStyles.statInfo}>
                        <span className={sharedStyles.statLabel}>Phiếu Nhập kho</span>
                        <span className={sharedStyles.statValue}>{loading ? '—' : inbound.length}</span>
                    </div>
                </div>
                <div className={sharedStyles.statCard}>
                    <div className={`${sharedStyles.statIcon} ${sharedStyles.orange}`}>
                        <InboxOutlined style={{ transform: 'scaleY(-1)' }} />
                    </div>
                    <div className={sharedStyles.statInfo}>
                        <span className={sharedStyles.statLabel}>Phiếu Xuất kho</span>
                        <span className={sharedStyles.statValue}>{loading ? '—' : outbound.length}</span>
                    </div>
                </div>
                <div className={sharedStyles.statCard}>
                    <div className={`${sharedStyles.statIcon} ${sharedStyles.green}`}><AuditOutlined /></div>
                    <div className={sharedStyles.statInfo}>
                        <span className={sharedStyles.statLabel}>Phiếu Kiểm kê</span>
                        <span className={sharedStyles.statValue}>{loading ? '—' : stocktakes.length}</span>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className={styles.taskBoard}>
                <Column title="Nhập kho" icon={<ImportOutlined />} count={inbound.length} color="Blue" loading={loading} emptyText="Không có phiếu nhập nào.">
                    {inbound.map(v => <VoucherCard key={v.id} voucher={v} type="INBOUND" workspaceId={workspaceId} />)}
                </Column>

                <Column title="Xuất kho" icon={<ExportOutlined />} count={outbound.length} color="Orange" loading={loading} emptyText="Không có phiếu xuất nào.">
                    {outbound.map(v => <VoucherCard key={v.id} voucher={v} type="OUTBOUND" workspaceId={workspaceId} />)}
                </Column>

                <Column title="Kiểm kê" icon={<AuditOutlined />} count={stocktakes.length} color="Green" loading={loading} emptyText="Không có phiếu kiểm kê nào.">
                    {stocktakes.map(t => <StocktakeCard key={t.id} ticket={t} workspaceId={workspaceId} />)}
                </Column>
            </div>
        </div>
    );
};

export default StaffTasks;
