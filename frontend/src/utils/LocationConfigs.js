/**
 * LocationConfigs.js - Cấu hình động cho Sơ đồ Kho (Warehouse Topology)
 * 
 * Định nghĩa:
 * 1. LOCATION_LEVELS - Enum các cấp độ vị trí
 * 2. LOCATION_PROPERTIES_CONFIG - Cấu hình thuộc tính động theo industryType
 */

/**
 * LOCATION_LEVELS - Cấp độ vị trí trong cây kho
 * ZONE (Khu vực) -> RACK (Dãy/Kệ) -> BIN (Tầng/Hộc)
 */
export const LOCATION_LEVELS = [
    { value: 'ZONE', label: 'Khu vực (Zone)', icon: '🏘️' },
    { value: 'RACK', label: 'Dãy/Kệ (Rack)', icon: '📦' },
    { value: 'BIN', label: 'Tầng/Hộc (Bin)', icon: '📍' },
];

/**
 * Lấy label của level theo value
 */
export const getLevelLabel = (value) => {
    const found = LOCATION_LEVELS.find(l => l.value === value);
    return found ? found.label : '—';
};

/**
 * Lấy icon của level theo value
 */
export const getLevelIcon = (value) => {
    const found = LOCATION_LEVELS.find(l => l.value === value);
    return found ? found.icon : '';
};

/**
 * LOCATION_PROPERTIES_CONFIG - Cấu hình thuộc tính động theo industryType
 * 
 * Cấu trúc:
 * {
 *   [industryType]: [
 *     {
 *       key: "propertyKey",
 *       label: "Tên hiển thị",
 *       type: "input|select|checkbox|number",
 *       applicable_levels: ["ZONE", "RACK", "BIN"],  // Cấp độ nào thì áp dụng
 *       options: [...],  // Nếu type = select
 *       placeholder: "...",
 *       help: "Mô tả thêm",
 *     }
 *   ]
 * }
 */
export const LOCATION_PROPERTIES_CONFIG = {
    ELECTRONICS: [
        // ===== Thuộc tính áp dụng cho tất cả cấp độ =====
        {
            key: 'temperature',
            label: 'Nhiệt độ bảo quản (°C)',
            type: 'input',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            placeholder: 'VD: 15-25',
            help: 'Khoảng nhiệt độ thích hợp',
        },
        {
            key: 'humidity',
            label: 'Độ ẩm (%)',
            type: 'input',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            placeholder: 'VD: 30-60',
            help: 'Khoảng độ ẩm tương đối',
        },
        {
            key: 'securityLevel',
            label: 'Mức độ bảo mật',
            type: 'select',
            applicable_levels: ['ZONE', 'RACK'],
            options: [
                { value: 'LOW', label: '🔓 Thấp' },
                { value: 'MEDIUM', label: '🔒 Trung bình' },
                { value: 'HIGH', label: '🔐 Cao' },
            ],
            help: 'Mức độ kiểm soát truy cập',
        },
        {
            key: 'fireproof',
            label: 'Chống cháy',
            type: 'checkbox',
            applicable_levels: ['ZONE', 'RACK'],
            help: 'Vị trí có hệ thống chống cháy',
        },
        {
            key: 'staticControl',
            label: 'Kiểm soát tĩnh điện',
            type: 'checkbox',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            help: 'Vị trí có nền chống tĩnh điện',
        },
        {
            key: 'remarks',
            label: 'Ghi chú thêm',
            type: 'textarea',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            placeholder: 'Các lưu ý hoặc yêu cầu đặc biệt',
            help: 'Mô tả tự do',
        },
    ],
    
    GROCERY: [
        // ===== Thuộc tính áp dụng cho tất cả cấp độ =====
        {
            key: 'temperature',
            label: 'Nhiệt độ bảo quản (°C)',
            type: 'input',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            placeholder: 'VD: 5-10',
            help: 'Khoảng nhiệt độ thích hợp',
        },
        {
            key: 'humidity',
            label: 'Độ ẩm (%)',
            type: 'input',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            placeholder: 'VD: 60-80',
            help: 'Khoảng độ ẩm tương đối',
        },
        {
            key: 'storageType',
            label: 'Loại kho lưu trữ',
            type: 'select',
            applicable_levels: ['ZONE'],
            options: [
                { value: 'FROZEN', label: '❄️ Lạnh -18°C' },
                { value: 'CHILLED', label: '🧊 Mát 5-10°C' },
                { value: 'AMBIENT', label: '🌡️ Thường (15-25°C)' },
                { value: 'DRY', label: '🏜️ Khô' },
            ],
            help: 'Loại điều kiện lưu trữ',
        },
        {
            key: 'pestControl',
            label: 'Kiểm soát côn trùng',
            type: 'checkbox',
            applicable_levels: ['ZONE', 'RACK'],
            help: 'Vị trí có biện pháp kiểm soát côn trùng',
        },
        {
            key: 'foodSafe',
            label: 'Đạt chuẩn an toàn thực phẩm',
            type: 'checkbox',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            help: 'Vị trí tuân thủ tiêu chuẩn HACCP/FDA',
        },
        {
            key: 'segregation',
            label: 'Tách biệt hàng hóa',
            type: 'checkbox',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            help: 'Vị trí dành riêng cho loại hàng cụ thể',
        },
        {
            key: 'remarks',
            label: 'Ghi chú thêm',
            type: 'textarea',
            applicable_levels: ['ZONE', 'RACK', 'BIN'],
            placeholder: 'Các lưu ý hoặc yêu cầu đặc biệt',
            help: 'Mô tả tự do',
        },
    ],
};

/**
 * Lấy cấu hình thuộc tính cho một industryType
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @returns {Array} Danh sách cấu hình thuộc tính
 */
export const getPropertiesConfig = (industryType) => {
    return LOCATION_PROPERTIES_CONFIG[industryType] || [];
};

/**
 * Lấy cấu hình thuộc tính áp dụng cho một cấp độ
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @param {string} level - ZONE, RACK, hoặc BIN
 * @returns {Array} Danh sách cấu hình thuộc tính cho cấp độ
 */
export const getPropertiesForLevel = (industryType, level) => {
    const config = getPropertiesConfig(industryType);
    return config.filter(prop => prop.applicable_levels.includes(level));
};

/**
 * Chuyển đổi object properties thành object để gán vào form
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @param {string} level - ZONE, RACK, hoặc BIN
 * @param {Object} existingProperties - Properties hiện tại
 * @returns {Object} Form data
 */
export const propertiesToFormData = (industryType, level, existingProperties = {}) => {
    const config = getPropertiesForLevel(industryType, level);
    const formData = {};
    config.forEach(prop => {
        formData[prop.key] = existingProperties[prop.key] || null;
    });
    return formData;
};

/**
 * Chuyển đổi form data thành object properties
 * @param {string} industryType - ELECTRONICS hoặc GROCERY
 * @param {string} level - ZONE, RACK, hoặc BIN
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} Properties object
 */
export const formDataToProperties = (industryType, level, formData) => {
    const config = getPropertiesForLevel(industryType, level);
    const properties = {};
    config.forEach(prop => {
        if (formData[prop.key] !== null && formData[prop.key] !== undefined && formData[prop.key] !== '') {
            properties[prop.key] = formData[prop.key];
        }
    });
    return properties;
};
