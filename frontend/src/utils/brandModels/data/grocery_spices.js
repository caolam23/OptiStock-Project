// Gia vị - Muối, đường, nước mắm, nước tương, gia vị nêm nếm

// 1. Chỉ hiện Nam Ngư
export const spiceFishSauceBrands = ["Nam Ngư"];

// 2. Chỉ hiện Neptune
export const spiceOilBrands = ["Neptune"];

// 3. Các thương hiệu còn lại (Đã dọn dẹp các từ trùng lặp)
export const spiceOtherBrands = [
    // 🇻🇳 Nước mắm / nước chấm khác
    "Chinsu", "Phú Quốc",
    "Hạnh Phúc", "Cát Hải", "Liên Thành",
    "Hồng Hạnh", "Thanh Hà",

    // 🧂 Hạt nêm / bột ngọt
    "Knorr", "Maggi", "Aji-ngon",
    "Ajinomoto", "Vedan",
    "Miwon", "Cholimex",

    // 🍶 Nước tương / xì dầu
    "Tam Thái Tử", "Lee Kum Kee", "Kikkoman",
    "Yamasa", "Haday",

    // 🌶️ Tương ớt / tương cà
    "Heinz", "Ottogi",

    // 🛢️ Dầu ăn khác
    "Simply", "Tường An",
    "Meizan", "Cái Lân",
    "Olivoilà", "Borges",

    // 🧂 Muối / đường
    "Biên Hòa", "TTC Sugar",
    "Đường Quảng Ngãi",
    "Vinaseed Sugar",
    "Muối Bạc Liêu",

    // 🌿 Gia vị khô / tiêu / quế
    "Dh Foods", "Gia Vị Việt",
    "Barona", "Ofood",
    "McCormick", "Simply Organic",

    // 🌍 Quốc tế (các hãng chưa liệt kê ở trên)
    "CJ Foods",

    // 🇻🇳 Thương hiệu phổ biến khác
    "Masan", "Cholimex Food",
    "Acecook Gia Vị",

    // 🔧 fallback
    "Khác"
];

// 4. Fallback gộp lại như cũ
export const spiceBrands = [...spiceFishSauceBrands, ...spiceOilBrands, ...spiceOtherBrands];