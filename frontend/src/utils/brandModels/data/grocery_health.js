// Sức khỏe & Vitamin - Thực phẩm chức năng, vitamin, bổ sung

// 1. Chỉ hiện Centrum
export const healthVitaminBrands = ["Centrum"];

// 2. Chỉ hiện BioGaia
export const healthDigestiveBrands = ["BioGaia"];

// 3. Các thương hiệu còn lại (Đã bỏ Centrum và BioGaia)
export const healthOtherBrands = [
    // 🌍 Quốc tế - vitamin & supplement lớn
    "Blackmores", "Nature Made", "Nature's Way",
    "Kirkland", "One A Day",
    "GNC", "Swisse", "Now Foods",
    "Solgar", "Puritan's Pride",
    "Healthy Care", "Webber Naturals",

    // 🧠 Nhóm bổ sung chuyên sâu
    "Doppelherz", "Bio Island",
    "Schiff", "Ostelin",
    "Caltrate", "Berocca",
    "Ensure", "Pediasure",

    // 🏢 Brand lớn liên quan dinh dưỡng
    "Abbott", "Nestlé Health Science",
    "Herbalife", "Amway Nutrilite",
    "Usana", "Forever Living",

    // 🇯🇵 Nhật Bản
    "Orihiro", "DHC", "Fancl",
    "Suntory Wellness", "Asahi Dear-Natura",

    // 🇰🇷 Hàn Quốc (nhân sâm, đông y)
    "Cheong Kwan Jang", "KGC",
    "Korea Ginseng Corp",
    "Ilhwa", "Daedong Korea Ginseng",

    // 🇻🇳 Việt Nam
    "Traphaco", "Dược Hậu Giang",
    "Imexpharm", "Nam Dược",
    "Hoa Linh", "Eco Pharma",
    "Doppelherz Vietnam",

    // 🌿 Đông y / thảo dược
    "Sâm Ngọc Linh", "Linh Chi Việt",
    "Nam Dược Herbal", "Thiên Sư",
    "Hồng Sâm Hàn Quốc",

    // 🧃 Men vi sinh / tiêu hóa khác
    "Enterogermina",
    "Yakult", "Probi",
    "Optibac", "Culturelle",

    // 🔧 fallback
    "Khác"
];

// 4. Fallback gộp lại như cũ để không làm gãy code
export const healthSupplementBrands = [...healthVitaminBrands, ...healthDigestiveBrands, ...healthOtherBrands];