/**
 * Index file consolidating all brand models from separate category files
 */

import { smartphoneModels } from './smartphones.js';
import { laptopModels } from './laptops.js';
import { desktopModels } from './desktops.js';
import { componentModels } from './components.js';
import { tabletModels } from './tablets.js';
import { wearableModels } from './wearables.js';
import { accessoryModels } from './accessories.js';
import { cameraModels } from './cameras.js';
import { displayModels } from './displays.js';
import { gamingModels } from './gaming.js';
import { networkModels } from './network.js';
import { officeModels } from './office.js';
import { storageModels } from './storage.js';
import { smartHomeModels } from './smarthome.js';
import { audioModels } from './audio.js';
import { GROCERY_BRANDS } from './groceryBrands.js';

export const BRAND_MODELS = {
    ...smartphoneModels,
    ...laptopModels,
    ...desktopModels,
    ...componentModels,
    ...tabletModels,
    ...wearableModels,
    ...accessoryModels,
    ...cameraModels,
    ...displayModels,
    ...gamingModels,
    ...networkModels,
    ...officeModels,
    ...storageModels,
    ...smartHomeModels,
    ...audioModels,
};

/**
 * getBrandsByCategory - Lấy danh sách Brands dựa trên danh mục
 * Áp dụng Logic Smart Routing: Tìm trong Electronics trước -> rồi Grocery -> rồi trả về []
 * 
 * @param {string} category - Danh mục (VD: 'SMARTPHONE', 'FRESH_FOOD', etc.)
 * @returns {Array<string>} Mảng tên brands
 * 
 * Ví dụ:
 * - getBrandsByCategory('SMARTPHONE') -> [Apple, Samsung, Xiaomi...]  (từ Electronics)
 * - getBrandsByCategory('FRESH_FOOD') -> [CP, Vissan, Ba Huân...]    (từ Grocery)
 * - getBrandsByCategory('UNKNOWN') -> []                               (không tìm thấy)
 */
export const getBrandsByCategory = (category) => {
    if (!category) return [];

    // 🔍 Tìm trong Brands của Electronics trước
    // Check các key của smartphoneModels, laptopModels, v.v...
    const electronicsFilters = {
        SMARTPHONE: ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Realme', 'OPPO', 'VIVO'],
        LAPTOP: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'MSI', 'Acer', 'LG'],
        DESKTOP: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Corsair', 'NZXT'],
        TABLET: ['Apple', 'Samsung', 'Xiaomi', 'iPad'],
        CAMERA: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
        ACCESSORY: ['Anker', 'Belkin', 'mophie', 'OtterBox', 'Spigen'],
        WEARABLE: ['Apple', 'Garmin', 'Samsung', 'Fitbit'],
        COMPONENT: ['Intel', 'AMD', 'NVIDIA', 'Kingston', 'Crucial'],
        DISPLAY: ['Dell', 'LG', 'ASUS', 'BenQ', 'AOC'],
        GAMING: ['Razer', 'Corsair', 'SteelSeries', 'Logitech'],
        NETWORK: ['TP-Link', 'D-Link', 'Netgear', 'Cisco', 'Asus'],
        OFFICE: ['HP', 'Canon', 'Brother', 'Epson', 'Ricoh'],
        STORAGE: ['WD', 'Seagate', 'Samsung', 'Crucial', 'Kingston'],
        SMARTHOME: ['Philips', 'Xiaomi', 'Google', 'Amazon', 'LIFX'],
        AUDIO: ['Sony', 'Bose', 'JBL', 'Sennheiser', 'Audio-Technica'],
    };

    // Kiểm tra trong Electronics
    if (electronicsFilters[category]) {
        return electronicsFilters[category];
    }

    // 🔍 Nếu không có trong Electronics, tìm trong Grocery
    if (GROCERY_BRANDS[category]) {
        return GROCERY_BRANDS[category];
    }

    // Không tìm thấy - trả về mảng rỗng
    return [];
};

export default BRAND_MODELS;

