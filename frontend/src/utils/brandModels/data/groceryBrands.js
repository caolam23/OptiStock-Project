/**
 * groceryBrands.js - Index gom nhóm tất cả thương hiệu Tạp hóa & Siêu thị
 */

import { otherGroceryBrands } from './grocery_other';

// 🔥 CÁC MẢNG GIA VỊ (Mới bổ sung phân tầng)
import { spiceBrands, spiceFishSauceBrands, spiceOilBrands, spiceOtherBrands } from './grocery_spices';

// 🔥 CÁC MẢNG THÚ CƯNG 
import { petCareBrands, petDogFoodBrands, petCatLitterBrands, petOtherBrands } from './grocery_petCare'; 

// 🔥 CÁC MẢNG SỨC KHỎE & VITAMIN
import { healthSupplementBrands, healthVitaminBrands, healthDigestiveBrands, healthOtherBrands } from './grocery_health';

// 🔥 CÁC MẢNG ĐÔNG LẠNH
import { frozenBrands, frozenIceCreamBrands, frozenSeafoodBrands, frozenOtherBrands } from './grocery_frozen';

// 🔥 CÁC MẢNG TƯƠI SỐNG 
import { freshFoodBrands, freshMeatBrands, freshVeggieBrands, freshOtherBrands } from './grocery_freshFood';

// 🔥 CÁC MẢNG THỰC PHẨM KHÔ 
import { dryFoodBrands, dryNoodleBrands, dryRiceBrands, dryOtherBrands } from './grocery_dryFood';

// 🔥 CÁC MẢNG HÓA MỸ PHẨM
import { cosmeticsBrands, cosLaundryBrands, cosSkincareBrands, cosOtherBrands } from './grocery_cosmetics';

// 🔥 CÁC MẢNG MẸ & BÉ
import { babyMilkBrands, babyDiaperBrands, babyFoodBrands, babyGearBrands } from './grocery_babyCare';

// 🔥 CÁC MẢNG ĐỒ UỐNG CHUYÊN BIỆT
import { 
    beverageSodaBrands, 
    beverageTeaBrands, 
    beverageWaterBrands, 
    beverageMilkBrands, 
    beveragePlantMilkBrands, 
    beverageJuiceBrands, 
    beverageCoffeeBrands, 
    beverageBrewTeaBrands, 
    beverageBeerBrands, 
    beverageEnergyBrands, 
    beverageOtherBrands 
} from './grocery_beverages';

// 🔥 CÁC MẢNG BÁNH KẸO
import { 
    confVnBrands, 
    confIntlBrands, 
    confChocoBrands, 
    confCandyBrands, 
    confSnackBrands, 
    confCakeBrands, 
    confCorpBrands 
} from './grocery_confectionery';

export const GROCERY_BRANDS = {
    // 🧂 NGÀNH GIA VỊ (Mới bổ sung phân tầng)
    SPICES_SEASONINGS: spiceBrands, // Giữ nguyên fallback cũ
    SPICE_FISH_SAUCE: spiceFishSauceBrands,
    SPICE_OIL: spiceOilBrands,
    SPICE_OTHER: spiceOtherBrands,
    
    // 🐾 NGÀNH THÚ CƯNG
    PET_CARE: petCareBrands, 
    PET_DOG_FOOD: petDogFoodBrands,
    PET_CAT_LITTER: petCatLitterBrands,
    PET_OTHER: petOtherBrands,
    
    // 💊 NGÀNH SỨC KHỎE & VITAMIN
    HEALTH_SUPPLEMENTS: healthSupplementBrands, 
    HEALTH_VITAMIN: healthVitaminBrands,
    HEALTH_DIGESTIVE: healthDigestiveBrands,
    HEALTH_OTHER: healthOtherBrands,

    // 🧊 NGÀNH ĐÔNG LẠNH
    FROZEN: frozenBrands, 
    FROZEN_ICE_CREAM: frozenIceCreamBrands,
    FROZEN_SEAFOOD: frozenSeafoodBrands,
    FROZEN_OTHER: frozenOtherBrands,
    
    // 🥩 NGÀNH TƯƠI SỐNG
    FRESH_FOOD: freshFoodBrands, 
    FRESH_MEAT: freshMeatBrands,
    FRESH_VEGGIE: freshVeggieBrands,
    FRESH_OTHER: freshOtherBrands,
    
    // 🍜 NGÀNH THỰC PHẨM KHÔ
    DRY_FOOD: dryFoodBrands, 
    DRY_NOODLE: dryNoodleBrands,
    DRY_RICE: dryRiceBrands,
    DRY_OTHER: dryOtherBrands,
    
    // 💄 NGÀNH HÓA MỸ PHẨM 
    COSMETICS_TOILETRIES: cosmeticsBrands, 
    COS_LAUNDRY: cosLaundryBrands,
    COS_SKINCARE: cosSkincareBrands,
    COS_OTHER: cosOtherBrands,
    
    // 🍼 NGÀNH MẸ & BÉ 
    BABY_MILK: babyMilkBrands,
    BABY_DIAPER: babyDiaperBrands,
    BABY_FOOD: babyFoodBrands,
    BABY_GEAR: babyGearBrands,

    // 🥤 NGÀNH ĐỒ UỐNG 
    BEV_SODA: beverageSodaBrands,
    BEV_TEA: beverageTeaBrands,
    BEV_WATER: beverageWaterBrands,
    BEV_MILK: beverageMilkBrands,
    BEV_PLANT_MILK: beveragePlantMilkBrands,
    BEV_JUICE: beverageJuiceBrands,
    BEV_COFFEE: beverageCoffeeBrands,
    BEV_BREW_TEA: beverageBrewTeaBrands,
    BEV_BEER: beverageBeerBrands,
    BEV_ENERGY: beverageEnergyBrands,
    BEV_OTHER: beverageOtherBrands,

    // 🍬 NGÀNH BÁNH KẸO
    CONF_VN: confVnBrands,
    CONF_INTL: confIntlBrands,
    CONF_CHOCO: confChocoBrands,
    CONF_CANDY: confCandyBrands,
    CONF_SNACK: confSnackBrands,
    CONF_CAKE: confCakeBrands,
    CONF_CORP: confCorpBrands,
    
    // Các ngành khác
    OTHER: otherGroceryBrands,
};

export const getGroceryBrandsByCategory = (categoryKey) => {
    return GROCERY_BRANDS[categoryKey] || ["Khác"];
};

export const getAllGroceryBrands = () => {
    const allBrands = new Set();
    Object.values(GROCERY_BRANDS).forEach((brands) => {
        if (brands && Array.isArray(brands)) {
            brands.forEach((brand) => {
                allBrands.add(brand);
            });
        }
    });
    return Array.from(allBrands).sort();
};

export default GROCERY_BRANDS;