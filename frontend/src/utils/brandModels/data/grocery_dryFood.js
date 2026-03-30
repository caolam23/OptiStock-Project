// grocery_dryFood.js

// 1. Chỉ hiện Acecook, Omachi
export const dryNoodleBrands = ["Acecook", "Omachi"];

// 2. Chỉ hiện Lộc Trời
export const dryRiceBrands = ["Lộc Trời"];

// 3. Các thương hiệu còn lại (đã bỏ Acecook, Omachi và Lộc Trời)
export const dryOtherBrands = [
    // 🇻🇳 Mì gói / thực phẩm tiện lợi khác
    "Vifon", "Miliket", "Kokomi", "Cung Đình", "Gấu Đỏ",
    "Colusa - Miliket", "Sagami",

    // 🏢 Tập đoàn / thương hiệu lớn VN
    "Masan", "Cholimex", "Nam Ngư",
    "Vissan", "CP Vietnam", "Dabaco",
    "Lương Gia", "Tân Long Group",

    // 🍚 Gạo / ngũ cốc khác
    "Vinaseed", "Gạo ST25",
    "Hoa Sữa", "Tài Nguyên", "An Gia",
    "Neptune Rice", "Simply Rice",

    // 🌍 Quốc tế - mì, pasta, thực phẩm khô
    "Nissin", "Samyang", "Nongshim",
    "Ottogi", "Paldo",
    "Barilla", "De Cecco", "San Remo",

    // 🥫 Đồ hộp / thực phẩm đóng gói
    "Hạ Long", "Seaspimex", "3 Cô Gái",
    "Heinz", "Spam", "Ayam Brand",

    // 🧂 Gia vị khô (liên quan trực tiếp)
    "Knorr", "Maggi", "Aji-ngon",
    "Ajinomoto", "Vedaan", "Lee Kum Kee",

    // 🌾 Ngũ cốc / cereal
    "Kellogg's", "Nestlé", "Quaker",
    "Weetabix", "Calbee",

    // 🇻🇳 Thương hiệu Việt phổ biến khác
    "Tường An", "Simply", "Meizan",
    "Cái Lân", "Neptune",

    // 🔧 fallback
    "Khác"
];

// 4. Fallback gộp lại như cũ để đảm bảo không gãy code ở những nơi dùng mảng tổng
export const dryFoodBrands = [...dryNoodleBrands, ...dryRiceBrands, ...dryOtherBrands];