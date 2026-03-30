import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import styles from './CreateProductModal.module.css';
import { createProduct, getProductCategories } from '../../../api/productApi';

const CreateProductModal = ({ visible = false, tenantId, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [defaultCategory, setDefaultCategory] = useState('');
    const [defaultUnit, setDefaultUnit] = useState('');
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Fetch categories & units khi tenantId thay đổi
    useEffect(() => {
        if (visible && tenantId) {
            loadProductCategories();
        }
    }, [visible, tenantId]);

    /**
     * Lấy danh sách danh mục & đơn vị từ backend
     */
    const loadProductCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await getProductCategories(tenantId);
            
            if (response.success || response.categories) {
                // Convert to Ant Design Select options format
                const categoryOptions = response.categories.map(cat => ({
                    label: cat,
                    value: cat
                }));
                const unitOptions = response.units.map(unit => ({
                    label: unit,
                    value: unit
                }));

                setCategories(categoryOptions);
                setUnits(unitOptions);
                setDefaultCategory(response.defaultCategory);
                setDefaultUnit(response.defaultUnit);

                // Set default values in form
                form.setFieldsValue({
                    category: response.defaultCategory,
                    mainUnit: response.defaultUnit
                });
            }
        } catch (error) {
            console.error('Lỗi tải danh mục sản phẩm:', error);
            // Fallback to default categories if API fails
            setCategories([
                { label: 'Khác', value: 'Khác' }
            ]);
            setUnits([
                { label: 'Cái', value: 'Cái' }
            ]);
            setDefaultUnit('Cái');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleCreateProduct = async (values) => {
        try {
            setLoading(true);

            // Validate tenantId
            if (!tenantId) {
                message.error('Workspace chưa được chọn');
                return;
            }

            // Gọi API tạo sản phẩm
            const response = await createProduct(tenantId, {
                productCode: values.productCode,
                productName: values.productName,
                category: values.category || null,
                description: values.description || null,
                price: values.price,
                cost: values.cost || null,
                mainUnit: values.mainUnit || 'Cái',
                currentStock: values.currentStock || 0,
                minStock: values.minStock || 0,
                maxStock: values.maxStock || 1000,
                supplier: values.supplier || null,
            });

            // Backend trả response 200 OK với success: true/false
            if (response.success) {
                message.success(response.message || 'Tạo sản phẩm thành công');
                form.resetFields();
                onSuccess(); // Callback to parent to reload products
            } else {
                // Validation error từ backend - show message from response
                message.error(response.message || 'Tạo sản phẩm thất bại');
            }
        } catch (error) {
            // Network error hoặc server 5xx error
            console.error('Lỗi tạo sản phẩm (network/server):', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            message.error(
                error.response?.data?.message ||
                error.message ||
                'Lỗi tạo sản phẩm. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            open={visible}
            onCancel={handleCancel}
            footer={null}
            closable={false}
            width={650}
            // Loại bỏ padding mặc định của Ant Design để dùng hoàn toàn CSS custom
            styles={{ content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }} 
        >
            <div className={styles.modalContainer}>
                
                {/* HEADER */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>Thêm sản phẩm mới</div>
                    <button className={styles.closeBtn} onClick={handleCancel} title="Đóng">&times;</button>
                </div>

                {/* BODY */}
                <div className={styles.modalBody}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleCreateProduct}
                        autoComplete="off"
                    >
                        {/* SECTION 1: THÔNG TIN CHUNG */}
                        <div className={styles.sectionTitle}>Thông tin chung</div>
                        <div className={styles.formGrid}>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    Mã SKU <span className={styles.required}>*</span>
                                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '4px' }}>(Phải duy nhất trong workspace)</span>
                                </label>
                                <Form.Item
                                    name="productCode"
                                    rules={[
                                        { required: true, message: 'Mã SKU không được để trống' },
                                        { min: 1, message: 'Mã SKU phải có ít nhất 1 ký tự' },
                                        {
                                            pattern: /^[A-Z0-9\-_]+$/i,
                                            message: 'Mã SKU chỉ dùng chữ, số, dấu gạch ngang, dấu gạch dưới'
                                        }
                                    ]}
                                >
                                    <Input 
                                        className={styles.formControl} 
                                        placeholder="VD: SKU-001, PROD-2024" 
                                        maxLength={50}
                                        onBlur={(e) => {
                                            // Auto-format: convert to uppercase
                                            const value = e.target.value;
                                            if (value) {
                                                form.setFieldsValue({ productCode: value.toUpperCase() });
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tên sản phẩm <span className={styles.required}>*</span></label>
                                <Form.Item
                                    name="productName"
                                    rules={[
                                        { required: true, message: 'Tên sản phẩm không được trống' },
                                        { min: 1, message: 'Tên sản phẩm phải có ít nhất 1 ký tự' },
                                    ]}
                                >
                                    <Input className={styles.formControl} placeholder="VD: Nước ngọt Coca" maxLength={255} />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Danh mục</label>
                                <Form.Item name="category" initialValue={defaultCategory}>
                                    <Select
                                        className={styles.formControlSelect}
                                        placeholder="Chọn danh mục"
                                        options={categories}
                                        loading={categoriesLoading}
                                    />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Đơn vị</label>
                                <Form.Item name="mainUnit" initialValue={defaultUnit}>
                                    <Select
                                        className={styles.formControlSelect}
                                        placeholder="Chọn đơn vị"
                                        options={units}
                                        loading={categoriesLoading}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        {/* SECTION 2: ĐỊNH GIÁ & TỒN KHO */}
                        <div className={styles.sectionTitle}>Định giá & Tồn kho</div>
                        <div className={styles.formGrid}>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Giá bán (VND) <span className={styles.required}>*</span></label>
                                <Form.Item
                                    name="price"
                                    rules={[
                                        { required: true, message: 'Giá bán không được để trống' },
                                        { type: 'number', min: 0.01, message: 'Giá bán phải lớn hơn 0' },
                                    ]}
                                >
                                    <InputNumber
                                        className={styles.formControlNumber}
                                        placeholder="Nhập giá bán"
                                        min={0}
                                        step={1000}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Giá vốn (VND)</label>
                                <Form.Item name="cost">
                                    <InputNumber
                                        className={styles.formControlNumber}
                                        placeholder="Nhập giá vốn"
                                        min={0}
                                        step={1000}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tồn kho hiện tại</label>
                                <Form.Item name="currentStock" initialValue={0}>
                                    <InputNumber className={styles.formControlNumber} placeholder="0" min={0} />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tồn kho tối thiểu</label>
                                <Form.Item name="minStock" initialValue={0}>
                                    <InputNumber className={styles.formControlNumber} placeholder="0" min={0} />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tồn kho tối đa</label>
                                <Form.Item name="maxStock" initialValue={1000}>
                                    <InputNumber className={styles.formControlNumber} placeholder="1000" min={1} />
                                </Form.Item>
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        {/* SECTION 3: THÔNG TIN BỔ SUNG */}
                        <div className={styles.sectionTitle}>Thông tin bổ sung</div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Nhà cung cấp</label>
                            <Form.Item name="supplier">
                                <Input className={styles.formControl} placeholder="VD: Công ty ABC" maxLength={255} />
                            </Form.Item>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Mô tả sản phẩm</label>
                            <Form.Item name="description">
                                <Input.TextArea
                                    className={styles.formControlTextarea}
                                    placeholder="Nhập ghi chú hoặc mô tả chi tiết..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>

                {/* FOOTER */}
                <div className={styles.modalFooter}>
                    <button type="button" className={`${styles.btn} ${styles.btnDefault}`} onClick={handleCancel}>
                        Hủy bỏ
                    </button>
                    <button 
                        type="button" 
                        className={`${styles.btn} ${styles.btnPrimary}`} 
                        onClick={() => form.submit()} 
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Tạo sản phẩm'}
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default CreateProductModal;