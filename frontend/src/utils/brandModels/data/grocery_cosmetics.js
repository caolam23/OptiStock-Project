// grocery_cosmetics.js

// 1. Chỉ hiện Omo, Ariel
export const cosLaundryBrands = ["Omo", "Ariel"];

// 2. Chỉ hiện La Roche-Posay, Vichy
export const cosSkincareBrands = ["La Roche-Posay", "Vichy"];

// 3. Các thương hiệu còn lại
export const cosOtherBrands = [
    "Unilever", "P&G", "Kao", "L'Oréal", "Johnson & Johnson",
    "Colgate-Palmolive", "Reckitt Benckiser", "Amway",
    "LG Household & Health Care", "Shiseido",
    "Dove", "Lux", "Lifebuoy", "Sunsilk", "Clear",
    "Pantene", "Head & Shoulders", "Rejoice",
    "TRESemmé", "Herbal Essences",
    "Nivea", "Vaseline", "Neutrogena",
    "Olay", "Simple", "Cetaphil",
    "Hada Labo", "Senka", "Biore",
    "Innisfree", "The Face Shop",
    "Laneige", "Some By Mi",
    "Colgate", "Closeup", "P/S", "Oral-B",
    "Sensodyne", "Aquafresh",
    "Dettol", "Safeguard", 
    "Sunlight", "Joy", "Axion",
    "Gift", "Net", "Lix",
    "Surf", "Tide", "Downy", "Comfort", "D-nee", "Aba", "NET", // Đã bỏ Omo, Ariel
    "Cif", "Vim", "Duck",
    "Mr Muscle", "Sao Thái Dương", "Rocket",
    "Pulppy", "Bless You", "An An",
    "Watsons", "Tempo", "Kleenex",
    "Maybelline", "L'Oréal Paris",
    "MAC", "Estee Lauder",
    "Shu Uemura", "3CE",
    "Black Rouge", "Romand",
    "Thorakao", "Cocoon", "Netco",
    "Diana Unicharm",
    "The Body Shop", "Yves Rocher",
    "Origins", "Dr Organic",
    "Khác"
];

// 4. Fallback gộp lại như cũ để đảm bảo không gãy code ở những nơi dùng mảng tổng
export const cosmeticsBrands = [...cosLaundryBrands, ...cosSkincareBrands, ...cosOtherBrands];