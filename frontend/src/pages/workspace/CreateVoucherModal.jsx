import React, { useState } from 'react';
import {
    CloseOutlined,
    PlusOutlined,
    DeleteOutlined,
    LoadingOutlined,
    DownloadOutlined,
    UploadOutlined,
    WarningOutlined,
    CheckOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { createVoucher } from '../../api/managerApi';
import styles from './CreateVoucherModal.module.css';

/**
 * CreateVoucherModal — Tạo phiếu nhập/xuất kho (2 bước)
 *
 * Bước 1: Loại phiếu + thông tin cơ bản
 * Bước 2: Thêm danh sách sản phẩm
 *
 * @prop {string}   workspaceId
 * @prop {Function} onClose
 * @prop {Function} onCreated — callback sau khi tạo thành công
 */
const PRIORITIES = [
    { value: 'HIGH', label: 'Ưu tiên cao', color: '#DC2626' },
    { value: 'NORMAL', label: 'Bình thường', color: '#D97706' },
    { value: 'LOW', label: 'Ưu tiên thấp', color: '#16A34A' },
];

const CreateVoucherModal = ({ workspaceId, onClose, onCreated }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        type: 'INBOUND',
        title: '',
        priority: 'NORMAL',
        destination: '',
        notes: '',
    });
    const [items, setItems] = useState([newItem()]);

    function newItem() {
        return { productCode: '', productName: '', productVariant: '', locationCode: '', quantityRequired: 1 };
    }

    const setField = (f, v) => { setForm(p => ({ ...p, [f]: v })); setError(null); };
    const setItemField = (i, f, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
    const addItem = () => setItems(p => [...p, newItem()]);
    const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

    const step1Valid = form.title.trim().length >= 2;

    const handleSubmit = async () => {
        for (const item of items) {
            if (!item.productCode.trim() || !item.productName.trim()) {
                setError('Tất cả sản phẩm cần có mã và tên.');
                return;
            }
            if (!item.quantityRequired || Number(item.quantityRequired) <= 0) {
                setError('Số lượng phải lớn hơn 0.');
                return;
            }
        }
        setLoading(true);
        setError(null);
        try {
            await createVoucher(workspaceId, {
                ...form,
                items: items.map(i => ({
                    productCode: i.productCode.trim(),
                    productName: i.productName.trim(),
                    productVariant: i.productVariant.trim() || null,
                    locationCode: i.locationCode.trim() || null,
                    quantityRequired: Number(i.quantityRequired),
                })),
            });
            onCreated();
        } catch (e) {
            setError(e?.response?.data?.message || 'Tạo phiếu thất bại. Thử lại.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* ── HEADER ── */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        {form.type === 'INBOUND'
                            ? <DownloadOutlined className={styles.headerIcon} />
                            : <UploadOutlined className={styles.headerIcon} style={{ color: '#2563EB' }} />}
                        Tạo phiếu {form.type === 'INBOUND' ? 'nhập kho' : 'xuất kho'}
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
                        <CloseOutlined />
                    </button>
                </div>

                {/* ── STEPPER ── */}
                <div className={styles.stepper}>
                    <Step n={1} active={step === 1} done={step > 1} label="Thông tin" />
                    <div className={styles.stepLine} />
                    <Step n={2} active={step === 2} done={false} label="Sản phẩm" />
                </div>

                {/* ── BODY ── */}
                <div className={styles.body}>
                    {step === 1 && (
                        <Step1Form
                            form={form}
                            setField={setField}
                        />
                    )}
                    {step === 2 && (
                        <Step2Items
                            items={items}
                            setItemField={setItemField}
                            addItem={addItem}
                            removeItem={removeItem}
                        />
                    )}
                </div>

                {/* ── ERROR ── */}
                {error && (
                    <div className={styles.errorBanner}>
                        <WarningOutlined /> {error}
                    </div>
                )}

                {/* ── FOOTER ── */}
                <div className={styles.footer}>
                    {step === 1 ? (
                        <>
                            <button className={styles.btnCancel} onClick={onClose}>Hủy</button>
                            <button
                                className={styles.btnNext}
                                onClick={() => setStep(2)}
                                disabled={!step1Valid}
                            >
                                Tiếp theo <ArrowRightOutlined />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={styles.btnCancel} onClick={() => setStep(1)}>
                                ← Quay lại
                            </button>
                            <button
                                className={styles.btnSubmit}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading
                                    ? <><LoadingOutlined /> Đang tạo...</>
                                    : <><CheckOutlined /> Tạo phiếu</>
                                }
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── STEP 1: Thông tin phiếu ───────────────────────────────────────────────────
const Step1Form = ({ form, setField }) => (
    <div className={styles.formStack}>
        {/* Loại phiếu */}
        <div className={styles.fieldGroup}>
            <label className={styles.label}>Loại phiếu</label>
            <div className={styles.typeRow}>
                <TypeCard
                    type="INBOUND"
                    icon={<DownloadOutlined />}
                    title="Nhập kho"
                    desc="Hàng từ NCC, trả hàng..."
                    active={form.type === 'INBOUND'}
                    onClick={() => setField('type', 'INBOUND')}
                />
                <TypeCard
                    type="OUTBOUND"
                    icon={<UploadOutlined />}
                    title="Xuất kho"
                    desc="Xuất cửa hàng, điều chuyển..."
                    active={form.type === 'OUTBOUND'}
                    onClick={() => setField('type', 'OUTBOUND')}
                    accentColor="#2563EB"
                    accentBg="#EFF6FF"
                />
            </div>
        </div>

        {/* Tiêu đề */}
        <div className={styles.fieldGroup}>
            <label className={styles.label}>Tiêu đề <span className={styles.required}>*</span></label>
            <input
                className={styles.input}
                placeholder={form.type === 'INBOUND' ? 'VD: Nhập hàng từ NCC Tuấn' : 'VD: Xuất Cửa hàng Quận 1'}
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                autoFocus
            />
        </div>

        {/* Ưu tiên */}
        <div className={styles.fieldGroup}>
            <label className={styles.label}>Mức ưu tiên</label>
            <div className={styles.priorityRow}>
                {[
                    { value: 'HIGH', label: 'Cao', color: '#DC2626', bg: '#FEF2F2' },
                    { value: 'NORMAL', label: 'TB', color: '#D97706', bg: '#FFFBEB' },
                    { value: 'LOW', label: 'Thấp', color: '#16A34A', bg: '#F0FDF4' },
                ].map(p => (
                    <button
                        key={p.value}
                        className={styles.priorityBtn}
                        style={form.priority === p.value
                            ? { background: p.bg, color: p.color, borderColor: p.color }
                            : {}}
                        onClick={() => setField('priority', p.value)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Nơi nhận (chỉ OUTBOUND) */}
        {form.type === 'OUTBOUND' && (
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Nơi nhận</label>
                <input
                    className={styles.input}
                    placeholder="VD: Cửa hàng Quận 1, Kho chi nhánh 2..."
                    value={form.destination}
                    onChange={e => setField('destination', e.target.value)}
                />
            </div>
        )}

        {/* Ghi chú */}
        <div className={styles.fieldGroup}>
            <label className={styles.label}>Ghi chú</label>
            <textarea
                className={styles.textarea}
                placeholder="Ghi chú thêm (tuỳ chọn)..."
                value={form.notes}
                rows={3}
                onChange={e => setField('notes', e.target.value)}
            />
        </div>
    </div>
);

// ─── STEP 2: Danh sách sản phẩm ───────────────────────────────────────────────
const Step2Items = ({ items, setItemField, addItem, removeItem }) => (
    <div className={styles.formStack}>
        <div className={styles.itemsHeader}>
            <span className={styles.itemsCount}>{items.length} sản phẩm</span>
            <button className={styles.btnAddItem} onClick={addItem}>
                <PlusOutlined /> Thêm sản phẩm
            </button>
        </div>

        {items.map((item, idx) => (
            <div key={idx} className={styles.itemCard}>
                <div className={styles.itemIndex}>{idx + 1}</div>
                <div className={styles.itemFields}>
                    <div className={styles.itemRow}>
                        <input className={styles.input} placeholder="Mã / Barcode *"
                            value={item.productCode}
                            onChange={e => setItemField(idx, 'productCode', e.target.value)} />
                        <input className={styles.input} placeholder="Tên sản phẩm *"
                            value={item.productName}
                            onChange={e => setItemField(idx, 'productName', e.target.value)} />
                    </div>
                    <div className={styles.itemRow}>
                        <input className={styles.input} placeholder="Phân loại (màu, size...)"
                            value={item.productVariant}
                            onChange={e => setItemField(idx, 'productVariant', e.target.value)} />
                        <input className={styles.input} style={{ flex: '0 0 140px' }} placeholder="Vị trí kệ"
                            value={item.locationCode}
                            onChange={e => setItemField(idx, 'locationCode', e.target.value)} />
                        <input className={styles.inputQty} type="number" min={1} placeholder="SL*"
                            value={item.quantityRequired}
                            onChange={e => setItemField(idx, 'quantityRequired', e.target.value)} />
                    </div>
                </div>
                {items.length > 1 && (
                    <button className={styles.btnRemove} onClick={() => removeItem(idx)} aria-label="Xóa">
                        <DeleteOutlined />
                    </button>
                )}
            </div>
        ))}
    </div>
);

// ─── SMALL SUB COMPONENTS ─────────────────────────────────────────────────────

const Step = ({ n, active, done, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: `2px solid ${active || done ? '#F97316' : '#E2E8F0'}`,
            background: done ? '#F97316' : active ? '#FFF7ED' : '#F8FAFC',
            color: done ? '#fff' : active ? '#F97316' : '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, transition: 'all 0.2s',
        }}>{done ? <CheckOutlined /> : n}</div>
        <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#F97316' : '#94A3B8' }}>
            {label}
        </span>
    </div>
);

const TypeCard = ({ icon, title, desc, active, onClick, accentColor = '#F97316', accentBg = '#FFF7ED' }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1, textAlign: 'left', padding: '12px 14px',
            borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${active ? accentColor : '#E2E8F0'}`,
            background: active ? accentBg : '#F8FAFC',
            transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: active ? accentColor : '#374151', fontWeight: 700, fontSize: 13 }}>
            <span style={{ fontSize: 15 }}>{icon}</span> {title}
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{desc}</div>
    </button>
);

export default CreateVoucherModal;
