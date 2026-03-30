import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import styles from './SectionDynamicSpecs.module.css';

/**
 * Helper function: Render value input based on spec type
 */
const renderValueInput = (item, valueName, fieldConfig) => {
    const config = fieldConfig || {
        rules: [{ required: false, message: `Vui lòng nhập ${item.label}` }],
    };

    switch (item.type) {
        case 'input':
            return (
                <Form.Item name={valueName} {...config} className={styles.formItemWrapper}>
                    <Input
                        placeholder={item.placeholder}
                        className={styles.formControl}
                        disabled={item.editable === false}
                    />
                </Form.Item>
            );

        case 'number':
            return (
                <Form.Item name={valueName} {...config} className={styles.formItemWrapper}>
                    <InputNumber
                        placeholder={item.placeholder}
                        controls={false}
                        className={styles.formControl}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            );

        case 'select':
            return (
                <Form.Item 
                    name={valueName} 
                    {...config} 
                    className={styles.formItemWrapper}
                    // ✅ FIX 1: Chuyển String thành Array cho thẻ Select Tags và ngược lại
                    getValueProps={(value) => ({ value: value ? [value] : [] })}
                    getValueFromEvent={(val) => (val && val.length > 0 ? val[val.length - 1] : '')}
                >
                    <Select
                        placeholder={item.placeholder}
                        mode="tags"
                        maxCount={1}
                        showSearch
                        allowClear
                        options={item.options?.map(opt => ({ label: opt, value: opt })) || []}
                        className={styles.selectWrapper}
                        notFoundContent={null}
                    />
                </Form.Item>
            );

        case 'textarea':
            return (
                <Form.Item name={valueName} {...config} className={styles.formItemWrapper}>
                    <Input.TextArea
                        rows={3}
                        placeholder={item.placeholder}
                        className={styles.formControl}
                    />
                </Form.Item>
            );

        default:
            return (
                <Form.Item name={valueName} {...config} className={styles.formItemWrapper}>
                    <Input
                        placeholder={item.placeholder}
                        className={styles.formControl}
                    />
                </Form.Item>
            );
    }
};

/**
 * Helper function: Render one spec row (Label + Value)
 */
const renderSpecRow = (item, index) => {
    const valueName = ['specifications', index, 'value'];
    const keyName = ['specifications', index, 'key']; // ✅ FIX 3: Thêm key name để lưu data
    const fieldConfig = {
        rules: [{ required: false, message: `Vui lòng nhập ${item.label}` }],
    };
    const uniqueKey = `spec-${index}`;

    return (
        <div key={uniqueKey} className={styles.specRow}>
            {/* ✅ Giữ lại `key` ngầm dưới Form state để Submit không bị mất chữ "Dung lượng", "Màu sắc", v.v... */}
            <Form.Item name={keyName} hidden>
                <Input />
            </Form.Item>

            <Input
                disabled
                value={item.label}
                readOnly
                className={styles.labelInput}
                style={{ fontWeight: 500 }}
            />
            <div className={styles.valueInputWrapper}>
                {renderValueInput(item, valueName, fieldConfig)}
            </div>
        </div>
    );
};

/**
 * SectionDynamicSpecs: Section 2 - Thông số kỹ thuật (Dynamic)
 */
const SectionDynamicSpecs = ({
    form,
    selectedCategory,
    specs,
    showQuickSpecsAlert,
    setShowQuickSpecsAlert,
}) => {
    // Early return if no specs
    if (!specs || specs.length === 0) {
        return null;
    }

    return (
        <>
            {showQuickSpecsAlert && (
                <div className={styles.alertBox}>
                    <svg className={styles.alertIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className={styles.alertContent}>
                        <h4>Đã tải thông số kỹ thuật</h4>
                        <p>Các thông số đã được tải từ model bạn chọn. Bạn có thể chỉnh sửa nếu cần.</p>
                    </div>
                    <button className={styles.alertCloseBtn} onClick={() => setShowQuickSpecsAlert(false)} type="button" aria-label="Đóng alert">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className={styles.sectionBox}>
                <div className={styles.sectionTitle}>
                    <svg className={styles.sectionTitleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Thông số kỹ thuật
                </div>

                {/* ✅ FIX 2: Bỏ bọc <Form.List> dư thừa để Antd không bị crash state khi re-render map trực tiếp */}
                <div>
                    {specs.map((item, index) => renderSpecRow(item, index))}
                </div>
            </div>
        </>
    );
};

export default SectionDynamicSpecs;