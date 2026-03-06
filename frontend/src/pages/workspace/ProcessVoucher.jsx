import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeftOutlined, CheckCircleFilled, LoadingOutlined,
    ScanOutlined, EditOutlined, CheckOutlined, WarningOutlined,
    ExclamationCircleOutlined, CameraOutlined,
    ImportOutlined, ExportOutlined, EnvironmentOutlined,
    CheckSquareOutlined, AimOutlined
} from '@ant-design/icons';
import {
    getVoucher, startVoucher, scanBarcode,
    updateVoucherItem, completeVoucher
} from '../../api/staffApi';
import CameraScanner from '../../components/CameraScanner';
import sharedStyles from './WorkspacePage.module.css';
import styles from './ProcessVoucher.module.css';

// ──────────────────────────────────────────
// Toast notification
// ──────────────────────────────────────────
const Toast = ({ message, type }) => (
    <div className={`${styles.toast} ${styles[`toast${type}`]}`}>{message}</div>
);

// ──────────────────────────────────────────
// One item row in the item list
// key={item.productCode + '-' + item.quantityActual} on parent ensures
// this re-mounts with fresh state whenever backend data updates.
// ──────────────────────────────────────────
const ItemRow = ({ item, onManualUpdate, isUpdating, isEditable }) => {
    const [editMode, setEditMode] = useState(false);
    const [inputVal, setInputVal] = useState(item.quantityActual ?? 0);

    // Backend is source of truth — use item.isCompleted + computed progress
    const required = item.quantityRequired ?? 0;
    const actual = item.quantityActual ?? 0;
    const isDone = item.completed;  // Lombok boolean: isCompleted() → JSON 'completed'
    const isOver = required > 0 && actual > required;
    const progress = required > 0 ? Math.min(100, Math.round((actual / required) * 100)) : 0;

    const handleSave = () => {
        const qty = parseInt(inputVal, 10);
        if (!isNaN(qty) && qty >= 0) {
            onManualUpdate(item.productCode, qty);
        }
        setEditMode(false);
    };

    return (
        <div className={`${styles.itemRow} ${isDone && !isOver ? styles.itemDone : ''} ${isOver ? styles.itemOver : ''}`}>
            <div className={styles.itemInfo}>
                <div className={styles.itemName}>
                    {isDone && !isOver && <CheckCircleFilled className={styles.checkIcon} />}
                    {isOver && <ExclamationCircleOutlined className={styles.overIcon} />}
                    <span>{item.productName}</span>
                </div>
                <span className={styles.itemCode}>{item.productCode}</span>
                {item.locationCode && (
                    <span className={styles.itemLocation}><EnvironmentOutlined /> {item.locationCode}</span>
                )}
            </div>

            <div className={styles.itemProgress}>
                <div className={styles.progressBar}>
                    <div
                        className={`${styles.progressFill} ${isOver ? styles.progressOver : isDone ? styles.progressDone : ''}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className={`${styles.qtyLabel} ${isDone && !isOver ? styles.qtyDone : ''} ${isOver ? styles.qtyOver : ''}`}>
                    {actual}/{required}
                    {isOver && <span className={styles.overTag}> ⚠️</span>}
                </span>
            </div>

            <div className={styles.itemAction}>
                {isEditable && (editMode ? (
                    <div className={styles.manualInput}>
                        <input
                            type="number"
                            min="0"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            autoFocus
                            className={styles.numberInput}
                        />
                        <button className={styles.saveBtn} onClick={handleSave} disabled={isUpdating}>
                            {isUpdating ? <LoadingOutlined /> : <CheckOutlined />}
                        </button>
                    </div>
                ) : (
                    <button
                        className={styles.editBtn}
                        onClick={() => { setInputVal(actual); setEditMode(true); }}
                        title="Nhập thủ công"
                    >
                        <EditOutlined />
                    </button>
                ))}
            </div>
        </div>
    );
};

// ──────────────────────────────────────────
// ProcessVoucher — Main Page
// ──────────────────────────────────────────
const ProcessVoucher = () => {
    const { workspaceId, voucherId } = useParams();
    const navigate = useNavigate();

    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [updatingItem, setUpdatingItem] = useState(null); // productCode đang update
    const [toast, setToast] = useState(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [showCamera, setShowCamera] = useState(false); // camera scanner modal
    const barcodeRef = useRef(null);
    const isScanningRef = useRef(false); // lock: ngăn double-scan

    // ── Toast helper
    const showToast = useCallback((message, type = 'Success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Fetch voucher (source of truth từ backend)
    const fetchVoucher = useCallback(async () => {
        try {
            const res = await getVoucher(voucherId);
            setVoucher(res.data);
        } catch {
            showToast('Không thể tải phiếu. Vui lòng thử lại.', 'Error');
        }
        setLoading(false);
    }, [voucherId, showToast]);

    useEffect(() => { fetchVoucher(); }, [fetchVoucher]);

    // Focus barcode input khi chuyển sang PROCESSING
    useEffect(() => {
        if (voucher?.status === 'PROCESSING') {
            setTimeout(() => barcodeRef.current?.focus(), 100);
        }
    }, [voucher?.status]);

    // ── START
    const handleStart = async () => {
        if (starting) return;
        setStarting(true);
        try {
            const res = await startVoucher(voucherId);
            setVoucher(res.data);
            showToast('✅ Bắt đầu xử lý phiếu!', 'Success');
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi khi bắt đầu.', 'Error');
        }
        setStarting(false);
    };

    // ── SCAN BARCODE — với lock để ngăn double-scan
    const handleScan = async (e) => {
        if (e.key !== 'Enter') return;
        const barcode = barcodeInput.trim();
        if (!barcode || isScanningRef.current) return;

        isScanningRef.current = true;
        setBarcodeInput('');

        try {
            const res = await scanBarcode(voucherId, barcode);
            setVoucher(res.data);
            // Tìm item vừa scan để hiện toast
            const hit = res.data?.items?.find(i => i.productCode === barcode || i.barcode === barcode);
            if (hit) {
                const over = hit.quantityActual > hit.quantityRequired;
                showToast(
                    over
                        ? `⚠️ ${hit.productName}: ${hit.quantityActual}/${hit.quantityRequired} (vượt quá số lượng!)`
                        : `✅ ${hit.productName}: ${hit.quantityActual}/${hit.quantityRequired}`,
                    over ? 'Error' : 'Success'
                );
            } else {
                showToast('✅ Đã cập nhật!', 'Success');
            }
        } catch (e) {
            showToast(e.response?.data?.message || `❌ Mã "${barcode}" không tìm thấy trong phiếu.`, 'Error');
        }

        isScanningRef.current = false;
        setTimeout(() => barcodeRef.current?.focus(), 50);
    };

    // ── MANUAL UPDATE — ngăn concurrent calls cho cùng 1 item
    const handleManualUpdate = async (productCode, newQuantity) => {
        if (updatingItem !== null) return; // đang xử lý item khác
        setUpdatingItem(productCode);
        try {
            const res = await updateVoucherItem(voucherId, productCode, newQuantity);
            setVoucher(res.data);
            const hit = res.data?.items?.find(i => i.productCode === productCode);
            if (hit) {
                const over = hit.quantityActual > hit.quantityRequired;
                showToast(
                    over
                        ? `⚠️ ${hit.productName}: ${hit.quantityActual}/${hit.quantityRequired} (vượt quá!)`
                        : `✅ ${hit.productName}: ${hit.quantityActual}/${hit.quantityRequired}`,
                    over ? 'Error' : 'Success'
                );
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Lỗi cập nhật số lượng.', 'Error');
        }
        setUpdatingItem(null);
    };

    // ── CAMERA SCAN — gọi khi html5-qrcode detect được mã
    const handleCameraDetect = useCallback(async (decodedText) => {
        if (isScanningRef.current) return;
        isScanningRef.current = true;
        try {
            const res = await scanBarcode(voucherId, decodedText);
            setVoucher(res.data);
            const hit = res.data?.items?.find(i => i.productCode === decodedText || i.barcode === decodedText);
            showToast(
                hit
                    ? (hit.quantityActual > hit.quantityRequired
                        ? `⚠️ ${hit.productName}: ${hit.quantityActual}/${hit.quantityRequired} (vượt!)`
                        : `✅ ${hit.productName}: ${hit.quantityActual}/${hit.quantityRequired}`)
                    : `✅ ${decodedText} — đã cập nhật!`,
                hit?.quantityActual > hit?.quantityRequired ? 'Error' : 'Success'
            );
        } catch (e) {
            showToast(e.response?.data?.message || `❌ Mã "${decodedText}" không thuộc phiếu này.`, 'Error');
        }
        isScanningRef.current = false;
    }, [voucherId, showToast]);

    // ── COMPLETE — backend validate lại toàn bộ
    const handleComplete = async () => {
        if (completing) return; // guard double-click
        if (!window.confirm('Hoàn tất phiếu? Hệ thống sẽ cập nhật tồn kho ngay lập tức.')) return;
        setCompleting(true);
        try {
            const res = await completeVoucher(voucherId);
            const updatedVoucher = res.data?.voucher ?? res.data;
            setVoucher(updatedVoucher);
            showToast('🎉 Phiếu hoàn tất! Tồn kho đã được cập nhật.', 'Success');
            setTimeout(() => navigate(`/workspace/${workspaceId}/staff-tasks`), 2000);
        } catch (e) {
            // Backend trả lỗi nếu có item chưa done — hiển thị đúng thông báo
            showToast(e.response?.data?.message || 'Lỗi khi hoàn tất phiếu.', 'Error');
        }
        setCompleting(false);
    };

    // ── Derived state — dùng backend isCompleted làm source of truth
    const isInbound = voucher?.type === 'INBOUND';
    const items = voucher?.items || [];
    const totalItems = items.length;
    // Lombok 'private boolean isCompleted' → getter isCompleted() → Jackson JSON field 'completed'
    const doneItems = items.filter(i => i.completed).length;
    const overItems = items.filter(i => (i.quantityActual ?? 0) > (i.quantityRequired ?? 0) && (i.quantityRequired ?? 0) > 0).length;
    const overallProgress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    // canComplete = tất cả items isCompleted (backend flag) — backend còn validate lại
    const canComplete = voucher?.status === 'PROCESSING' && doneItems === totalItems && totalItems > 0;
    const isEditable = voucher?.status === 'PROCESSING';

    // ── Loading / Error states
    if (loading) return (
        <div className={sharedStyles.pageContainer}>
            <div className={styles.loadingState}>
                <LoadingOutlined style={{ fontSize: 32, color: '#F97316' }} />
                <p>Đang tải phiếu...</p>
            </div>
        </div>
    );

    if (!voucher) return (
        <div className={sharedStyles.pageContainer}>
            <div className={styles.loadingState}>
                <WarningOutlined style={{ fontSize: 32, color: '#EF4444' }} />
                <p>Không tìm thấy phiếu.</p>
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
                        <span className={`${styles.typeTag} ${isInbound ? styles.tagBlue : styles.tagOrange}`}>
                            {isInbound ? <><ImportOutlined /> Nhập kho</> : <><ExportOutlined /> Xuất kho</>}
                        </span>
                        {voucher.voucherCode}
                    </h1>
                    <p className={sharedStyles.pageSubtitle}>{voucher.title}</p>
                </div>

                <div className={styles.headerActions}>
                    {voucher.status === 'PENDING' && (
                        <button className={styles.startBtn} onClick={handleStart} disabled={starting}>
                            {starting ? <LoadingOutlined /> : <ScanOutlined />}
                            {starting ? 'Đang bắt đầu...' : 'Bắt đầu xử lý'}
                        </button>
                    )}
                    {voucher.status === 'PROCESSING' && (
                        <button
                            className={`${styles.completeBtn} ${!canComplete ? styles.completeBtnDisabled : ''}`}
                            onClick={handleComplete}
                            disabled={!canComplete || completing}
                            title={
                                !canComplete
                                    ? `Còn ${totalItems - doneItems} sản phẩm chưa đủ số lượng`
                                    : 'Hoàn tất phiếu và cập nhật tồn kho'
                            }
                        >
                            {completing ? <LoadingOutlined /> : <CheckCircleFilled />}
                            {completing
                                ? 'Đang hoàn tất...'
                                : canComplete
                                    ? 'Hoàn tất phiếu'
                                    : `Còn ${totalItems - doneItems} sp chưa xong`}
                        </button>
                    )}
                    {voucher.status === 'COMPLETED' && (
                        <span className={styles.completedTag}><CheckCircleFilled /> Đã hoàn tất</span>
                    )}
                </div>
            </div>

            {/* Overall progress */}
            <div className={styles.overallProgress}>
                <div className={styles.overallInfo}>
                    <span>
                        Tiến độ: <strong>{doneItems}/{totalItems} sản phẩm</strong>
                        {overItems > 0 && (
                            <span className={styles.overWarn}> · ⚠️ {overItems} sp vượt quá số lượng yêu cầu</span>
                        )}
                    </span>
                    <span>{overallProgress}%</span>
                </div>
                <div className={styles.overallBar}>
                    <div className={styles.overallFill} style={{ width: `${overallProgress}%` }} />
                </div>
            </div>

            {/* Split layout */}
            <div className={styles.splitLayout}>
                {/* LEFT: item list */}
                <div className={styles.itemListPanel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>Danh sách hàng hóa</span>
                        <span className={styles.panelSub}>{doneItems}/{totalItems} hoàn thành</span>
                    </div>
                    <div className={styles.itemList}>
                        {items.map(item => (
                            // key forces re-mount (và reset useState) mỗi khi quantityActual thay đổi
                            <ItemRow
                                key={`${item.productCode}-${item.quantityActual}`}
                                item={item}
                                onManualUpdate={handleManualUpdate}
                                isUpdating={updatingItem === item.productCode}
                                isEditable={isEditable}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT: scan panel */}
                <div className={styles.scanPanel}>
                    {/* Header with camera toggle */}
                    <div className={`${styles.panelHeader} ${styles.panelHeaderFlex}`}>
                        <span className={styles.panelTitle}><ScanOutlined /> Quét mã barcode</span>
                        {isEditable && (
                            <button
                                className={styles.cameraToggleBtn}
                                onClick={() => setShowCamera(true)}
                                title="Mở camera để quét barcode"
                            >
                                <CameraOutlined /> Camera
                            </button>
                        )}
                    </div>

                    {voucher.status === 'PENDING' ? (
                        <div className={styles.pendingHint}>
                            <ScanOutlined className={styles.pendingIcon} />
                            <p>Bấm <strong>"Bắt đầu xử lý"</strong> để mở giao diện quét mã.</p>
                        </div>
                    ) : voucher.status === 'PROCESSING' ? (
                        <>
                            <div className={styles.barcodeWrap}>
                                <input
                                    ref={barcodeRef}
                                    className={styles.barcodeInput}
                                    type="text"
                                    placeholder="Quét hoặc nhập mã barcode..."
                                    value={barcodeInput}
                                    onChange={e => setBarcodeInput(e.target.value)}
                                    onKeyDown={handleScan}
                                    disabled={isScanningRef.current}
                                />
                                <p className={styles.barcodeHint}>
                                    <ScanOutlined /> Đưa máy quét lên đây → bấm Enter · Mỗi lần quét +1
                                </p>
                            </div>
                            <div className={styles.scanHints}>
                                <h4>Hướng dẫn:</h4>
                                <ul>
                                    <li><CheckSquareOutlined style={{ color: '#22C55E' }} /> Quét mã → tự động tăng +1 số lượng thực tế</li>
                                    <li><EditOutlined style={{ color: '#8B5CF6' }} /> Bấm <EditOutlined /> để nhập trực tiếp số lượng</li>
                                    <li><WarningOutlined style={{ color: '#F59E0B' }} /> Nhập &gt; số yêu cầu → hệ thống sẽ chặn, không lưu vượt</li>
                                    <li><AimOutlined style={{ color: '#F97316' }} /> Nút "Hoàn tất" mở khi <strong>tất cả</strong> sp đủ số lượng</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div className={styles.pendingHint}>
                            <CheckCircleFilled className={styles.completedIcon} />
                            <p>Phiếu đã hoàn tất!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Scanner — position:fixed, DOM position irrelevant */}
            {showCamera && (
                <CameraScanner
                    onScan={handleCameraDetect}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </div>
    );
};

export default ProcessVoucher;
