/**
 * Quản lý các thông số kỹ thuật mẫu theo danh mục và hãng
 */

// Thông số mẫu cho từng danh mục
export const CATEGORY_SPECS = {
    SMARTPHONE: {
        label: 'Điện thoại',
        quickSpecs: {
            storage: {
                label: 'Dung lượng',
                icon: '💾',
                type: 'select',
                options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
            },
            ram: {
                label: 'RAM',
                icon: '🧠',
                type: 'select',
                options: ['4GB', '6GB', '8GB', '12GB', '16GB'],
            },
            color: {
                label: 'Màu sắc',
                icon: '🎨',
                type: 'select',
                options: ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Hồng', 'Tím', 'Xám'],
            },
            refreshRate: {
                label: 'Tần số quét',
                icon: '⚡',
                type: 'select',
                options: ['60Hz', '90Hz', '120Hz', '144Hz', '165Hz'],
            },
            condition: {
                label: 'Điều kiện',
                icon: '✨',
                type: 'select',
                options: ['Mới', 'Like New', 'Good', 'Fair'],
            },
            sim: {
                label: 'Số SIM',
                icon: '📱',
                type: 'select',
                options: ['1 Nano SIM', '2 Nano SIM', '1 SIM + 1 eSIM', '2 eSIM'],
            },
            charger: {
                label: 'Sạc',
                icon: '🔌',
                type: 'select',
                options: ['20W', '30W', '45W', '65W', '100W', 'Sạc nhanh', 'Sạc không dây'],
            },
        },
        fullSpecs: {
            display: 'Màn hình (VD: 6.7 inch AMOLED 120Hz)',
            processor: 'Xử lý (VD: Snapdragon 8 Gen 2)',
            battery: 'Pin (VD: 4500mAh)',
            camera: 'Camera (VD: 50MP + 12MP + 12MP)',
            os: 'Hệ điều hành (VD: iOS 17)',
        },
    },
    TABLET: {
        label: 'Tablet',
        quickSpecs: {
            storage: {
                label: 'Dung lượng',
                icon: '💾',
                type: 'select',
                options: ['32GB', '64GB', '128GB', '256GB', '512GB'],
            },
            ram: {
                label: 'RAM',
                icon: '🧠',
                type: 'select',
                options: ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB'],
            },
            display: {
                label: 'Kích thước màn hình',
                icon: '📐',
                type: 'select',
                options: ['7 inch', '8 inch', '10 inch', '11 inch', '12.9 inch', '13 inch'],
            },
            color: {
                label: 'Màu sắc',
                icon: '🎨',
                type: 'select',
                options: ['Đen', 'Trắng', 'Bạc', 'Xám', 'Vàng đồng'],
            },
            condition: {
                label: 'Điều kiện',
                icon: '✨',
                type: 'select',
                options: ['Mới', 'Like New', 'Good', 'Fair'],
            },
        },
    },
    LAPTOP: {
        label: 'Laptop',
        quickSpecs: {
            storage: {
                label: 'Ổ cứng',
                icon: '💾',
                type: 'select',
                options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
            },
            ram: {
                label: 'RAM',
                icon: '🧠',
                type: 'select',
                options: ['8GB', '16GB', '32GB', '64GB'],
            },
            processor: {
                label: 'Bộ xử lý',
                icon: '🎛️',
                type: 'select',
                options: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'],
            },
            display: {
                label: 'Kích thước màn hình',
                icon: '📐',
                type: 'select',
                options: ['13 inch', '14 inch', '15 inch', '16 inch', '17 inch'],
            },
            gpu: {
                label: 'Card đồ hoạ',
                icon: '🎮',
                type: 'select',
                options: ['Integrated', 'NVIDIA RTX 3050', 'NVIDIA RTX 4050', 'NVIDIA RTX 4060', 'AMD Radeon'],
            },
            color: {
                label: 'Màu sắc',
                icon: '🎨',
                type: 'select',
                options: ['Đen', 'Bạc', 'Trắng', 'Xám', 'Gold'],
            },
        },
    },
    ACCESSORY: {
        label: 'Phụ kiện',
        quickSpecs: {
            type: {
                label: 'Loại phụ kiện',
                icon: '📦',
                type: 'select',
                options: ['Sạc', 'Cáp', 'Tai nghe', 'Loa', 'Pin dự phòng', 'Bao da', 'Kính cương lực', 'Holder'],
            },
            color: {
                label: 'Màu sắc',
                icon: '🎨',
                type: 'select',
                options: ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Hồng', 'Tím', 'Xám'],
            },
            compatibility: {
                label: 'Tương thích',
                icon: '🔗',
                type: 'select',
                options: ['Universal', 'iPhone', 'Samsung', 'Xiaomi', 'Android', 'Type-C', 'Lightning'],
            },
            condition: {
                label: 'Điều kiện',
                icon: '✨',
                type: 'select',
                options: ['Mới', 'Like New', 'Good'],
            },
        },
    },
    COMPONENT: {
        label: 'Linh kiện',
        quickSpecs: {
            type: {
                label: 'Loại linh kiện',
                icon: '⚙️',
                type: 'select',
                options: ['Main board', 'Pin', 'Màn hình', 'Camera', 'Loa', 'Mic', 'Vibration', 'Connector'],
            },
            compatibility: {
                label: 'Tương thích',
                icon: '🔗',
                type: 'select',
                options: ['iPhone 15', 'iPhone 14', 'Samsung S24', 'Samsung S23', 'Xiaomi', 'Generic'],
            },
            condition: {
                label: 'Điều kiện',
                icon: '✨',
                type: 'select',
                options: ['Original', 'OEM', 'Compatible'],
            },
        },
    },
};

/**
 * Lấy các thông số mẫu theo danh mục
 */
export const getQuickSpecsForCategory = (categoryCode) => {
    const category = CATEGORY_SPECS[categoryCode];
    return category ? category.quickSpecs : {};
};

/**
 * Lấy danh sách các danh mục
 */
export const getCategoryOptions = () => {
    return Object.entries(CATEGORY_SPECS).map(([code, config]) => ({
        label: config.label,
        value: code,
    }));
};

/**
 * Convert quick specs selection thành array cho Form.List
 * @example
 * convertQuickSpecsToArray({storage: '128GB', ram: '8GB', color: 'Đen'})
 * // Returns: [{key: 'Dung lượng', value: '128GB'}, {key: 'RAM', value: '8GB'}, ...]
 */
export const convertQuickSpecsToArray = (selectedSpecs, categoryCode) => {
    const quickSpecs = getQuickSpecsForCategory(categoryCode);
    const specArray = [];

    Object.entries(selectedSpecs).forEach(([specKey, specValue]) => {
        if (specValue && quickSpecs[specKey]) {
            specArray.push({
                key: quickSpecs[specKey].label,
                value: specValue,
            });
        }
    });

    return specArray;
};

/**
 * Gợi ý các thông số phổ biến cho một danh mục và hãng
 */
export const getSuggestedSpecs = (categoryCode, brand) => {
    const suggestions = {};
    
    // Gợi ý mặc định cho từng danh mục
    if (categoryCode === 'SMARTPHONE') {
        suggestions.storage = '128GB';
        suggestions.ram = '8GB';
        suggestions.refreshRate = '120Hz';
        suggestions.condition = 'Mới';
        
        // Gợi ý cụ thể theo hãng
        if (brand === 'Apple') {
            suggestions.color = 'Đen';
            suggestions.sim = '1 Nano SIM';
        } else if (brand === 'Samsung') {
            suggestions.storage = '256GB';
            suggestions.ram = '12GB';
            suggestions.color = 'Xám';
        } else if (brand === 'Xiaomi') {
            suggestions.storage = '256GB';
            suggestions.ram = '12GB';
            suggestions.charger = '67W';
        }
    } else if (categoryCode === 'LAPTOP') {
        suggestions.storage = '512GB SSD';
        suggestions.ram = '16GB';
        suggestions.condition = 'Mới';
        suggestions.display = '15 inch';
        
        if (brand === 'Apple') {
            suggestions.processor = 'Apple M3';
            suggestions.gpu = 'Integrated';
            suggestions.color = 'Bạc';
        } else if (brand === 'Dell') {
            suggestions.processor = 'Intel i7';
            suggestions.gpu = 'NVIDIA RTX 4060';
        }
    }
    
    return suggestions;
};
