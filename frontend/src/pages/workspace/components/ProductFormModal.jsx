import React, { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { createProduct, updateProduct } from '../../../api/productApi';
import { getSpecsForCategory } from './CategorySpecsConfig';
import { BRAND_MODELS, getModelById, getModelsByBrand, getBrandsByCategory } from '../../../utils/brandModels';
import { GROCERY_CATEGORIES, getGrocerySpecs } from '../../../utils/GroceryCategoryConfig';
import SectionBasicInfo from './ProductFormSections/SectionBasicInfo';
import SectionDynamicSpecs from './ProductFormSections/SectionDynamicSpecs';
import SectionPricingInventory from './ProductFormSections/SectionPricingInventory';
import SectionBatchManagement from './ProductFormSections/SectionBatchManagement';
import SectionUnitConversion from './ProductFormSections/SectionUnitConversion';
import styles from './ProductFormModal.module.css';

/**
 * ProductFormModal: Form Dynamic Attributes cho 14 danh mục Electronics & Gadgets
 * 
 * 3 Section:
 * 1. Thông tin chung (Fixed Fields) + Intelligent Quick Specs
 * 2. Thông số kỹ thuật (Dynamic Fields - theo danh mục)
 * 3. Định giá & Quản lý kho
 */

// ==================== HELPER FUNCTIONS ====================
/**
 * Normalize brand code - nếu là label thì convert thành key
 * @param {string} brandInput - Brand label hoặc key (VD: 'Apple' hoặc 'Apple_Smartphone')
 * @param {string} category - Category để filter
 * @returns {string} Brand key (VD: 'Apple_Smartphone')
 */
const normalizeBrandCode = (brandInput, category) => {
    if (!brandInput) return null;
    
    // Nếu là key, return as-is
    if (BRAND_MODELS[brandInput]) {
        return brandInput;
    }
    
    // Nếu là label, find key
    const found = Object.entries(BRAND_MODELS).find(([key, brand]) => {
        if (category && brand.category !== category) return false;
        return brand.label === brandInput;
    });
    
    return found ? found[0] : null;
};

/**
 * Tự động điền specs từ model được chọn
 * @param {string} brand - Brand code (VD: Apple_Smartphone)
 * @param {string} modelId - Model ID (VD: iphone-15-pro-max)
 * @param {Array} categorySpecs - Danh sách specs theo category từ CategorySpecsConfig
 * @returns {Array} Mảng specs autofill
 */
const autoFillSpecsFromModel = (brand, modelId, categorySpecs) => {
    const model = getModelById(brand, modelId);
    if (!model || !categorySpecs) return null;

    // Tạo mảng specifications từ model specs
    const autoSpecs = [];

    // Kết hợp specs từ model và specs chuẩn theo category
    categorySpecs.forEach((spec) => {
        let value = '';

        // Ưu tiên lấy từ model.specs theo các key phổ biến
        switch (spec.name.toLowerCase()) {
            case 'color':
            case 'màu':
            case 'màu sắc':
                value = model.colors && model.colors.length > 0 ? model.colors[0] : '';
                break;
            case 'storage':
            case 'dung lượng':
                value = model.storageOptions && model.storageOptions.length > 0 ? model.storageOptions[0] : '';
                break;
            case 'ram':
                value = model.specs?.RAM || model.specs?.['RAM'] || '';
                break;
            case 'model':
                value = model.name || '';
                break;
            case 'processor':
            case 'cpu':
                value = model.specs?.Processor || model.specs?.CPU || model.specs?.['CPU'] || '';
                break;
            case 'display':
            case 'screen':
                value = model.specs?.Display || model.specs?.['Display'] || model.specs?.['Screen size'] || model.specs?.Screen || '';
                break;
            case 'camera':
                value = model.specs?.Camera || model.specs?.['Camera'] || '';
                break;
            case 'battery':
                value = model.specs?.Battery || model.specs?.['Battery'] || '';
                break;
            case 'os':
                value = model.specs?.OS || model.specs?.['OS'] || '';
                break;
            case 'gpu':
                value = model.specs?.GPU || model.specs?.['GPU'] || '';
                break;
            default:
                // Tìm kiếm với label từ spec config
                if (model.specs) {
                    value = model.specs[spec.label] || model.specs[spec.name] || '';
                }
        }

        if (value) {
            autoSpecs.push({ key: spec.label, value });
        }
    });

    return autoSpecs.length > 0 ? autoSpecs : null;
};

const ProductFormModal = ({
    visible = false,
    mode = 'create',
    productData = null,
    tenantId = null,
    industryType = 'ELECTRONICS', 
    availableCategories = [], // 🔥 THÊM DÒNG NÀY (Nhận danh mục từ Products.jsx)
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelOptions, setModelOptions] = useState([]);
    const [showQuickSpecsAlert, setShowQuickSpecsAlert] = useState(false);
    const [modelSpecs, setModelSpecs] = useState([]);  // ✅ NEW: Track specs của model được chọn

    // ==================== INIT & RESET ====================
    useEffect(() => {
        if (visible && mode === 'edit' && productData) {
            // Edit Mode: Load dữ liệu sản phẩm
            // Normalize brand code từ backend
            const normalizedBrand = normalizeBrandCode(productData.brand, productData.category);
            
            form.setFieldsValue({
                productCode: productData.productCode,
                productName: productData.productName,
                brand: normalizedBrand,
                category: productData.category,
                condition: productData.condition,
                trackingType: productData.trackingType || 'QUANTITY',
                warrantyMonths: productData.warrantyMonths,
                price: productData.price,
                cost: productData.cost,
                currentStock: productData.currentStock || 0,
                minStock: productData.minStock || 0,
                maxStock: productData.maxStock || 1000,
                description: productData.description,
                specifications: productData.specifications ? 
                    Object.entries(productData.specifications).map(([key, value]) => ({ key, value })) : [],
                industryType: productData.industryType || 'ELECTRONICS',
                batches: productData.batches || [],  // 🔥 Load lô hàng từ backend
                unitConversions: productData.unitConversions || [],  // 🔥 Load quy đổi từ backend
            });
            setSelectedCategory(productData.category);
            setSelectedBrand(normalizedBrand);
            
            // Load model options nếu brand ada
            if (normalizedBrand && BRAND_MODELS[normalizedBrand]) {
                const models = getModelsByBrand(normalizedBrand);
                setModelOptions(models);
            }
        } else if (visible && mode === 'create') {
            // Create Mode: Reset form
            form.resetFields();
            form.setFieldsValue({
                trackingType: 'QUANTITY',
                currentStock: 0,
                minStock: 0,
                maxStock: 1000,
                specifications: [],  // Initialize empty specifications array
                industryType: industryType || 'ELECTRONICS',  // 🔥 Set industryType từ props
                batches: [],  // 🔥 Initialize empty batches
                unitConversions: [],  // 🔥 Initialize empty unit conversions
            });
            setSelectedCategory(null);
            setSelectedBrand(null);
            setSelectedModel(null);
            setModelOptions([]);
            setModelSpecs([]);  // 🔥 FIX: Reset modelSpecs để tránh data cũ
            setShowQuickSpecsAlert(false);
        }
    }, [visible, mode, productData, form, industryType]);

    // ==================== Initialize specifications array chỉ khi form mở ====================
    useEffect(() => {
        if (visible && mode === 'create') {
            // Chỉ khởi tạo lần đầu khi tạo sản phẩm mới
            const currentSpecs = form.getFieldValue('specifications');
            if (!currentSpecs || (Array.isArray(currentSpecs) && currentSpecs.length === 0)) {
                // Khởi tạo specifications array trống để form sẵn sàng
                form.setFieldValue('specifications', []);
            }
        }
    }, [visible, mode, form]);

    // ==================== XỬ LÝ SUBMIT ====================
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const formValues = await form.validateFields();

            // Convert specifications array về Map
            const specMap = {};
            if (formValues.specifications && Array.isArray(formValues.specifications)) {
                formValues.specifications.forEach(spec => {
                    if (spec && spec.key && spec.value !== undefined && spec.value !== null && spec.value !== '') {
                        specMap[spec.key] = spec.value;
                    }
                });
            }

            // ========== CLEAN PAYLOAD: Remove null/undefined values ==========
            const cleanPayload = Object.fromEntries(
                Object.entries(formValues)
                    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            );

            const payload = {
                ...cleanPayload,
                specifications: specMap,
                industryType: industryType || 'ELECTRONICS',  // 🔥 Thêm industryType vào payload
                batches: formValues.batches || [],  // 🔥 Thêm batches vào payload
                unitConversions: formValues.unitConversions || [],  // 🔥 Thêm unitConversions vào payload
            };

            if (mode === 'create') {
                await createProduct(tenantId, payload);
                message.success('Tạo sản phẩm thành công');
                form.resetFields();
                setSelectedCategory(null);
                onSuccess();
            } else if (mode === 'edit') {
                await updateProduct(tenantId, productData.id, payload);
                message.success('Cập nhật sản phẩm thành công');
                onSuccess();
            }
        } catch (error) {
            console.error('Form error:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error('Xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==================== XỬ LÝ CATEGORY CHANGE ====================
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedBrand(null);
        setSelectedModel(null);
        setModelOptions([]);
        setShowQuickSpecsAlert(false);
        form.setFieldValue('brand', undefined);
        
        // 🔥 NEW: Nếu là Grocery, load Grocery specs từ danh mục
        if (industryType === 'GROCERY') {
            const grocerySpecs = getGrocerySpecs(category);
            if (grocerySpecs && grocerySpecs.length > 0) {
                // Convert Grocery specs thành format specs array
                const specDefinitions = grocerySpecs.map((spec) => ({
                    key: spec.name,
                    label: spec.label,
                    type: spec.type || 'input',
                    placeholder: spec.placeholder || '',
                    options: spec.options || [],
                }));
                setModelSpecs(specDefinitions);
                
                // Initialize form specifications với default values
                const initialFormValues = specDefinitions.map((spec) => ({
                    key: spec.label,
                    value: ''  // Default: rỗng
                }));
                form.setFieldValue('specifications', initialFormValues);
                setShowQuickSpecsAlert(true);
            }
        } else {
            // Electronics: Reset model specs và chờ select model để load specs
            setModelSpecs([]);
        }
        
        // ✅ KHÔNG reset form specifications - giữ dữ liệu cũ của user
    };

    // ==================== XỬ LÝ BRAND CHANGE ====================
    const handleBrandChange = (brand) => {
        setSelectedBrand(brand);
        setSelectedModel(null);
        setShowQuickSpecsAlert(false);
        
        // 🔥 SỬA Ở ĐÂY: Phân tách logic giữa Điện tử và Tạp hóa
        if (industryType === 'ELECTRONICS') {
            // Điện tử: Xóa specs cũ để ép người dùng chọn lại Model mới
            setModelSpecs([]); 
            
            if (brand && BRAND_MODELS[brand]) {
                const models = getModelsByBrand(brand);
                setModelOptions(models);
            } else {
                setModelOptions([]);
            }
        } else {
            // Tạp hóa: KHÔNG XÓA modelSpecs vì thông số đi theo Danh mục, không đi theo Hãng.
            // (Giữ nguyên form nhập thông số cho người dùng)
        }
    };
    // ==================== XỬ LÝ MODEL CHANGE ====================
    const handleModelChange = (modelId) => {
        // 🔥 Chỉ cho phép model change nếu là ELECTRONICS
        if (industryType !== 'ELECTRONICS') {
            return;
        }

        if (!selectedBrand || !selectedCategory || !modelId) {
            message.warning('Vui lòng chọn hãng và danh mục trước');
            return;
        }

        setSelectedModel(modelId);
        
        // ✅ Cập nhật form field 'model' để hiển thị giá trị được chọn
        form.setFieldValue('model', modelId);
        
        const model = getModelById(selectedBrand, modelId);
        
        if (!model) {
            message.warning('Không tìm thấy model này');
            setModelSpecs([]);
            form.setFieldValue('specifications', []);
            return;
        }

        // ✅ Tạo spec DEFINITIONS (labels, types, options) - KHÔNG bao gồm values
        // Form sẽ quản lý values để tránh mất dữ liệu khi re-render
        let specDefinitions = [];

        // 1️⃣ Thêm Model Name
        specDefinitions.push({
            key: 'Model',
            label: 'Model',
            type: 'input',
            placeholder: model.name,
            editable: false
        });

        // 2️⃣ Thêm Storage Options (dung lượng) làm SELECT
        if (model.storageOptions && model.storageOptions.length > 0) {
            specDefinitions.push({
                key: 'Dung lượng',
                label: 'Dung lượng',
                type: 'select',
                options: model.storageOptions,
                placeholder: 'Chọn dung lượng'
            });
        }

        // 3️⃣ Thêm Colors (màu sắc) làm SELECT
        if (model.colors && model.colors.length > 0) {
            specDefinitions.push({
                key: 'Màu',
                label: 'Màu',
                type: 'select',
                options: model.colors,
                placeholder: 'Chọn màu sắc'
            });
        }

        // 4️⃣ Thêm các specs khác từ model.specs (nếu có)
        if (model.specs && Object.keys(model.specs).length > 0) {
            Object.entries(model.specs).forEach(([key, value]) => {
                // Skip keys đã thêm ở trên để tránh trùng
                if (key.toLowerCase() !== 'dung lượng' && key.toLowerCase() !== 'màu' && key !== 'Model') {
                    specDefinitions.push({
                        key: key,
                        label: key,
                        type: 'input',
                        placeholder: value || ''
                    });
                }
            });
        }

        // ✅ Set spec definitions - chỉ quản lý structure, không quản lý values
        setModelSpecs(specDefinitions);

        // ✅ Khởi tạo form values với default values từ model
        // Default: model name, first storage option, first color, specs từ model
        const initialFormValues = specDefinitions.map((spec) => {
            let defaultValue = '';
            
            if (spec.key === 'Model') {
                defaultValue = model.name;
            } else if (spec.key === 'Dung lượng' && model.storageOptions && model.storageOptions.length > 0) {
                defaultValue = model.storageOptions[0];
            } else if (spec.key === 'Màu' && model.colors && model.colors.length > 0) {
                defaultValue = model.colors[0];
            } else if (model.specs && model.specs[spec.key]) {
                defaultValue = model.specs[spec.key];
            }
            
            return {
                key: spec.key,
                value: defaultValue
            };
        });

        // ✅ Set form specifications - form sẽ quản lý values từ đây
        form.setFieldValue('specifications', initialFormValues);

        if (specDefinitions.length > 0) {
            message.success(`✅ Đã tải ${specDefinitions.length} thông số của ${model.name}`);
        }
    };

    // ==================== RENDER DYNAMIC SPEC FIELD ====================
    // 🔥 FIX: Hiển thị specs cho CÙNG Electronics (has model) VÀ Grocery (no model)
    const specs = modelSpecs.length > 0 ? modelSpecs : [];

    if (!visible) {
        return null;
    }

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        <svg
                            className={styles.modalTitleIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        {mode === 'edit' ? '✏️ Cập nhật sản phẩm' : '➕ Tạo sản phẩm mới'}
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onCancel}
                        type="button"
                        aria-label="Đóng"
                    >
                        <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <Form
                        form={form}
                        layout="vertical"
                        autoComplete="off"
                    >
                        {/* Section 1: Basic Info */}
                        <SectionBasicInfo
                            form={form}
                            mode={mode}
                            industryType={industryType}
                            selectedCategory={selectedCategory}
                            selectedBrand={selectedBrand}
                            modelOptions={modelOptions}
                            handleCategoryChange={handleCategoryChange}
                            handleBrandChange={handleBrandChange}
                            handleModelChange={handleModelChange}
                            availableCategories={availableCategories} // 🔥 THÊM DÒNG NÀY 
                        />
                        {console.log('🔥 DEBUG ProductFormModal - Passing industryType to SectionBasicInfo:', industryType)}

                        {/* Section 2: Dynamic Specs */}
                        <SectionDynamicSpecs
                            form={form}
                            selectedCategory={selectedCategory}
                            specs={specs}
                            showQuickSpecsAlert={showQuickSpecsAlert}
                            setShowQuickSpecsAlert={setShowQuickSpecsAlert}
                        />

                        {/* Section 3: Pricing & Inventory */}
                        <SectionPricingInventory form={form} />

                        {/* 🔥 NEW SECTION: Batch Management (GROCERY ONLY) */}
                        {industryType === 'GROCERY' && (
                            <SectionBatchManagement
                                form={form}
                                industryType={industryType}
                            />
                        )}

                        {/* 🔥 NEW SECTION: Unit Conversion (GROCERY ONLY) */}
                        {industryType === 'GROCERY' && (
                            <SectionUnitConversion
                                form={form}
                                industryType={industryType}
                                mainUnit={form.getFieldValue('mainUnit') || 'Cái'}
                            />
                        )}
                    </Form>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.btn + ' ' + styles.btnDefault}
                        onClick={onCancel}
                        type="button"
                        disabled={isSubmitting}
                    >
                        Hủy thao tác
                    </button>
                    <button
                        className={styles.btn + ' ' + styles.btnPrimary}
                        onClick={handleSubmit}
                        type="button"
                        disabled={isSubmitting}
                    >
                        <svg
                            className={styles.btnIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                        </svg>
                        {isSubmitting ? 'Đang lưu...' : (mode === 'edit' ? 'Cập nhật' : 'Lưu sản phẩm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
