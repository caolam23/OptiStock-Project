import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusOutlined, UploadOutlined, ClearOutlined } from '@ant-design/icons';
import { message, Row, Col, Select } from 'antd';
import styles from './Products.module.css';
import ProductTable from './components/ProductTable';
import ProductSearch from './components/ProductSearch';
import ProductFormModal from './components/ProductFormModal';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import BulkImportDrawer from './components/BulkImportDrawer';
// 🔥 SỬA Ở ĐÂY: Import thêm getProductCategories
import { getProducts, deleteProduct, getProductCategories } from '../../api/productApi';
import { getBrandsByCategory } from '../../utils/brandModels';
import { CATEGORY_SPECS } from './components/CategorySpecsConfig';

// ========== HELPER FUNCTIONS ==========

/**
 * Lấy danh sách tất cả danh mục từ CategorySpecsConfig.js (Dùng làm fallback dự phòng)
 * Trả về array of {label, value} để dùng cho Select component
 * @returns {Array} [{label: "Điện thoại", value: "Điện thoại"}, ...]
 */
const getAllCategories = () => {
    return Object.keys(CATEGORY_SPECS).map((category) => ({
        label: category,           // VD: "Điện thoại"
        value: category,           // VD: "Điện thoại"
    }));
};

/**
 * Debounce utility: Trì hoãn gọi hàm cho đến khi người dùng ngừng hành động
 * @param {Function} func - Hàm cần debounce
 * @param {number} delay - Thời gian trì hoãn (ms)
 * @returns {Function} Hàm debounced
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// ========== MAIN COMPONENT ==========
const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    
    // ========== PAGINATION STATES ==========
    const [currentPage, setCurrentPage] = useState(1);      // UI: 1-indexed
    const [pageSize, setPageSize] = useState(10);          // Default 10 items per page
    const [totalProducts, setTotalProducts] = useState(0); // Total number of products

    // ========== FILTER STATES ==========
    const [filterCategory, setFilterCategory] = useState(null);      // Category filter
    const [filterBrand, setFilterBrand] = useState(null);            // Brand filter
    const [filterStockStatus, setFilterStockStatus] = useState(null); // Stock status filter
    
    // ========== DERIVED STATES ==========
    const [availableBrands, setAvailableBrands] = useState([]);      // Brands for selected category
    // 🔥 SỬA Ở ĐÂY: Thêm state chứa danh mục động theo ngành hàng
    const [availableCategories, setAvailableCategories] = useState([]);
    const debouncedSearchRef = useRef(null);                          // Ref để lưu debounced search function

    // Lấy tenantId từ localStorage hoặc URL
    const getTenantId = () => {
        try {
            const workspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            return workspace?.id || null;
        } catch (_) {
            return null;
        }
    };

    /**
     * Lấy industryType từ workspace hiện tại
     * @returns {string} 'ELECTRONICS' hoặc 'GROCERY'
     */
    /**
     * 🔥 SỬA: Đọc đúng 'industryCode' từ backend ('fmcg' hoặc 'electronics')
     * và chuyển đổi sang type mà frontend đang dùng ('GROCERY', 'ELECTRONICS')
     */
    const getIndustryType = () => {
        try {
            const workspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            const code = workspace?.industryCode; // Backend trả về trường này
            
            if (code === 'fmcg') return 'GROCERY';
            if (code === 'electronics') return 'ELECTRONICS';
            
            return workspace?.industryType || 'ELECTRONICS';  // Fallback
        } catch (_) {
            return 'ELECTRONICS';
        }
    };

    const tenantId = getTenantId();
    const currentIndustryType = getIndustryType();
    
    // 🔥 DEBUG
    console.log('🔥 DEBUG Products.jsx - currentIndustryType:', currentIndustryType);
    console.log('🔥 DEBUG Products.jsx - workspace:', JSON.parse(localStorage.getItem('currentWorkspace')));

    // ========== CORE: Load Products ==========
    const loadProducts = useCallback(async (
        keyword = '', 
        page = 1, 
        size = 10,
        category = null,
        brand = null,
        stockStatus = null,
        industryType = null
    ) => {
        try {
            setLoading(true);
            
            // Convert UI page (1-indexed) to Backend page (0-indexed)
            const backendPage = Math.max(0, page - 1);
            
            // BUILD PARAMS OBJECT
            const params = {
                page: backendPage,
                size: size,
            };
            
            if (keyword && keyword.trim()) {
                params.search = keyword.trim();
            }

            if (category) {
                params.category = category;
            }

            if (brand) {
                params.brand = brand;
            }

            if (stockStatus) {
                params.stockStatus = stockStatus;
            }

            if (industryType) {
                params.industryType = industryType;
            }
            
            const response = await getProducts(tenantId, params);
            
            if (response && Array.isArray(response.data)) {
                setProducts(response.data);
                setTotalProducts(response.totalElements || 0);
                setCurrentPage(page);
                setPageSize(size);
            } else if (Array.isArray(response)) {
                setProducts(response);
                setTotalProducts(response.length);
                setCurrentPage(page);
                setPageSize(size);
            }
        } catch (error) {
            console.error('❌ [loadProducts] Error:', error);
            message.error('Không thể tải danh sách sản phẩm');
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    // ========== Handle Search ==========
    const handleSearch = (searchData) => {
        if (searchData.type === 'keyword') {
            setSearchKeyword(searchData.keyword);
            setCurrentPage(1);
        } else if (searchData.id) {
            setSearchKeyword(searchData.productName || searchData.productCode);
            setCurrentPage(1);
        }
    };

    // ========== Handle Category Change ==========
    const handleCategoryChange = (value) => {
        setFilterCategory(value);
        setFilterBrand(null);
        setCurrentPage(1);
    };

    // ========== Handle Brand Change ==========
    const handleBrandChange = (value) => {
        setFilterBrand(value);
        setCurrentPage(1);
    };

    // ========== Handle Stock Status Change ==========
    const handleStockStatusChange = (value) => {
        setFilterStockStatus(value);
        setCurrentPage(1);
    };

    // ========== Clear All Filters ==========
    const handleClearAllFilters = () => {
        setSearchKeyword('');
        setFilterCategory(null);
        setFilterBrand(null);
        setFilterStockStatus(null);
        setCurrentPage(1);
        setAvailableBrands([]);
    };

    // ========== Handle Pagination Change ==========
    const handlePaginationChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleProductCreated = () => {
        setModalVisible(false);
        setCurrentPage(1);
    };

    const handleBulkImportSuccess = () => {
        setDrawerVisible(false);
        setCurrentPage(1);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setEditModalVisible(true);
    };

    const handleProductUpdated = () => {
        setEditModalVisible(false);
        setEditingProduct(null);
    };

    const handleDelete = async (productId) => {
        try {
            setLoading(true);
            const response = await deleteProduct(tenantId, productId);
            
            if (response.success) {
                message.success(response.message || 'Xóa sản phẩm thành công');
                // Gọi lại API tải list (trigger bằng useEffect loadProducts hoặc gọi lại trực tiếp)
                loadProducts(searchKeyword, currentPage, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
            } else {
                message.error(response.message || 'Xóa sản phẩm thất bại');
            }
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
            message.error(error.response?.data?.message || error.message || 'Lỗi xóa sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProduct = (product) => {
        setSelectedDetailProduct(product);
        setDetailDrawerVisible(true);
    };

    const handleDetailDrawerClose = () => {
        setDetailDrawerVisible(false);
        setSelectedDetailProduct(null);
    };

    // ========== SIDE EFFECTS ==========

    /**
     * 🔥 SỬA Ở ĐÂY: Thêm Effect lấy danh mục theo ngành hàng từ Backend
     */
    useEffect(() => {
        if (!tenantId) return;

        const loadCategories = async () => {
            try {
                const response = await getProductCategories(tenantId);
                if (response && response.success && response.categories) {
                    const dynamicCategories = response.categories.map(cat => ({
                        label: cat,
                        value: cat
                    }));
                    setAvailableCategories(dynamicCategories);
                }
            } catch (error) {
                console.error('❌ Lỗi tải danh mục sản phẩm theo ngành hàng:', error);
                // Dự phòng nếu API lỗi: lấy toàn bộ từ config tĩnh
                setAvailableCategories(getAllCategories());
            }
        };

        loadCategories();
    }, [tenantId]);

    /**
     * EFFECT 1: Update available brands list khi category thay đổi
     */
    useEffect(() => {
        if (filterCategory) {
            const brands = getBrandsByCategory(filterCategory);
            setAvailableBrands(brands);
        } else {
            setAvailableBrands([]);
        }
    }, [filterCategory]);

    /**
     * EFFECT 2: Reload products khi filter thay đổi
     */
    useEffect(() => {
        if (!tenantId) return;
        setCurrentPage(1);
        loadProducts(searchKeyword, 1, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory, filterBrand, filterStockStatus, tenantId, currentIndustryType]);

    /**
     * EFFECT 3: Reload products khi Pagination thay đổi
     */
    useEffect(() => {
        if (!tenantId || currentPage < 1) return;
        loadProducts(searchKeyword, currentPage, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, tenantId, currentIndustryType]);

    /**
     * EFFECT 4: Debounce Search
     */
    useEffect(() => {
        if (!tenantId) return;
        
        const debounceTimer = setTimeout(() => {
            setCurrentPage(1);
            loadProducts(searchKeyword, 1, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        }, 300);

        return () => clearTimeout(debounceTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchKeyword, tenantId, currentIndustryType]);

    /**
     * EFFECT 5: Initial load
     */
    useEffect(() => {
        if (!tenantId) return;
        loadProducts('', 1, pageSize, null, null, null, currentIndustryType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, currentIndustryType]);

    return (
        <div className={styles.pageContainer}>
            {/* ========== PAGE HEADER ========== */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>Sản phẩm</h1>
                    <p className={styles.pageSubtitle}>
                        Quản lý danh mục sản phẩm, tồn kho và nhập/xuất hàng loạt
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={`${styles.actionButton} ${styles.addProductBtn}`}
                        onClick={() => setModalVisible(true)}
                    >
                        <PlusOutlined /> Thêm sản phẩm
                    </button>
                    <button
                        className={`${styles.actionButton} ${styles.bulkImportBtn}`}
                        onClick={() => setDrawerVisible(true)}
                    >
                        <UploadOutlined /> Nhập từ Excel
                    </button>
                </div>
            </div>

            {/* ========== FILTER BAR: SEARCH & ADVANCED FILTERS ========== */}
            <div className={styles.filterBarContainer}>
                <Row gutter={16} align="middle" style={{ width: '100%' }}>
                    {/* COLUMN 1: Search Input */}
                    <Col xs={24} sm={24} md={6} lg={6}>
                        <ProductSearch 
                            tenantId={tenantId}
                            onSearch={handleSearch}
                            placeholder="Tìm theo mã SKU hoặc tên sản phẩm..."
                            maxResults={10}
                        />
                    </Col>

                    {/* COLUMN 2: Category Select */}
                    <Col xs={24} sm={12} md={4} lg={4}>
                        <Select
                            allowClear
                            placeholder="Chọn danh mục"
                            value={filterCategory}
                            onChange={handleCategoryChange}
                            options={availableCategories} // 🔥 SỬA Ở ĐÂY: Dùng biến state động
                            style={{ width: '100%' }}
                            size="middle"
                        />
                    </Col>

                    {/* COLUMN 3: Brand Select */}
                    <Col xs={24} sm={12} md={4} lg={4}>
                        <Select
                            allowClear
                            placeholder="Chọn hãng sản xuất"
                            value={filterBrand}
                            onChange={handleBrandChange}
                            disabled={!filterCategory || availableBrands.length === 0}
                            options={availableBrands}
                            style={{ width: '100%' }}
                            size="middle"
                        />
                    </Col>

                    {/* COLUMN 4: Stock Status Select */}
                    <Col xs={24} sm={12} md={5} lg={5}>
                        <Select
                            allowClear
                            placeholder="Trạng thái tồn kho"
                            value={filterStockStatus}
                            onChange={handleStockStatusChange}
                            options={[
                                { label: '📉 Sắp hết hàng (Tồn < Min)', value: 'LOW_STOCK' },
                                { label: '🚫 Hết hàng (Tồn = 0)', value: 'OUT_OF_STOCK' },
                                { label: '📈 Tồn đọng (Tồn > Max)', value: 'OVERSTOCK' }
                            ]}
                            style={{ width: '100%' }}
                            size="middle"
                        />
                    </Col>

                    {/* COLUMN 5: Clear Filters Button */}
                    <Col xs={24} sm={12} md={5} lg={5}>
                        <button
                            className={styles.clearFiltersBtn}
                            onClick={handleClearAllFilters}
                            style={{ width: '100%' }}
                        >
                            <ClearOutlined /> Khôi phục
                        </button>
                    </Col>
                </Row>

                {/* Display active filters info */}
                {(searchKeyword || filterCategory || filterBrand || filterStockStatus) && (
                    <div className={styles.activeFiltersInfo} style={{ marginTop: '12px' }}>
                        <span>Bộ lọc đang áp dụng:</span>
                        {searchKeyword && <span className={styles.filterTag}>🔍 {searchKeyword}</span>}
                        {/* 🔥 SỬA Ở ĐÂY: Cập nhật tag hiển thị theo availableCategories */}
                        {filterCategory && <span className={styles.filterTag}>📁 {availableCategories.find(c => c.value === filterCategory)?.label || filterCategory}</span>}
                        {filterBrand && <span className={styles.filterTag}>🏢 {availableBrands.find(b => b.value === filterBrand)?.label}</span>}
                        {filterStockStatus && (
                            <span className={styles.filterTag}>
                                {filterStockStatus === 'LOW_STOCK' && '📉 Sắp hết hàng'}
                                {filterStockStatus === 'OUT_OF_STOCK' && '🚫 Hết hàng'}
                                {filterStockStatus === 'OVERSTOCK' && '📈 Tồn đọng'}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ========== PRODUCTS TABLE ========== */}
            <ProductTable 
                products={products} 
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleViewProduct}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalProducts,
                    onChange: handlePaginationChange
                }}
                industryType={currentIndustryType}
            />

            {/* ========== MODAL: THÊM SẢN PHẨM / SỬA SẢN PHẨM ========== */}
            <ProductFormModal
                visible={modalVisible || editModalVisible}
                mode={editModalVisible ? 'edit' : 'create'}
                tenantId={tenantId}
                industryType={currentIndustryType}
                productData={editingProduct}
                availableCategories={availableCategories} 
                onCancel={() => {
                    setModalVisible(false);
                    setEditModalVisible(false);
                    setEditingProduct(null);
                }}
                onSuccess={() => {
                    if (editModalVisible) {
                        handleProductUpdated();
                    } else {
                        handleProductCreated();
                    }
                }}
            />

            {/* ========== DRAWER: NHẬP FILE EXCEL ========== */}
            <BulkImportDrawer
                visible={drawerVisible}
                tenantId={tenantId}
                industryType={currentIndustryType}
                onClose={() => setDrawerVisible(false)}
                onSuccess={handleBulkImportSuccess}
            />

            {/* ========== DRAWER: XEM CHI TIẾT SẢN PHẨM ========== */}
            <ProductDetailDrawer
                visible={detailDrawerVisible}
                product={selectedDetailProduct}
                industryType={currentIndustryType}
                onClose={handleDetailDrawerClose}
            />
        </div>
    );
};

export default Products;