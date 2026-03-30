// grocery_freshFood.js

// 1. Chỉ hiện CP, MeatDeli
export const freshMeatBrands = ["CP", "MeatDeli"];

// 2. Chỉ hiện VinEco
export const freshVeggieBrands = ["VinEco"];

// 3. Các thương hiệu còn lại (đã bỏ CP, MeatDeli và VinEco)
export const freshOtherBrands = [
    // 🐖 Thực phẩm chăn nuôi khác
    "CP Vietnam", "Vissan", "Dabaco", "BaF Meat", "GreenFeed",
    "Japfa", "CJ Vina Agri", "HAGL Agrico",

    // 🥚 Trứng
    "Ba Huân", "V.Food", "Dabaco Eggs",
    "CP Eggs", "San Hà", "Happy Egg",

    // 🐔 Gia cầm
    "San Hà", "CP Chicken", "Dabaco Chicken",
    "3F Việt", "Vietgap Chicken",

    // 🐟 Thủy sản
    "Minh Phú", "Vĩnh Hoàn", "Hùng Vương",
    "Biển Đông", "Seafood Mekong",
    "Basa Mekong", "Cadovimex",

    // 🥬 Rau củ / nông sản sạch khác
    "Dalat GAP", "Organica",
    "Nông trại Cười", "Green Farm",
    "EcoFarm", "VietGAP Farm",
    "Organic Food Việt Nam",

    // 🍎 Trái cây (nội địa + nhập khẩu)
    "Dole", "Zespri", "Sunkist",
    "Driscoll's", "Rockit Apple",
    "Envy Apple", "Jazz Apple",
    "Sun World Fruits",

    // 🧺 Chuỗi bán lẻ / farm brand
    "WinEco", "Co.op Select",
    "Bách Hóa Xanh Fresh",
    "Lotte Mart Fresh",
    "AEON Fresh",

    // 🇻🇳 thương hiệu nông nghiệp phổ biến
    "Lộc Trời", "Vinamit",
    "Nafoods", "Hapro",
    "Saigon Co.op",

    // 🔧 fallback
    "Khác"
];

// 4. Fallback gộp lại như cũ để không làm gãy code ở bất kỳ đâu
export const freshFoodBrands = [...freshMeatBrands, ...freshVeggieBrands, ...freshOtherBrands];