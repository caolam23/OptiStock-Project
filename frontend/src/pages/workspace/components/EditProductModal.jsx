import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import styles from './EditProductModal.module.css';
import { updateProduct, getProductCategories } from '../../../api/productApi';

const EditProductModal = ({ visible = false, tenantId, productData, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Fetch categories & units khi modal mở
    useEffect(() => {
        if (visible && tenantId) {
            loadProductCategories();
        }
    }, [visible, tenantId]);

    // Điền dữ liệu cũ vào form khi productData thay đổi
    useEffect(() => {
        if (visible && productData) {
            form.setFieldsValue({
                productCode: productData.productCode,
                productName: productData.productName,
                category: productData.category,
                description: productData.description,
                price: productData.price,
                cost: productData.cost,
                mainUnit: productData.mainUnit || 'Cái',
                currentStock: productData.currentStock || 0,
                minStock: productData.minStock || 0,
                maxStock: productData.maxStock || 1000,
                supplier: productData.supplier,
            });
        }
    }, [visible, productData, form]);

    /**
     * Lấy danh sách danh mục & đơn vị từ backend
     */
    const loadProductCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await getProductCategories(tenantId);
            
            if (response.success || response.categories) {
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
            }
        } catch (error) {
            console.error('Lỗi tải danh mục sản phẩm:', error);
            setCategories([
                { label: 'Khác', value: 'Khác' }
            ]);
            setUnits([
                { label: 'Cái', value: 'Cái' }
            ]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleUpdateProduct = async (values) => {
        try {
            setLoading(true);

            if (!tenantId || !productData?.id) {
                message.error('Thông tin workspace hoặc sản phẩm không hợp lệ');
                return;
            }

            // Gọi API cập nhật sản phẩm
            const response = await updateProduct(tenantId, productData.id, {
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

            if (response.success) {
                message.success(response.message || 'Cập nhật sản phẩm thành công');
                form.resetFields();
                onSuccess();
            } else {
                message.error(response.message || 'Cập nhật sản phẩm thất bại');
            }
        } catch (error) {
            console.error('Lỗi cập nhật sản phẩm:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            message.error(
                error.response?.data?.message ||
                error.message ||
                'Lỗi cập nhật sản phẩm. Vui lòng thử lại.'
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
            styles={{ content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }} 
        >
            <div className={styles.modalContainer}>
                
                {/* HEADER */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>Sửa sản phẩm</div>
                    <button className={styles.closeBtn} onClick={handleCancel} title="Đóng">&times;</button>
                </div>

                {/* BODY */}
                <div className={styles.modalBody}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateProduct}
                        autoComplete="off"
                    >
                        {/* SECTION 1: THÔNG TIN CHUNG */}
                        <div className={styles.sectionTitle}>Thông tin chung</div>
                        <div className={styles.formGrid}>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    Mã SKU <span className={styles.required}>*</span>
                                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '4px' }}>(Không thể sửa)</span>
                                </label>
                                <Form.Item name="productCode">
                                    <Input 
                                        className={styles.formControl} 
                                        disabled
                                        maxLength={50}
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
                                <Form.Item name="category">
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
                                <Form.Item name="mainUnit">
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
                                <Form.Item name="currentStock">
                                    <InputNumber className={styles.formControlNumber} placeholder="0" min={0} />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tồn kho tối thiểu</label>
                                <Form.Item name="minStock">
                                    <InputNumber className={styles.formControlNumber} placeholder="0" min={0} />
                                </Form.Item>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tồn kho tối đa</label>
                                <Form.Item name="maxStock">
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
                        {loading ? 'Đang xử lý...' : 'Cập nhật sản phẩm'}
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default EditProductModal;
