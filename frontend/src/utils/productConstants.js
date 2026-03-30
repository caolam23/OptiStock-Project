/**
 * productConstants.js - Constants cho module Quản lý Sản phẩm Electronics
 */

// ==================== TRACKING TYPE ====================
export const TRACKING_TYPES = {
    IMEI: {
        value: 'IMEI',
        label: '📱 Quản lý theo IMEI',
        description: 'Cho điện thoại, tablet - cần tracking số hiệu IMEI',
        requiresIMEI: true,
    },
    BATCH: {
        value: 'BATCH',
        label: '📦 Quản lý theo Lô',
        description: 'Cho phụ kiện, linh kiện - quản lý theo lô hàng',
        requiresIMEI: false,
    },
    QUANTITY: {
        value: 'QUANTITY',
        label: '🔢 Quản lý theo Số lượng',
        description: 'Sản phẩm thông thường - quản lý theo số lượng',
        requiresIMEI: false,
    },
    SERVICE: {
        value: 'SERVICE',
        label: '🎁 Dịch vụ',
        description: 'Dịch vụ không quản lý kho',
        requiresIMEI: false,
    },
};

// ==================== ACTIVATION STATUS ====================
export const ACTIVATION_STATUSES = {
    NOT_ACTIVATED: {
        value: 'NOT_ACTIVATED',
        label: 'Chưa kích hoạt',
        color: 'default',
        icon: '⏸️',
    },
    ACTIVATED: {
        value: 'ACTIVATED',
        label: 'Đã kích hoạt',
        color: 'success',
        icon: '✅',
    },
    DEACTIVATED: {
        value: 'DEACTIVATED',
        label: 'Đã hủy',
        color: 'error',
        icon: '❌',
    },
};

// ==================== ORIGIN CODE ====================
export const ORIGIN_CODES = {
    VN_A: { label: 'VN/A (Việt Nam)', value: 'VN/A', region: 'Vietnam' },
    LL_A: { label: 'LL/A (Hàng Lưu Lại)', value: 'LL/A', region: 'Return Stock' },
    HK_A: { label: 'HK/A (Hồng Kông)', value: 'HK/A', region: 'Hong Kong' },
    SG_A: { label: 'SG/A (Singapore)', value: 'SG/A', region: 'Singapore' },
    GLOBAL_A: { label: 'GLOBAL/A (Quốc tế)', value: 'GLOBAL/A', region: 'International' },
};

// ==================== CATEGORIES ====================
export const PRODUCT_CATEGORIES = {
    SMARTPHONE: { label: 'Điện thoại', value: 'SMARTPHONE', icon: '📱' },
    TABLET: { label: 'Tablet', value: 'TABLET', icon: '📱' },
    LAPTOP: { label: 'Laptop', value: 'LAPTOP', icon: '💻' },
    ACCESSORY: { label: 'Phụ kiện', value: 'ACCESSORY', icon: '🔌' },
    COMPONENT: { label: 'Linh kiện', value: 'COMPONENT', icon: '🔧' },
    SERVICE: { label: 'Dịch vụ', value: 'SERVICE', icon: '🛠️' },
};

// ==================== BRANDS ====================
export const PRODUCT_BRANDS = [
    { label: 'Apple', value: 'Apple', icon: '🍎' },
    { label: 'Samsung', value: 'Samsung', icon: '📱' },
    { label: 'Xiaomi', value: 'Xiaomi', icon: '⚡' },
    { label: 'Google Pixel', value: 'Google', icon: '🔵' },
    { label: 'OnePlus', value: 'OnePlus', icon: '🔴' },
    { label: 'Realme', value: 'Realme', icon: '⭐' },
    { label: 'OPPO', value: 'OPPO', icon: '🟢' },
    { label: 'VIVO', value: 'VIVO', icon: '🔵' },
    { label: 'Khác', value: 'Other', icon: '❓' },
];

// ==================== UNITS ====================
export const PRODUCT_UNITS = [
    { label: 'Cái', value: 'Cái' },
    { label: 'Bộ', value: 'Bộ' },
    { label: 'Hộp', value: 'Hộp' },
    { label: 'Thùng', value: 'Thùng' },
    { label: 'Dây', value: 'Dây' },
    { label: 'Cặp', value: 'Cặp' },
    { label: 'Lô', value: 'Lô' },
];

// ==================== SPECIFICATIONS EXAMPLES ====================
export const SPECIFICATION_EXAMPLES = {
    SMARTPHONE: [
        { key: 'RAM', value: '8GB' },
        { key: 'ROM', value: '256GB' },
        { key: 'Display', value: '6.5 inch OLED' },
        { key: 'Camera', value: '48MP Main' },
        { key: 'Battery', value: '4000mAh' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 2' },
        { key: 'OS', value: 'Android 14' },
    ],
    LAPTOP: [
        { key: 'Processor', value: 'Intel Core i7' },
        { key: 'RAM', value: '16GB' },
        { key: 'Storage', value: '512GB SSD' },
        { key: 'Display', value: '15.6 inch FHD' },
        { key: 'GPU', value: 'NVIDIA RTX 4050' },
        { key: 'Battery', value: '8 hours' },
    ],
    TABLET: [
        { key: 'Screen Size', value: '10.9 inch' },
        { key: 'Resolution', value: '2560x1600' },
        { key: 'RAM', value: '6GB' },
        { key: 'Storage', value: '128GB' },
        { key: 'Processor', value: 'Apple M1' },
    ],
};

// ==================== WARRANTY PRESETS ====================
export const WARRANTY_PRESETS = [
    { label: 'Không bảo hành', value: 0 },
    { label: '6 tháng', value: 6 },
    { label: '12 tháng', value: 12 },
    { label: '24 tháng', value: 24 },
    { label: '36 tháng', value: 36 },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy thông tin TrackingType
 */
export function getTrackingTypeInfo(type) {
    return TRACKING_TYPES[type] || TRACKING_TYPES.QUANTITY;
}

/**
 * Lấy thông tin ActivationStatus
 */
export function getActivationStatusInfo(status) {
    return ACTIVATION_STATUSES[status] || ACTIVATION_STATUSES.NOT_ACTIVATED;
}

/**
 * Lấy thông tin Category
 */
export function getCategoryInfo(category) {
    return PRODUCT_CATEGORIES[category] || PRODUCT_CATEGORIES.SMARTPHONE;
}

/**
 * Lấy thông tin Brand
 */
export function getBrandInfo(brand) {
    return PRODUCT_BRANDS.find(b => b.value === brand) || PRODUCT_BRANDS[PRODUCT_BRANDS.length - 1];
}

/**
 * Kiểm tra sản phẩm có cần tracking IMEI không
 */
export function requiresIMEITracking(trackingType) {
    return TRACKING_TYPES[trackingType]?.requiresIMEI || false;
}

/**
 * Kiểm tra sản phẩm có phải dịch vụ không
 */
export function isServiceProduct(trackingType) {
    return trackingType === 'SERVICE';
}

/**
 * Chuyển specifications object thành array
 */
export function specsToArray(specs) {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs;
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
}

/**
 * Chuyển specifications array thành object
 */
export function specsToObject(specs) {
    const obj = {};
    if (Array.isArray(specs)) {
        specs.forEach(spec => {
            if (spec.key && spec.value) {
                obj[spec.key] = spec.value;
            }
        });
    }
    return obj;
}

/**
 * Format giá tiền theo định dạng Việt
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Validate SKU
 */
export function validateSKU(sku) {
    const skuPattern = /^[A-Z0-9-]+$/;
    return skuPattern.test(sku) && sku.length >= 3 && sku.length <= 50;
}

/**
 * Validate giá
 */
export function validatePrice(price) {
    return typeof price === 'number' && price > 0;
}

/**
 * Validate tồn kho
 */
export function validateStock(currentStock, minStock, maxStock) {
    if (minStock > maxStock) return false;
    if (currentStock && (currentStock < minStock || currentStock > maxStock)) {
        return false;
    }
    return true;
}

export default {
    TRACKING_TYPES,
    ACTIVATION_STATUSES,
    ORIGIN_CODES,
    PRODUCT_CATEGORIES,
    PRODUCT_BRANDS,
    PRODUCT_UNITS,
    WARRANTY_PRESETS,
    getTrackingTypeInfo,
    getActivationStatusInfo,
    getCategoryInfo,
    getBrandInfo,
    requiresIMEITracking,
    isServiceProduct,
    formatPrice,
    validateSKU,
    validatePrice,
    validateStock,
};
