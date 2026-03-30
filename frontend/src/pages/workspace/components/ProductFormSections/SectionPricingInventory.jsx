import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import styles from './SectionPricingInventory.module.css';

/**
 * SectionPricingInventory: Section 3 - Định giá & Quản lý kho
 * Contains: Tracking Type (Radio Cards), Pricing, Stock levels, Description
 */
const SectionPricingInventory = ({ form }) => {
    return (
        <div className={styles.sectionBox}>
            <div className={styles.sectionTitle}>
                <svg
                    className={styles.sectionTitleIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                Định giá & Quản lý kho
            </div>

            <div className={styles.formGroup + ' ' + styles.formGroupFullWidth}>
                <label className={styles.formLabel}>
                    Loại quản lý kho
                    <span className={styles.requiredToken}> *</span>
                </label>
                <Form.Item
                    name="trackingType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại quản lý' }]}
                    className={styles.formItemWrapper}
                >
                    <div className={styles.radioGrid}>
                        <label className={styles.radioCard}>
                            <input
                                type="radio"
                                value="QUANTITY"
                                onChange={(e) => form.setFieldValue('trackingType', e.target.value)}
                                checked={form.getFieldValue('trackingType') === 'QUANTITY'}
                            />
                            <div className={styles.radioHeader}>
                                <span className={styles.radioTitle}>🔢 Quản lý theo Số lượng</span>
                                <div className={styles.radioCircle}></div>
                            </div>
                            <div className={styles.radioDesc}>Phù hợp cho phụ kiện, hàng hóa không cần quản lý số Serial.</div>
                        </label>

                        <label className={styles.radioCard}>
                            <input
                                type="radio"
                                value="IMEI"
                                onChange={(e) => form.setFieldValue('trackingType', e.target.value)}
                                checked={form.getFieldValue('trackingType') === 'IMEI'}
                            />
                            <div className={styles.radioHeader}>
                                <span className={styles.radioTitle}>📱 Quản lý theo IMEI / Serial</span>
                                <div className={styles.radioCircle}></div>
                            </div>
                            <div className={styles.radioDesc}>Bắt buộc nhập IMEI cho từng máy khi nhập/xuất kho.</div>
                        </label>
                    </div>
                </Form.Item>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <Form.Item
                        label={
                            <span>
                                Giá bán (VNĐ)
                                <span className={styles.requiredToken}> *</span>
                            </span>
                        }
                        name="price"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá bán' },
                            { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                        ]}
                        className={styles.formItemWrapper}
                    >
                        <InputNumber
                            placeholder="0"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => parseInt(value.replace(/\$\s?|(,*)/g, ''))}
                            className={styles.formControl}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>
                <div className={styles.formGroup}>
                    <Form.Item
                        label="Giá vốn / Giá nhập (VNĐ)"
                        name="cost"
                        rules={[{ type: 'number', min: 0, message: 'Giá vốn phải lớn hơn hoặc bằng 0' }]}
                        className={styles.formItemWrapper}
                    >
                        <InputNumber
                            placeholder="0"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => parseInt(value.replace(/\$\s?|(,*)/g, ''))}
                            className={styles.formControl}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>
                <div className={styles.formGroup}>
                    <Form.Item
                        label={
                            <span>
                                Tồn kho hiện tại
                                <span className={styles.requiredToken}> *</span>
                            </span>
                        }
                        name="currentStock"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tồn kho hiện tại' },
                            { type: 'number', min: 0, message: 'Tồn kho phải lớn hơn hoặc bằng 0' }
                        ]}
                        className={styles.formItemWrapper}
                    >
                        <InputNumber
                            placeholder="0"
                            min={0}
                            className={styles.formControl}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>
                <div className={styles.formGroup}>
                    <Form.Item
                        label="Tồn kho tối thiểu"
                        name="minStock"
                        rules={[{ type: 'number', min: 0 }]}
                        className={styles.formItemWrapper}
                    >
                        <InputNumber
                            placeholder="0"
                            min={0}
                            className={styles.formControl}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>
                <div className={styles.formGroup}>
                    <Form.Item
                        label="Tồn kho tối đa"
                        name="maxStock"
                        rules={[{ type: 'number', min: 0 }]}
                        className={styles.formItemWrapper}
                    >
                        <InputNumber
                            placeholder="1000"
                            min={0}
                            className={styles.formControl}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>

                <div className={styles.formGroup + ' ' + styles.formGroupFullWidth}>
                    <Form.Item
                        label="Ghi chú nội bộ"
                        name="description"
                        className={styles.formItemWrapper}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập ghi chú hoặc mô tả chi tiết..."
                            className={styles.formControl}
                        />
                    </Form.Item>
                </div>
            </div>
        </div>
    );
};

export default SectionPricingInventory;
