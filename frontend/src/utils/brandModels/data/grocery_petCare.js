// Thú cưng - Thức ăn, phụ kiện, chăm sóc

// 1. Chỉ hiện Pedigree
export const petDogFoodBrands = ["Pedigree"];

// 2. Chỉ hiện Catsan
export const petCatLitterBrands = ["Catsan"];

// 3. Các thương hiệu còn lại (Đã bỏ Pedigree và Catsan)
export const petOtherBrands = [
    // 🐶 Thức ăn chó khác
    "Royal Canin", "SmartHeart",
    "Ganador", "Minino", "Fitmin",
    "Taste of the Wild", "Orijen", "Acana",
    "Dog Chow", "Pro Plan",

    // 🐱 Thức ăn mèo
    "Whiskas", "Me-O", "Royal Canin",
    "Felix", "Sheba", "Cat Chow",
    "Pro Plan Cat", "Friskies",
    "Kit Cat", "Cindy's Recipe",

    // 🥩 Thức ăn cao cấp / organic
    "Wellness", "Nutro", "Hill's Science Diet",
    "Black Hawk", "Earthborn Holistic",
    "Canidae", "Farmina", "Ziwi Peak",

    // 🐾 Snack / pate / súp thưởng
    "Ciao (INABA)", "Wanpy", "JerHigh",
    "SmartHeart Gold", "Me-O Creamy",
    "Sheba Pate", "Royal Canin Treats",

    // 🧴 Chăm sóc (sữa tắm, vệ sinh)
    "TropiClean", "Bio-Groom", "SOS",
    "Fay", "Joyce & Dolls", "Forcans",

    // 🧻 Cát vệ sinh mèo khác
    "Ever Clean", "Kit Cat Litter",
    "Me-O Litter", "Sanicat", "Dr. Elsey's",

    // 🐕 Phụ kiện
    "Ferplast", "PetSafe", "Trixie",
    "Karlie", "Hartz", "Flexi",

    // 🏥 Thương hiệu thú y / chăm sóc sức khỏe
    "Virbac", "Bayer Pet", "Frontline",
    "Beaphar", "Zoetis",

    // 🇻🇳 Thương hiệu phổ biến tại VN
    "SmartHeart Vietnam", "Minino Vietnam",
    "ANF", "Zenith", "Classic Pets",

    // 🏪 Chuỗi / nhãn riêng
    "Petco", "PetSmart", "DoggyMan",

    // 🔧 fallback
    "Khác"
];

// 4. Fallback gộp lại như cũ
export const petCareBrands = [...petDogFoodBrands, ...petCatLitterBrands, ...petOtherBrands];