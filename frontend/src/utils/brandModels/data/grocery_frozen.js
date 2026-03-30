// Đồ đông lạnh - Cá, tôm, thịt, thực phẩm chế biến, kem

// 1. Chỉ hiện Wall's, Merino
export const frozenIceCreamBrands = ["Wall's", "Merino"];

// 2. Chỉ hiện Minh Phú
export const frozenSeafoodBrands = ["Minh Phú"];

// 3. Các thương hiệu còn lại (Đã bỏ Wall's, Merino và Minh Phú)
export const frozenOtherBrands = [
    // 🐟 Thủy sản đông lạnh (cá, tôm)
    "Vĩnh Hoàn", "Hùng Vương",
    "Biển Đông", "Cadovimex", "Seaprodex",
    "Basa Mekong", "Seafood Mekong",

    // 🥩 Thịt & thực phẩm đông lạnh
    "CP", "CP Vietnam", "MeatDeli",
    "Vissan", "Dabaco", "BaF Meat",
    "GreenFeed", "3F Việt",

    // 🍤 Thực phẩm chế biến đông lạnh
    "CJ Cầu Tre", "Cầu Tre", "SG Food",
    "Đức Việt", "Vissan Ready",
    "CP Ready Meal", "Orifood",
    "Godaco", "Kinh Đô Frozen",

    // 🍦 Kem (ice cream) khác
    "Cornetto", "Magnum",
    "Celano", "Vinamilk Ice Cream",
    "TH True Ice Cream", "Nestlé Ice Cream",
    "Häagen-Dazs", "Baskin Robbins",
    "Ben & Jerry's",

    // 🌍 Thương hiệu quốc tế
    "Maruha Nichiro", "Nippon Suisan",
    "Thai Union", "Ajinomoto Frozen",

    // 🇻🇳 Chuỗi bán lẻ / nhãn riêng
    "Co.op Select Frozen",
    "WinMart Frozen",
    "Bách Hóa Xanh Frozen",
    "AEON Frozen",

    // 🔧 fallback
    "Khác"
];

// 4. Fallback gộp lại như cũ
export const frozenBrands = [...frozenIceCreamBrands, ...frozenSeafoodBrands, ...frozenOtherBrands];