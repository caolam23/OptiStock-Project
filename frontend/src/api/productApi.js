/**
 * productApi.js — API calls cho quản lý sản phẩm (MANAGER role)
 */
import axiosClient from './axiosClient';

/**
 * Debounce utility function: Trì hoãn gọi hàm cho đến khi người dùng ngừng gác
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

/**
 * Lấy danh sách sản phẩm của workspace (hỗ trợ phân trang + lọc)
 * @param {string} tenantId - ID của workspace (tenant)
 * @param {object} params - Query parameters object gồm:
 *   - page (number, default: 0): Trang hiện tại (0-indexed từ Backend)
 *   - size (number, default: 10): Số sản phẩm mỗi trang
 *   - search (string, optional): Từ khóa tìm kiếm (tên hoặc SKU)
 *   - category (string, optional): Lọc theo danh mục (VD: "Laptop", "Điện thoại")
 *   - brand (string, optional): Lọc theo hãng (VD: "Apple_Laptop", "Samsung_Smartphone")
 *   - stockStatus (string, optional): Lọc theo trạng thái kho (LOW_STOCK, OUT_OF_STOCK, OVERSTOCK)
 * @returns {Promise} Response: {data: [...], totalElements, totalPages, currentPage, pageSize}
 * @example
 * getProducts(tenantId, { 
 *   page: 0, 
 *   size: 10, 
 *   search: "iPhone",
 *   category: "Điện thoại",
 *   brand: "Apple_Smartphone"
 * })
 */
export const getProducts = (tenantId, params = {}) => {
    // Merge default values dengan params (params override defaults)
    const finalParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size !== undefined ? params.size : 10,
        ...params  // Spread all params (including search, category, brand, stockStatus)
    };

    // Log params để debug
    console.log(`📤 [AXIOS] GET /v1/workspaces/${tenantId}/products`, {
        params: finalParams
    });

    return axiosClient.get(`/v1/workspaces/${tenantId}/products`, {
        params: finalParams  // Axios sẽ convert object thành query string
    })
        .then(response => {
            console.log(`✅ [API RESPONSE] Status 200:`, response.data);
            return response.data;
        })
        .catch(error => {
            console.error('❌ [API ERROR] Lỗi lấy danh sách sản phẩm:', error.response?.data || error.message);
            throw error;
        });
};

/**
 * Tìm kiếm sản phẩm theo từ khóa (tên hoặc mã SKU) - dùng cho auto-suggest
 * @param {string} tenantId - ID của workspace (tenant)
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {number} limit - Số lượng sản phẩm tối đa trả về (default: 10, dùng cho auto-suggest)
 * @returns {Promise<Array>} Danh sách sản phẩm khớp
 */
export const searchProducts = (tenantId, keyword, limit = 10) => {
    // Trả về promise ngay nếu keyword rỗng
    if (!keyword || !keyword.trim()) {
        return Promise.resolve([]);
    }

    return axiosClient.get(`/v1/workspaces/${tenantId}/products`, {
        params: {
            search: keyword.trim(),
            limit: limit
        }
    })
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi tìm kiếm sản phẩm:', error.response?.data || error.message);
            return []; // Trả về mảng rỗng thay vì throw error
        });
};

/**
 * Tạo hàm search debounced - dùng trong component ProductSearch
 * Giúp tránh spam API khi user gõ liên tục
 * @param {Function} searchFn - Hàm search (thường là searchProducts)
 * @param {number} delay - Thời gian debounce (ms, default: 300ms)
 * @returns {Function} Hàm debounced
 */
export const createDebouncedSearch = (searchFn, delay = 300) => {
    return debounce(searchFn, delay);
};

/**
 * Lấy danh sách danh mục & đơn vị sản phẩm theo ngành hàng
 * @param {string} tenantId - ID của workspace (tenant)
 * @returns {Promise} { categories, units, defaultUnit, defaultCategory, industryCode }
 */
export const getProductCategories = (tenantId) =>
    axiosClient.get(`/v1/workspaces/${tenantId}/products/categories`)
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi lấy danh mục sản phẩm:', error.response?.data || error.message);
            throw error;
        });

/**
 * Lấy danh sách đơn vị sản phẩm theo ngành hàng
 * @param {string} tenantId - ID của workspace (tenant)
 * @returns {Promise} { units, defaultUnit }
 */
export const getProductUnits = (tenantId) =>
    axiosClient.get(`/v1/workspaces/${tenantId}/products/units`)
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi lấy danh sách đơn vị:', error.response?.data || error.message);
            throw error;
        });

/**
 * Tạo sản phẩm mới
 * @param {string} tenantId - ID của workspace (tenant)
 * @param {Object} data - Dữ liệu sản phẩm { productCode, productName, category, price, cost, mainUnit, minStock, maxStock, supplier }
 * @returns {Promise} Kết quả tạo sản phẩm
 */
export const createProduct = (tenantId, data) =>
    axiosClient.post(`/v1/workspaces/${tenantId}/products`, data)
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi tạo sản phẩm:', error.response?.data || error.message);
            throw error;
        });

/**
 * Nhập hàng loạt sản phẩm từ file Excel/CSV
 * @param {string} tenantId - ID của workspace (tenant)
 * @param {FormData} formData - Form data chứa file (file parameter)
 * @returns {Promise} Kết quả import: { success, imported, skipped, errors }
 */
export const bulkImportProducts = (tenantId, formData) =>
    axiosClient.post(`/v1/workspaces/${tenantId}/products/bulk-import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi nhập file:', error.response?.data || error.message);
            throw error;
        });

/**
 * Tải template file để nhập sản phẩm
 * @param {string} tenantId - ID của workspace (tenant)
 * @returns {Promise} File blob
 */
export const downloadProductTemplate = (tenantId) =>
    axiosClient.get(`/v1/workspaces/${tenantId}/products/template`, {
        responseType: 'blob',
    })
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi tải template:', error.response?.data || error.message);
            throw error;
        });

/**
 * Cập nhật sản phẩm
 * @param {string} tenantId - ID của workspace (tenant)
 * @param {string} productId - ID của sản phẩm (MongoDB ObjectId)
 * @param {Object} data - Dữ liệu sản phẩm cần cập nhật
 * @returns {Promise} Kết quả cập nhật
 */
export const updateProduct = (tenantId, productId, data) =>
    axiosClient.put(`/v1/workspaces/${tenantId}/products/${productId}`, data)
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi cập nhật sản phẩm:', error.response?.data || error.message);
            throw error;
        });

/**
 * Xóa sản phẩm
 * @param {string} tenantId - ID của workspace (tenant)
 * @param {string} productId - ID của sản phẩm (MongoDB ObjectId)
 * @returns {Promise} Kết quả xóa
 */
export const deleteProduct = (tenantId, productId) =>
    axiosClient.delete(`/v1/workspaces/${tenantId}/products/${productId}`)
        .then(r => r.data)
        .catch(error => {
            console.error('Lỗi xóa sản phẩm:', error.response?.data || error.message);
            throw error;
        });
