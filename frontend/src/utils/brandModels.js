import BRAND_MODELS from './brandModels/data/index.js';

export { BRAND_MODELS };

export const getBrandsByCategory = (category) => {
    if (!category) return [];
    
    const brands = [];
    for (const [key, brandData] of Object.entries(BRAND_MODELS)) {
        // So sánh category (case-insensitive)
        if (brandData.category && brandData.category.toLowerCase() === category.toLowerCase()) {
            brands.push({
                label: brandData.label,
                value: key,
            });
        }
    }
    return brands;
};

/**
 * Lấy danh sách brand
 */
export const getBrandOptions = () => {
    return Object.entries(BRAND_MODELS).map(([code, config]) => ({
        label: config.label,
        value: code,
    }));
};

export const getModelsByBrand = (brand) => {
    if (!brand || !BRAND_MODELS[brand]) {
        return [];
    }
    
    const models = BRAND_MODELS[brand].models || [];
    return models.map(model => ({
        label: model.name,
        value: model.id,
    }));
};

export const getModelById = (brand, modelId) => {
    if (!brand || !modelId) return null;
    
    const brandData = BRAND_MODELS[brand];
    if (!brandData) return null;
    
    return brandData.models.find(m => m.id === modelId);
};

export default BRAND_MODELS;
