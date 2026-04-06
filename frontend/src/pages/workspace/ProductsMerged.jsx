import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusOutlined, UploadOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons';
import {
    ShoppingOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, WarningOutlined, 
    SearchOutlined, BarcodeOutlined, CheckCircleOutlined, SwapOutlined, InboxOutlined
} from '@ant-design/icons';
import { message, Row, Col, Select } from 'antd';
import styles from './Products.module.css';
import pageStyles from './WorkspacePage.module.css';
import s from './Personnel.module.css';
import ProductTable from './components/ProductTable';
import ProductSearch from './components/ProductSearch';
import ProductFormModal from './components/ProductFormModal';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import BulkImportDrawer from './components/BulkImportDrawer';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { getProducts, deleteProduct, getProductCategories } from '../../api/productApi';
import { getBrandsByCategory } from '../../utils/brandModels';
import { CATEGORY_SPECS } from './components/CategorySpecsConfig';

// ========== FORMATTING HELPERS ==========
const fmtVnd = (n) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';
const fmtNum = (n) => n != null ? n.toLocaleString('vi-VN') : '—';

const labelStyle = { 
    display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', 
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.3px' 
};

const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
    fontSize: 13, color: '#0F172A', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
};

// ========== STOCK LEVEL BADGE ==========
const StockBadge = ({ current, min }) => {
    if (current == null) return <span style={{ color: '#94A3B8' }}>—</span>;
    const low = min != null && current <= min;
    const empty = current === 0;
    if (empty) return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>Hết hàng</span>;
    if (low)   return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>Sắp hết ({current})</span>;
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: '#DCFCE7', color: '#16A34A' }}>{fmtNum(current)}</span>;
};

// ========== PRODUCT MODAL - MERGED VERSION ==========
/**
 * Combined modal for creating/editing products
 * Supports both the advanced form from Code1 and simple form from Code2
 */
const ProductModal = ({ 
    initial, 
    onSave, 
    onClose, 
    saving, 
    industryType = 'ELECTRONICS',
    availableCategories = []
}) => {
    const [form, setForm] = useState({
        productCode: initial?.productCode || '',
        productName: initial?.productName || '',
        category: initial?.category || '',
        description: initial?.description || '',
        price: initial?.price || '',
        cost: initial?.cost || '',
        mainUnit: initial?.mainUnit || '',
        minStock: initial?.minStock || '',
        maxStock: initial?.maxStock || '',
        supplier: initial?.supplier || '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto'
        }} onClick={onClose}>
            <div style={{ 
                background: '#fff', borderRadius: 16, padding: 28, maxWidth: 560, width: '100%', 
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)', margin: 'auto' 
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
                    {initial ? '✏️ Chỉnh sửa sản phẩm' : '📦 Thêm sản phẩm mới'}
                </h3>

                {/* Row 1: SKU & Unit */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Mã SKU *</label>
                        <input style={inputStyle} placeholder="SP-001, SKU123..." 
                            value={form.productCode} onChange={e => set('productCode', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Đơn vị chính *</label>
                        <input style={inputStyle} placeholder="Chai, Thùng, Cái..." 
                            value={form.mainUnit} onChange={e => set('mainUnit', e.target.value)} />
                    </div>
                </div>

                {/* Row 2: Product Name */}
                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Tên sản phẩm *</label>
                    <input style={inputStyle} placeholder="Tên đầy đủ sản phẩm..." 
                        value={form.productName} onChange={e => set('productName', e.target.value)} />
                </div>

                {/* Row 3: Category & Supplier */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Danh mục</label>
                        {availableCategories.length > 0 ? (
                            <select style={inputStyle} value={form.category} 
                                onChange={e => set('category', e.target.value)}>
                                <option value="">Chọn danh mục</option>
                                {availableCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input style={inputStyle} placeholder="Đồ uống, Bánh kẹo..." 
                                value={form.category} onChange={e => set('category', e.target.value)} />
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Nhà cung cấp</label>
                        <input style={inputStyle} placeholder="Tên NCC..." 
                            value={form.supplier} onChange={e => set('supplier', e.target.value)} />
                    </div>
                </div>

                {/* Row 4: Price & Cost */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Giá bán (VNĐ)</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" 
                            value={form.price} onChange={e => set('price', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Giá vốn (VNĐ)</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" 
                            value={form.cost} onChange={e => set('cost', e.target.value)} />
                    </div>
                </div>

                {/* Row 5: Min/Max Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                        <label style={labelStyle}>Tồn tối thiểu</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" 
                            value={form.minStock} onChange={e => set('minStock', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Tồn tối đa</label>
                        <input style={inputStyle} type="number" min={0} placeholder="0" 
                            value={form.maxStock} onChange={e => set('maxStock', e.target.value)} />
                    </div>
                </div>

                {/* Row 6: Description */}
                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Mô tả</label>
                    <input style={inputStyle} placeholder="Ghi chú thêm..." 
                        value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                    <button className={s.btnGhost} onClick={onClose} disabled={saving}>Hủy</button>
                    <button className={s.btnPrimary}
                        disabled={saving || !form.productCode.trim() || !form.productName.trim() || !form.mainUnit.trim()}
                        onClick={() => onSave(form)}>
                        {saving ? <LoadingOutlined spin /> : <CheckCircleOutlined />}
                        {initial ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get all categories from CATEGORY_SPECS as fallback
 * @returns {Array} [{label, value}, ...]
 */
const getAllCategories = () => {
    return Object.keys(CATEGORY_SPECS).map((category) => ({
        label: category,
        value: category,
    }));
};

/**
 * Debounce utility
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in ms
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// ========== DEMO DATA (Fallback) ==========
const DEMO_PRODUCTS = [
    { id: '1', productCode: 'BIA-330', productName: 'Bia lon 330ml', category: 'Đồ uống', price: 18000, cost: 12000, mainUnit: 'Lon', currentStock: 500, minStock: 50, supplier: 'Sabeco' },
    { id: '2', productCode: 'NUOC-500', productName: 'Nước suối chai 500ml', category: 'Đồ uống', price: 6000, cost: 3500, mainUnit: 'Chai', currentStock: 20, minStock: 100, supplier: 'Lavie' },
    { id: '3', productCode: 'BANH-1', productName: 'Bánh quy bơ hộp', category: 'Bánh kẹo', price: 45000, cost: 30000, mainUnit: 'Hộp', currentStock: 0, minStock: 20, supplier: 'Kinh Đô' },
    { id: '4', productCode: 'CF-100', productName: 'Cà phê hòa tan G7', category: 'Đồ uống', price: 65000, cost: 45000, mainUnit: 'Hộp', currentStock: 150, minStock: 30, supplier: 'Trung Nguyên' },
];

// ========== MAIN COMPONENT ==========
const Products = () => {
    // ========== AUTHENTICATION & SETUP ==========
    const { isWorkspaceManager } = useAuth();
    const canManage = isWorkspaceManager();

    // ========== PRODUCT STATES ==========
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDemo, setIsDemo] = useState(false);

    // ========== MODAL & DRAWER STATES ==========
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [showSimpleModal, setShowSimpleModal] = useState(false);

    // ========== EDIT & DETAIL STATES ==========
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
    const [editTarget, setEditTarget] = useState(null);

    // ========== SEARCH & FILTER STATES ==========
    const [searchKeyword, setSearchKeyword] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState(null);
    const [filterBrand, setFilterBrand] = useState(null);
    const [filterStockStatus, setFilterStockStatus] = useState(null);

    // ========== PAGINATION STATES ==========
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);

    // ========== DERIVED STATES ==========
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const debouncedSearchRef = useRef(null);

    // ========== GET WORKSPACE INFO ==========
    /**
     * Get tenantId from localStorage
     */
    const getTenantId = () => {
        try {
            const workspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            return workspace?.id || null;
        } catch (_) {
            return null;
        }
    };

    /**
     * Get industryType from workspace
     * @returns {string} 'ELECTRONICS' or 'GROCERY'
     */
    const getIndustryType = () => {
        try {
            const workspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            const code = workspace?.industryCode;
            
            if (code === 'fmcg') return 'GROCERY';
            if (code === 'electronics') return 'ELECTRONICS';
            
            return workspace?.industryType || 'ELECTRONICS';
        } catch (_) {
            return 'ELECTRONICS';
        }
    };

    const tenantId = getTenantId();
    const currentIndustryType = getIndustryType();

    console.log('🔥 DEBUG Products.jsx - currentIndustryType:', currentIndustryType);
    console.log('🔥 DEBUG Products.jsx - workspace:', JSON.parse(localStorage.getItem('currentWorkspace')));

    // ========== CORE: LOAD PRODUCTS (FROM API) ==========
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
                setIsDemo(false);
            } else if (Array.isArray(response)) {
                setProducts(response);
                setTotalProducts(response.length);
                setCurrentPage(page);
                setPageSize(size);
                setIsDemo(false);
            }
        } catch (error) {
            console.error('❌ [loadProducts] Error:', error);
            // Fallback to demo data
            if (error.response?.status === 404 || error.response?.status === 405) {
                setProducts(DEMO_PRODUCTS);
                setTotalProducts(DEMO_PRODUCTS.length);
                setIsDemo(true);
            } else {
                setError('Không thể tải danh sách sản phẩm: ' + (error.response?.data?.message || error.message));
                message.error('Không thể tải danh sách sản phẩm');
                setProducts([]);
                setTotalProducts(0);
            }
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    // ========== LOAD CATEGORIES FROM API ==========
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
                console.error('❌ Lỗi tải danh mục sản phẩm:', error);
                setAvailableCategories(getAllCategories());
            }
        };

        loadCategories();
    }, [tenantId]);

    // ========== EFFECT 1: Update available brands when category changes ==========
    useEffect(() => {
        if (filterCategory) {
            const brands = getBrandsByCategory(filterCategory);
            setAvailableBrands(brands);
        } else {
            setAvailableBrands([]);
        }
    }, [filterCategory]);

    // ========== EFFECT 2: Reload products when filters change ==========
    useEffect(() => {
        if (!tenantId) return;
        setCurrentPage(1);
        loadProducts(searchKeyword, 1, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory, filterBrand, filterStockStatus, tenantId, currentIndustryType]);

    // ========== EFFECT 3: Reload products when pagination changes ==========
    useEffect(() => {
        if (!tenantId || currentPage < 1) return;
        loadProducts(searchKeyword, currentPage, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, tenantId, currentIndustryType]);

    // ========== EFFECT 4: Debounce search ==========
    useEffect(() => {
        if (!tenantId) return;
        
        const debounceTimer = setTimeout(() => {
            setCurrentPage(1);
            loadProducts(searchKeyword, 1, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        }, 300);

        return () => clearTimeout(debounceTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchKeyword, tenantId, currentIndustryType]);

    // ========== EFFECT 5: Initial load ==========
    useEffect(() => {
        if (!tenantId) return;
        loadProducts('', 1, pageSize, null, null, null, currentIndustryType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, currentIndustryType]);

    // ========== HANDLE SEARCH ==========
    const handleSearch = (searchData) => {
        if (searchData.type === 'keyword') {
            setSearchKeyword(searchData.keyword);
            setCurrentPage(1);
        } else if (searchData.id) {
            setSearchKeyword(searchData.productName || searchData.productCode);
            setCurrentPage(1);
        }
    };

    // ========== HANDLE CATEGORY CHANGE ==========
    const handleCategoryChange = (value) => {
        setFilterCategory(value);
        setFilterBrand(null);
        setCurrentPage(1);
    };

    // ========== HANDLE BRAND CHANGE ==========
    const handleBrandChange = (value) => {
        setFilterBrand(value);
        setCurrentPage(1);
    };

    // ========== HANDLE STOCK STATUS CHANGE ==========
    const handleStockStatusChange = (value) => {
        setFilterStockStatus(value);
        setCurrentPage(1);
    };

    // ========== HANDLE PAGINATION CHANGE ==========
    const handlePaginationChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    // ========== CLEAR ALL FILTERS ==========
    const handleClearAllFilters = () => {
        setSearchKeyword('');
        setSearch('');
        setFilterCategory(null);
        setFilterBrand(null);
        setFilterStockStatus(null);
        setCurrentPage(1);
        setAvailableBrands([]);
    };

    // ========== HANDLE PRODUCT CREATED ==========
    const handleProductCreated = () => {
        setModalVisible(false);
        setShowSimpleModal(false);
        setCurrentPage(1);
        loadProducts('', 1, pageSize, null, null, null, currentIndustryType);
    };

    // ========== HANDLE PRODUCT UPDATED ==========
    const handleProductUpdated = () => {
        setEditModalVisible(false);
        setShowSimpleModal(false);
        setEditingProduct(null);
        setEditTarget(null);
        loadProducts(searchKeyword, currentPage, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
    };

    // ========== HANDLE BULK IMPORT SUCCESS ==========
    const handleBulkImportSuccess = () => {
        setDrawerVisible(false);
        setCurrentPage(1);
        loadProducts('', 1, pageSize, null, null, null, currentIndustryType);
    };

    // ========== HANDLE EDIT ==========
    const handleEdit = (product) => {
        setEditingProduct(product);
        setEditTarget(product);
        setEditModalVisible(true);
        setShowSimpleModal(true);
    };

    // ========== HANDLE DELETE ==========
    const handleDelete = async (productId) => {
        try {
            setLoading(true);
            const response = await deleteProduct(tenantId, productId);
            
            if (response.success) {
                message.success(response.message || 'Xóa sản phẩm thành công');
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

    // ========== SIMPLE DELETE (FOR SIMPLE MODAL) ==========
    const handleSimpleDelete = async (p) => {
        if (!window.confirm(`Xóa sản phẩm "${p.productName}"?`)) return;
        try {
            await axiosClient.delete(`/v1/products/${p.id}`, { 
                headers: { 'X-Workspace-Id': tenantId } 
            });
            loadProducts(searchKeyword, currentPage, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
            message.success('Xóa sản phẩm thành công');
        } catch (e) {
            message.error(e.response?.data?.message || 'Lỗi xóa sản phẩm');
        }
    };

    // ========== HANDLE SAVE (CRUD) ==========
    const handleSave = async (form) => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: form.price ? parseFloat(form.price) : null,
                cost: form.cost ? parseFloat(form.cost) : null,
                minStock: form.minStock ? parseInt(form.minStock) : null,
                maxStock: form.maxStock ? parseInt(form.maxStock) : null,
                tenantId: tenantId,
            };
            
            if (editTarget) {
                await axiosClient.put(`/v1/products/${editTarget.id}`, payload, { 
                    headers: { 'X-Workspace-Id': tenantId } 
                });
                message.success('Cập nhật sản phẩm thành công');
            } else {
                await axiosClient.post(`/v1/products`, payload, { 
                    headers: { 'X-Workspace-Id': tenantId } 
                });
                message.success('Thêm sản phẩm thành công');
            }
            
            handleProductUpdated();
            loadProducts(searchKeyword, currentPage, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType);
        } catch (e) {
            message.error(e.response?.data?.message || 'Lỗi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    // ========== HANDLE VIEW PRODUCT ==========
    const handleViewProduct = (product) => {
        setSelectedDetailProduct(product);
        setDetailDrawerVisible(true);
    };

    // ========== HANDLE DETAIL DRAWER CLOSE ==========
    const handleDetailDrawerClose = () => {
        setDetailDrawerVisible(false);
        setSelectedDetailProduct(null);
    };

    // ========== CALCULATED STATS ==========
    const lowStock = products.filter(p => p.minStock != null && p.currentStock != null && p.currentStock <= p.minStock).length;
    const outOfStock = products.filter(p => p.currentStock === 0).length;
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // ========== FILTERED LIST (Client-side filtering) ==========
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const mQ = !q || p.productName?.toLowerCase().includes(q) || p.productCode?.toLowerCase().includes(q) || p.supplier?.toLowerCase().includes(q);
        const mC = !filterCategory || p.category === filterCategory;
        return mQ && mC;
    });

    return (
        <div className={pageStyles.pageContainer}>

            {/* ========== PAGE HEADER ========== */}
            <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageHeaderLeft}>
                    <h1 className={pageStyles.pageTitle}>
                        <ShoppingOutlined /> Sản phẩm
                    </h1>
                    <p className={pageStyles.pageSubtitle}>
                        {isDemo && <span style={{ color: '#D97706', fontWeight: 600, marginRight: 8 }}>🎭 Demo —</span>}
                        Quản lý danh mục sản phẩm, tồn kho và nhập/xuất hàng loạt · {products.length} sản phẩm
                        {lowStock > 0 && <span style={{ color: '#D97706', marginLeft: 8 }}>· ⚠️ {lowStock} sắp hết</span>}
                        {outOfStock > 0 && <span style={{ color: '#DC2626', marginLeft: 8 }}>· 🔴 {outOfStock} hết hàng</span>}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={s.btnGhost} onClick={() => loadProducts(searchKeyword, 1, pageSize, filterCategory, filterBrand, filterStockStatus, currentIndustryType)} disabled={loading}>
                        <ReloadOutlined spin={loading} /> Làm mới
                    </button>
                    {canManage && (
                        <>
                            <button className={s.btnPrimary} onClick={() => { setEditTarget(null); setEditingProduct(null); setModalVisible(true); }}>
                                <PlusOutlined /> Thêm sản phẩm
                            </button>
                            <button className={`${styles.actionButton} ${styles.bulkImportBtn}`} onClick={() => setDrawerVisible(true)}>
                                <UploadOutlined /> Nhập từ Excel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ========== STATS SECTION ========== */}
            <div className={pageStyles.statGrid}>
                <div className={pageStyles.statCard}>
                    <div className={`${pageStyles.statIcon} ${pageStyles.orange}`}><ShoppingOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Tổng sản phẩm</span>
                        <span className={pageStyles.statValue}>{products.length}</span>
                    </div>
                </div>
                <div className={pageStyles.statCard}>
                    <div className={`${pageStyles.statIcon} ${pageStyles.blue}`}><BarcodeOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Danh mục</span>
                        <span className={pageStyles.statValue}>{categories.length}</span>
                    </div>
                </div>
                <div className={pageStyles.statCard}>
                    <div className={pageStyles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}><InboxOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Sắp hết hàng</span>
                        <span className={pageStyles.statValue} style={{ color: lowStock > 0 ? '#D97706' : '#16A34A' }}>{lowStock}</span>
                    </div>
                </div>
                <div className={pageStyles.statCard}>
                    <div className={pageStyles.statIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><WarningOutlined /></div>
                    <div className={pageStyles.statInfo}>
                        <span className={pageStyles.statLabel}>Hết hàng</span>
                        <span className={pageStyles.statValue} style={{ color: outOfStock > 0 ? '#DC2626' : '#16A34A' }}>{outOfStock}</span>
                    </div>
                </div>
            </div>

            {/* ========== FILTER BAR: ADVANCED FILTERS ========== */}
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
                            options={availableCategories.length > 0 ? availableCategories : getAllCategories()}
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

            {/* ========== SIMPLE FILTER BAR (Alternative) ========== */}
            <div className={s.card} style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <SearchOutlined style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
                    <input style={{ ...inputStyle, paddingLeft: 32 }}
                        placeholder="Tìm theo tên, SKU, nhà cung cấp..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* ========== ERROR STATE ========== */}
            {error && <div className={s.errorBox}><WarningOutlined /> {error}</div>}

            {/* ========== LOADING STATE ========== */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60, gap: 10, color: '#64748B' }}>
                    <LoadingOutlined style={{ fontSize: 24, color: '#F97316' }} spin />
                    <span>Đang tải sản phẩm...</span>
                </div>
            )}

            {/* ========== PRODUCTS TABLE ========== */}
            {!loading && (
                filtered.length === 0 ? (
                    <div className={pageStyles.placeholderCard}>
                        <div className={pageStyles.placeholderIcon}><ShoppingOutlined /></div>
                        <h3 className={pageStyles.placeholderTitle}>Chưa có sản phẩm nào</h3>
                        <p className={pageStyles.placeholderText}>
                            {canManage ? 'Bấm "Thêm sản phẩm" để bắt đầu quản lý danh mục.' : 'Chưa có dữ liệu sản phẩm.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Advanced Table from Code1 */}
                        <ProductTable 
                            products={filtered} 
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

                        {/* Simple Table from Code2 (Fallback for when ProductTable not available) */}
                        <div className={s.card} style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        {['Sản phẩm', 'SKU', 'Danh mục', 'Tồn kho', 'Giá bán', 'Giá vốn', 'Đơn vị', 'NCC', canManage ? '' : null]
                                            .filter(Boolean).map(h => (
                                                <th key={h} className={s.th}>{h}</th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p, i) => (
                                        <tr key={p.id} className={i % 2 === 0 ? s.trEven : s.trOdd}>
                                            <td className={s.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 34, height: 34, borderRadius: 10,
                                                        background: 'linear-gradient(135deg,#FFF7ED,#FED7AA)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#EA580C', fontSize: 16, flexShrink: 0
                                                    }}>📦</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5 }}>{p.productName}</div>
                                                        {p.description && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{p.description}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={s.td} style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
                                                <BarcodeOutlined style={{ marginRight: 4, fontSize: 12 }} />
                                                {p.productCode || '—'}
                                            </td>
                                            <td className={s.td}>
                                                {p.category
                                                    ? <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#EFF6FF', color: '#2563EB' }}>{p.category}</span>
                                                    : <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>}
                                            </td>
                                            <td className={s.td}>
                                                <StockBadge current={p.currentStock} min={p.minStock} />
                                            </td>
                                            <td className={s.td} style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{fmtVnd(p.price)}</td>
                                            <td className={s.td} style={{ fontSize: 13, color: '#64748B' }}>{fmtVnd(p.cost)}</td>
                                            <td className={s.td} style={{ fontSize: 12, color: '#475569' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <SwapOutlined style={{ fontSize: 11 }} />
                                                    {p.mainUnit || '—'}
                                                </div>
                                            </td>
                                            <td className={s.td} style={{ fontSize: 12, color: '#64748B' }}>{p.supplier || '—'}</td>
                                            {canManage && (
                                                <td className={s.td} style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                        <button className={s.btnGhost} style={{ padding: '5px 10px' }}
                                                            onClick={() => handleEdit(p)}>
                                                            <EditOutlined />
                                                        </button>
                                                        <button className={s.btnDanger} style={{ padding: '5px 10px' }}
                                                            onClick={() => handleSimpleDelete(p)}>
                                                            <DeleteOutlined />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            )}

            {/* ========== MODAL: ADD/EDIT PRODUCT (ProductFormModal from Code1) ========== */}
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

            {/* ========== MODAL: SIMPLE ADD/EDIT (From Code2) ========== */}
            {showSimpleModal && (
                <ProductModal
                    initial={editTarget}
                    onSave={handleSave}
                    onClose={() => { 
                        setShowSimpleModal(false); 
                        setEditTarget(null); 
                    }}
                    saving={saving}
                    industryType={currentIndustryType}
                    availableCategories={availableCategories}
                />
            )}

            {/* ========== DRAWER: BULK IMPORT FROM EXCEL ========== */}
            <BulkImportDrawer
                visible={drawerVisible}
                tenantId={tenantId}
                industryType={currentIndustryType}
                onClose={() => setDrawerVisible(false)}
                onSuccess={handleBulkImportSuccess}
            />

            {/* ========== DRAWER: PRODUCT DETAIL VIEW ========== */}
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
