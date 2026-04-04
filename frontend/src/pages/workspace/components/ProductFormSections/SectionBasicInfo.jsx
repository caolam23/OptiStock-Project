import React, { useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { getSpecsForCategory, getAllCategories, PRODUCT_CONDITIONS } from '../CategorySpecsConfig';
import { BRAND_MODELS, getModelsByBrand, getBrandsByCategory } from '../../../../utils/brandModels';
import { GROCERY_CATEGORIES, getGroceryCategoryLabel } from '../../../../utils/GroceryCategoryConfig';
import styles from './SectionBasicInfo.module.css';
import { GROCERY_BRANDS } from '../../../../utils/brandModels/data/groceryBrands';

const SectionBasicInfo = ({
    form,
    mode,
    industryType = 'ELECTRONICS',
    selectedCategory,
    selectedBrand,
    modelOptions,
    handleCategoryChange,
    handleBrandChange,
    handleModelChange,
}) => {
    // 🔥 TRẠNG THÁI CHUNG: Lưu trữ Nhóm hàng con cho ngành GROCERY
    const [subCategory, setSubCategory] = useState(null);

    React.useEffect(() => {
        if (mode === 'edit') {
            const formSubCategory = form.getFieldValue('subCategory');
            if (formSubCategory) {
                setSubCategory(formSubCategory);
            }
        }
    }, [mode, selectedCategory, form]);

    // 🎯 Hàm bọc: Khi người dùng đổi Danh mục
    const onMainCategoryChange = (val) => {
        setSubCategory(null); // Xóa trắng nhóm hàng con
        form.setFieldValue('subCategory', undefined);
        form.setFieldValue('brand', undefined); // Xóa trắng hãng
        handleCategoryChange(val); // Gọi hàm gốc
    };

    // 🎯 Hàm xử lý: Khi người dùng chọn Nhóm hàng con (GROCERY)
    const onSubCategoryChange = (val) => {
        setSubCategory(val); 
        form.setFieldValue('brand', undefined); 
        handleBrandChange(null);
    };

    /**
     * 🔥 Lấy danh sách danh mục dựa vào ngành hàng (GIỮ NGUYÊN LOGIC CODE 1 CHO ĐIỆN TỬ)
     */
    const getCategoriesForIndustry = () => {
        if (industryType === 'GROCERY') {
            // Ngành Tạp hóa: Lấy từ GROCERY_CATEGORIES
            return Object.keys(GROCERY_CATEGORIES).map((categoryKey) => ({
                label: GROCERY_CATEGORIES[categoryKey].label,
                value: categoryKey,
            }));
        } else {
            // Ngành Điện tử: Lấy chuẩn xác từ CategorySpecsConfig
            return getAllCategories().map(cat => ({
                label: cat,
                value: cat
            }));
        }
    };

    // 🌟 TIỀN XỬ LÝ (GROCERY): Tìm KEY chuẩn của Danh mục đang chọn để xác định phân tầng
    let categoryKey = selectedCategory;
    if (industryType === 'GROCERY' && selectedCategory && !GROCERY_CATEGORIES[selectedCategory]) {
        const searchKey = selectedCategory.toLowerCase().trim();
        const safeCategoryMap = {
            'tươi sống': 'FRESH_FOOD',
            'thực phẩm khô': 'DRY_FOOD',
            'đồ uống': 'BEVERAGES',
            'bánh kẹo': 'CONFECTIONERY',
            'gia vị': 'SPICES_SEASONINGS',
            'đông lạnh': 'FROZEN',
            'hóa mỹ phẩm': 'COSMETICS_TOILETRIES',
            'mẹ': 'BABY_CARE', 
            'thú cưng': 'PET_CARE',
            'sức khỏe': 'HEALTH_SUPPLEMENTS',
            'thuốc': 'HEALTH_SUPPLEMENTS'
        };
        for (const [vnName, engKey] of Object.entries(safeCategoryMap)) {
            if (searchKey.includes(vnName)) {
                categoryKey = engKey;
                break;
            }
        }
    }

    // ĐÃ BỔ SUNG ĐẦY ĐỦ 10 NGÀNH PHÂN TẦNG 
    const isCascadingCategory = 
        categoryKey === 'BABY_CARE' || 
        categoryKey === 'BEVERAGES' || 
        categoryKey === 'CONFECTIONERY' || 
        categoryKey === 'COSMETICS_TOILETRIES' ||
        categoryKey === 'DRY_FOOD' ||
        categoryKey === 'FRESH_FOOD' ||
        categoryKey === 'FROZEN' ||
        categoryKey === 'HEALTH_SUPPLEMENTS' ||
        categoryKey === 'PET_CARE' ||
        categoryKey === 'SPICES_SEASONINGS'; // Bổ sung Gia vị

    const getSubCategoryOptions = () => {
        if (categoryKey === 'BABY_CARE') {
            return [
                { label: '🍼 Sữa bột & Dinh dưỡng', value: 'BABY_MILK' },
                { label: '🧻 Tã, Bỉm & Vệ sinh', value: 'BABY_DIAPER' },
                { label: '🥣 Thực phẩm ăn dặm', value: 'BABY_FOOD' },
                { label: '🧸 Đồ dùng & Phụ kiện bé', value: 'BABY_GEAR' },
            ];
        }
        if (categoryKey === 'BEVERAGES') {
            return [
                { label: '🥤 Nước ngọt có gas', value: 'BEV_SODA' },
                { label: '🧃 Trà đóng chai / Giải khát', value: 'BEV_TEA' },
                { label: '💧 Nước suối / khoáng', value: 'BEV_WATER' },
                { label: '🥛 Sữa & Sản phẩm từ sữa', value: 'BEV_MILK' },
                { label: '🧋 Sữa thực vật', value: 'BEV_PLANT_MILK' },
                { label: '🍊 Nước ép / Trái cây', value: 'BEV_JUICE' },
                { label: '☕ Cà phê', value: 'BEV_COFFEE' },
                { label: '🍵 Trà pha', value: 'BEV_BREW_TEA' },
                { label: '🍺 Bia / Có cồn', value: 'BEV_BEER' },
                { label: '⚡ Nước tăng lực', value: 'BEV_ENERGY' },
                { label: '🧊 Khác', value: 'BEV_OTHER' },
            ];
        }
        if (categoryKey === 'CONFECTIONERY') {
            return [
                { label: '🇻🇳 Bánh kẹo thương hiệu Việt', value: 'CONF_VN' },
                { label: '🍪 Bánh quy / Bánh quy bơ', value: 'CONF_INTL' },
                { label: '🍫 Sô-cô-la (Chocolate)', value: 'CONF_CHOCO' },
                { label: '🍬 Kẹo / Kẹo dẻo / Gum', value: 'CONF_CANDY' },
                { label: '🍘 Snack / Bim Bim', value: 'CONF_SNACK' },
                { label: '🍰 Bánh tươi / Bánh ngọt', value: 'CONF_CAKE' },
                { label: '🏢 Khác / Tập đoàn Đa quốc gia', value: 'CONF_CORP' },
            ];
        }
        if (categoryKey === 'COSMETICS_TOILETRIES') {
            return [
                { label: '🧺 Giặt giũ', value: 'COS_LAUNDRY' },
                { label: '🧴 Skincare', value: 'COS_SKINCARE' },
                { label: '💄 Hóa mỹ phẩm / Gia dụng khác', value: 'COS_OTHER' },
            ];
        }
        if (categoryKey === 'DRY_FOOD') {
            return [
                { label: '🍜 Mì gói', value: 'DRY_NOODLE' },
                { label: '🍚 Gạo', value: 'DRY_RICE' },
                { label: '🥫 Thực phẩm khô / Đồ hộp / Khác', value: 'DRY_OTHER' },
            ];
        }
        if (categoryKey === 'FRESH_FOOD') {
            return [
                { label: '🥩 Thịt', value: 'FRESH_MEAT' },
                { label: '🥬 Rau củ', value: 'FRESH_VEGGIE' },
                { label: '🍎 Thủy sản / Trái cây / Khác', value: 'FRESH_OTHER' },
            ];
        }
        if (categoryKey === 'FROZEN') {
            return [
                { label: '🍦 Kem', value: 'FROZEN_ICE_CREAM' },
                { label: '🦐 Hải sản', value: 'FROZEN_SEAFOOD' },
                { label: '🥩 Thực phẩm đông lạnh / Khác', value: 'FROZEN_OTHER' },
            ];
        }
        if (categoryKey === 'HEALTH_SUPPLEMENTS') {
            return [
                { label: '💊 Vitamin tổng hợp', value: 'HEALTH_VITAMIN' },
                { label: '🧃 Tiêu hóa / Men vi sinh', value: 'HEALTH_DIGESTIVE' },
                { label: '🌿 Chăm sóc sức khỏe / Khác', value: 'HEALTH_OTHER' },
            ];
        }
        if (categoryKey === 'PET_CARE') {
            return [
                { label: '🐶 Thức ăn chó', value: 'PET_DOG_FOOD' },
                { label: '🧻 Cát mèo', value: 'PET_CAT_LITTER' },
                { label: '🐱 Thức ăn mèo / Phụ kiện / Khác', value: 'PET_OTHER' },
            ];
        }
        // Thêm nhóm SPICES_SEASONINGS
        if (categoryKey === 'SPICES_SEASONINGS') {
            return [
                { label: '🐟 Nước mắm', value: 'SPICE_FISH_SAUCE' },
                { label: '🛢️ Dầu ăn', value: 'SPICE_OIL' },
                { label: '🧂 Gia vị nêm nếm / Khác', value: 'SPICE_OTHER' },
            ];
        }

        return [];
    };

    const getBrandsForSelectedCategory = () => {
        if (!selectedCategory) return [];

        let brands = [];

        if (industryType === 'GROCERY') {
            if (isCascadingCategory) {
                if (!subCategory) return []; 
                brands = GROCERY_BRANDS[subCategory] || [];
            } else {
                if (typeof GROCERY_BRANDS !== 'undefined' && GROCERY_BRANDS[categoryKey]) {
                    brands = GROCERY_BRANDS[categoryKey];
                } else {
                    brands = getBrandsByCategory(categoryKey) || [];
                }
            }

            if (brands.length === 0) {
                 return [
                    { label: 'Thương hiệu nội địa', value: 'Thương hiệu nội địa' },
                    { label: 'Thương hiệu nhập khẩu', value: 'Thương hiệu nhập khẩu' },
                    { label: 'Khác...', value: 'Khác...' }
                 ];
            }

            // CHỐT CHẶN AN TOÀN: Xóa bỏ mọi giá trị trùng lặp để chống lỗi UI của Ant Design
            const uniqueBrands = Array.from(new Set(brands));
            return uniqueBrands.map((brandName) => ({ label: brandName, value: brandName }));

        } else {
            return Object.entries(BRAND_MODELS)
                .filter(([key, b]) => b.category === selectedCategory)
                .map(([key, b]) => ({ label: b.label, value: key }));
        }
    };

    return (
        <div className={styles.sectionBox}>
            <div className={styles.sectionTitle}>
                <svg className={styles.sectionTitleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Thông tin cơ bản
            </div>

            <div className={styles.formGrid}>
                {/* 1. MÃ SKU */}
                <div className={styles.formGroup}>
                    <Form.Item label={<span>Mã SKU<span className={styles.requiredToken}> *</span></span>} name="productCode" rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }, { pattern: /^[A-Z0-9\-]+$/, message: 'SKU chỉ được chứa chữ, số và dấu gạch' }]} className={styles.formItemWrapper}>
                        <Input placeholder={industryType === 'GROCERY' ? 'VD: COCA-001' : 'VD: PHONE-001'} disabled={mode === 'edit'} className={styles.formControl} />
                    </Form.Item>
                </div>
                
                {/* 2. TÊN SẢN PHẨM */}
                <div className={styles.formGroup}>
                    <Form.Item label={<span>Tên sản phẩm<span className={styles.requiredToken}> *</span></span>} name="productName" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]} className={styles.formItemWrapper}>
                        <Input placeholder={industryType === 'GROCERY' ? 'VD: Nước Coca-Cola 1.5L' : 'VD: iPhone 15 Pro Max 256GB'} className={styles.formControl} />
                    </Form.Item>
                </div>

                {/* 5. DANH MỤC */}
                <div className={styles.formGroup}>
                    <Form.Item label={<span>Danh mục<span className={styles.requiredToken}> *</span></span>} name="category" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]} className={styles.formItemWrapper}>
                        <Select
                            placeholder={industryType === 'GROCERY' ? 'Chọn danh mục siêu thị' : 'Chọn danh mục điện tử'}
                            allowClear
                            disabled={mode === 'edit'}
                            onChange={onMainCategoryChange}
                            options={getCategoriesForIndustry()}
                            className={styles.selectWrapper}
                        />
                    </Form.Item>
                </div>

                {/* PHÂN LOẠI CHI TIẾT (Đẩy lên trước Hãng sản xuất để User chọn dễ hơn) */}
                {industryType === 'GROCERY' && isCascadingCategory && (
                    <div className={styles.formGroup}>
                        <Form.Item 
                            label={<span>Phân loại chi tiết<span className={styles.requiredToken}> *</span></span>} 
                            name="subCategory" 
                            rules={[{ required: true, message: 'Vui lòng chọn phân loại chi tiết' }]} 
                            className={styles.formItemWrapper}
                        >
                            <Select
                                placeholder="Chọn nhóm hàng chi tiết..."
                                allowClear
                                disabled={mode === 'edit'}  // 🔥 Chỉ hiển thị, không cho sửa khi edit
                                onChange={onSubCategoryChange}
                                options={getSubCategoryOptions()}
                                className={styles.selectWrapper}
                            />
                        </Form.Item>
                    </div>
                )}

                {/* 3. HÃNG SẢN XUẤT */}
                <div className={styles.formGroup}>
                    <Form.Item 
                        label={
                            <span>
                                Hãng sản xuất
                                {industryType === 'ELECTRONICS' && <span className={styles.requiredToken}> *</span>}
                                {industryType === 'GROCERY' && <span style={{ fontSize: '12px', color: '#999' }}>(Tùy chọn)</span>}
                            </span>
                        } 
                        name="brand" 
                        // For ELECTRONICS: brand is REQUIRED | For GROCERY: brand is OPTIONAL
                        rules={industryType === 'ELECTRONICS' ? [{ required: true, message: 'Vui lòng chọn hoặc nhập hãng' }] : []}
                        className={styles.formItemWrapper}
                    >
                        <Select
                            placeholder={selectedCategory ? 'Chọn hãng' : 'Chọn danh mục trước'}
                            allowClear
                            showSearch
                            disabled={mode === 'edit' ? true : (!selectedCategory || (industryType === 'GROCERY' && isCascadingCategory && !subCategory))}  // 🔥 Khi edit: disabled | Khi create: theo logic
                            optionFilterProp="label"
                            onChange={handleBrandChange}
                            options={getBrandsForSelectedCategory()}
                            className={styles.selectWrapper}
                        />
                    </Form.Item>
                </div>

                {/* 4. MODEL / DÒNG MÁY (CHỈ ĐIỆN TỬ) */}
                {industryType === 'ELECTRONICS' && (
                    <div className={styles.formGroup}>
                        <Form.Item label="Model / Dòng máy" name="model" className={styles.formItemWrapper}>
                            <Select placeholder={selectedBrand ? 'Chọn model' : 'Chọn hãng trước'} allowClear showSearch disabled={!selectedBrand || mode === 'edit'} optionFilterProp="label" onChange={handleModelChange} options={modelOptions} className={styles.selectWrapper} />
                        </Form.Item>
                    </div>
                )}

                {/* 6. TÌNH TRẠNG MÁY (CHỈ ĐIỆN TỬ) */}
                {industryType === 'ELECTRONICS' && (
                    <div className={styles.formGroup}>
                        <Form.Item label={<span>Tình trạng máy<span className={styles.requiredToken}> *</span></span>} name="condition" rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]} className={styles.formItemWrapper}>
                            <Select placeholder="Chọn tình trạng" disabled={mode === 'edit'} options={PRODUCT_CONDITIONS} className={styles.selectWrapper} />
                        </Form.Item>
                    </div>
                )}

                {/* 7. BẢO HÀNH (CHỈ ĐIỆN TỬ) */}
                {industryType === 'ELECTRONICS' && (
                    <div className={styles.formGroup}>
                        <Form.Item label="Bảo hành (Tháng)" name="warrantyMonths" className={styles.formItemWrapper}>
                            <InputNumber placeholder="VD: 12" min={0} className={styles.formControl} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionBasicInfo;