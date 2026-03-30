/**
 * GroceryCategoryConfig.js - Configuration cho ngành "Tạp hóa & Siêu thị" (FMCG/Grocery)
 * * Cấu hình Dynamic Specs cho 10+ danh mục siêu thị
 * Tối ưu hóa UI/UX: Sử dụng preset Select (Combobox) để chuẩn hóa dữ liệu, hạn chế gõ tay.
 */

export const GROCERY_CATEGORIES = {
    FRESH_FOOD: {
        label: '🥩 Thực phẩm tươi sống',
        value: 'FRESH_FOOD',
        icon: '🥩',
        description: 'Thịt, cá, rau, trái cây tươi sống',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách / Khối lượng', type: 'select', options: ['Khay 250g', 'Khay 500g', 'Túi 1kg', 'Bó 300g', 'Hộp 500g', 'Bán cân ký (Kg)'], required: true },
            { name: 'origin', label: 'Nguồn gốc', type: 'select', options: ['Việt Nam', 'Mỹ (USA)', 'Úc (Australia)', 'Nhật Bản', 'Hàn Quốc', 'Na Uy', 'New Zealand', 'Trung Quốc'] },
            { name: 'storageTemperature', label: 'Nhiệt độ bảo quản', type: 'select', options: ['Bảo quản lạnh (2°C - 8°C)', 'Đông lạnh sâu (-18°C)', 'Trữ mát (0°C - 4°C)', 'Nhiệt độ phòng'] },
            { name: 'producer', label: 'Nhà cung cấp / Nông trại', type: 'select', options: ['Nông trại đối tác địa phương', 'Hợp tác xã Nông nghiệp', 'Nhập khẩu chính ngạch', 'VietGAP Farm', 'GlobalGAP Farm'] },
            { name: 'quality_grade', label: 'Tiêu chuẩn chất lượng', type: 'select', options: ['VietGAP', 'GlobalGAP', 'Organic (Hữu cơ 100%)', 'Hạng 1 (Premium)', 'Tiêu chuẩn xuất khẩu'] },
        ],
    },
    DRY_FOOD: {
        label: '🍜 Thực phẩm khô',
        value: 'DRY_FOOD',
        icon: '🍜',
        description: 'Mì, cơm, gạo, ngũ cốc, đồ hộp',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách đóng gói', type: 'select', options: ['Gói 80g', 'Gói 200g', 'Túi 500g', 'Túi 1kg', 'Bao 5kg', 'Bao 10kg', 'Bao 25kg', 'Thùng 30 gói'] },
            { name: 'origin', label: 'Nguồn gốc xuất xứ', type: 'select', options: ['Việt Nam', 'Thái Lan', 'Hàn Quốc', 'Nhật Bản', 'Đài Loan', 'Ý (Italy)', 'Châu Âu'] },
            { name: 'packaging_type', label: 'Loại bao bì', type: 'select', options: ['Gói nilon / màng nhôm', 'Hộp giấy', 'Hộp nhựa PET', 'Hũ thủy tinh', 'Lon thiếc', 'Túi Zip (Mở đóng nhiều lần)'] },
            { name: 'nutritional_info', label: 'Đặc tính dinh dưỡng', type: 'select', options: ['Giàu Protein', 'Chứa nhiều chất xơ', 'Không Gluten (Gluten-free)', 'Low Carb', 'Gạo lứt / Nguyên cám', 'Thuần chay (Vegan)'] },
        ],
    },
    BEVERAGES: {
        label: '🥤 Đồ uống',
        value: 'BEVERAGES',
        icon: '🥤',
        description: 'Nước ngọt, nước lọc, nước ép, bia, sữa',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Dung tích', type: 'select', options: ['Lon 330ml', 'Chai 350ml', 'Chai 500ml', 'Chai 1 Lít', 'Chai 1.5 Lít', 'Bình 5 Lít', 'Lốc 6 lon', 'Thùng 24 lon/chai'], required: true },
            { name: 'bottle_type', label: 'Loại bao bì/chai', type: 'select', options: ['Chai nhựa PET', 'Chai thủy tinh', 'Lon nhôm', 'Hộp giấy Tetra Pak', 'Túi nilon có vòi'] },
            { name: 'ingredients', label: 'Thành phần nổi bật', type: 'select', options: ['Không đường (Zero Sugar)', 'Ít đường (Light)', '100% Trái cây nguyên chất', 'Có gas (Carbonated)', 'Bổ sung Vitamin C', 'Bổ sung Canxi'] },
            { name: 'storage_condition', label: 'Điều kiện bảo quản', type: 'select', options: ['Nơi khô ráo, thoáng mát', 'Tránh ánh nắng trực tiếp', 'Bảo quản lạnh sau khi mở nắp', 'Ngon hơn khi uống lạnh'] },
        ],
    },
    CONFECTIONERY: {
        label: '🍬 Bánh kẹo',
        value: 'CONFECTIONERY',
        icon: '🍬',
        description: 'Bánh quy, kẹo dẻo, socola, snack',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Khối lượng tịnh', type: 'select', options: ['Gói 50g', 'Gói 150g', 'Hộp 200g', 'Hộp thiếc 500g', 'Hộp quà biếu 1kg', 'Gói gia đình (Family pack)'], required: true },
            { name: 'content_count', label: 'Quy cách lẻ', type: 'select', options: ['Chứa 10 gói nhỏ', 'Chứa 20 viên', 'Dây 10 gói', 'Bán lẻ từng thanh'] },
            { name: 'flavors', label: 'Hương vị', type: 'select', options: ['Sô-cô-la (Chocolate)', 'Vani (Vanilla)', 'Dâu tây', 'Trà xanh (Matcha)', 'Cà phê', 'Phô mai (Cheese)', 'Trái cây tổng hợp'] },
            { name: 'allergens', label: 'Cảnh báo dị ứng', type: 'select', options: ['Không chứa chất dị ứng', 'Có chứa Sữa', 'Có chứa Lạc (Đậu phộng)', 'Có chứa Đậu nành', 'Có chứa Lúa mì (Gluten)', 'Có chứa Hạt điều/Hạnh nhân'] },
        ],
    },
    SPICES_SEASONINGS: {
        label: '🧂 Gia vị',
        value: 'SPICES_SEASONINGS',
        icon: '🧂',
        description: 'Muối, đường, nước mắm, xì dầu, tương ớt',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách / Khối lượng', type: 'select', options: ['Chai 250ml', 'Chai 500ml', 'Can 2 Lít', 'Gói 100g', 'Gói 400g', 'Túi 1kg', 'Hũ 200g'], required: true },
            { name: 'spice_type', label: 'Phân loại', type: 'select', options: ['Nước mắm', 'Nước tương (Xì dầu)', 'Tương ớt / Tương cà', 'Hạt nêm', 'Bột ngọt (Mì chính)', 'Muối', 'Đường', 'Tiêu / Hành / Tỏi bột', 'Dầu ăn'] },
            { name: 'origin', label: 'Nguồn gốc', type: 'select', options: ['Sản xuất tại Việt Nam', 'Nhập khẩu Thái Lan', 'Nhập khẩu Nhật Bản', 'Nhập khẩu Hàn Quốc', 'Nhập khẩu Ấn Độ'] },
            { name: 'purity_rate', label: 'Đặc tính', type: 'select', options: ['Cốt nhĩ 100%', 'Lên men tự nhiên', 'Không thêm bột ngọt', 'Giảm mặn', 'Đường tinh luyện (Refined)', 'Đường ăn kiêng'] },
        ],
    },
    FROZEN: {
        label: '❄️ Đồ đông lạnh',
        value: 'FROZEN',
        icon: '❄️',
        description: 'Thịt/Hải sản cấp đông, kem, thực phẩm làm sẵn',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách đóng gói', type: 'select', options: ['Túi hút chân không 500g', 'Túi 1kg', 'Hộp nhựa 500g', 'Thùng 5kg', 'Khay 300g'], required: true },
            { name: 'storageTemperature', label: 'Nhiệt độ bảo quản', type: 'select', options: ['-18°C hoặc thấp hơn', '-20°C (Cấp đông sâu)', '0°C đến 4°C (Bảo quản ngắn ngày)'], required: true },
            { name: 'product_type', label: 'Phân loại', type: 'select', options: ['Hải sản nguyên con', 'Hải sản phi-lê', 'Thịt nguyên miếng', 'Thực phẩm chế biến sẵn (Cá viên, Xúc xích, Mandu)', 'Kem / Món tráng miệng', 'Rau củ hỗn hợp đông lạnh'] },
            { name: 'frozen_method', label: 'Công nghệ cấp đông', type: 'select', options: ['Cấp đông IQF siêu tốc', 'Cấp đông mềm', 'Đông lạnh tiêu chuẩn'] },
        ],
    },
    COSMETICS_TOILETRIES: {
        label: '🧴 Hóa mỹ phẩm & Đồ gia dụng',
        value: 'COSMETICS_TOILETRIES',
        icon: '🧴',
        description: 'Bột giặt, nước lau sàn, dầu gội, sữa tắm',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách / Dung tích', type: 'select', options: ['Chai 200ml', 'Chai 500ml', 'Chai có vòi 1 Lít', 'Can 3.6 Lít', 'Can 5 Lít', 'Túi châm thêm (Refill) 800ml', 'Túi bột 3kg', 'Túi bột 6kg'], required: true },
            { name: 'product_type', label: 'Loại sản phẩm', type: 'select', options: ['Dầu gội / Dầu xả', 'Sữa tắm / Xà phòng', 'Sữa rửa mặt', 'Kem đánh răng', 'Bột giặt / Nước giặt máy', 'Nước xả vải', 'Nước rửa chén', 'Nước lau sàn', 'Chất tẩy rửa bồn cầu'] },
            { name: 'ingredients', label: 'Thành phần nổi bật', type: 'select', options: ['Chiết xuất thiên nhiên', 'Than hoạt tính', 'Kháng khuẩn', 'Hương hoa', 'Không Paraben', 'An toàn cho da tay'] },
            { name: 'skin_type', label: 'Đặc tính (Cho Cơ thể/Tóc)', type: 'select', options: ['Dùng cho mọi loại da', 'Dành cho da nhạy cảm', 'Dành cho da khô', 'Phục hồi tóc hư tổn', 'Trị gàu'] },
        ],
    },
    BABY_CARE: {
        label: '👶 Mẹ & Bé',
        value: 'BABY_CARE',
        icon: '👶',
        description: 'Sữa bột trẻ em, tã bỉm, đồ ăn dặm',
        defaultSpecs: [
            { name: 'product_type', label: 'Phân loại chi tiết', type: 'select', options: ['Sữa bột công thức', 'Tã dán / Tã quần', 'Bột ăn dặm', 'Bình sữa / Núm ty', 'Sữa tắm bé'] },
            { name: 'weight_volume', label: 'Quy cách / Khối lượng', type: 'select', options: ['Lon thiếc 400g', 'Lon thiếc 800g', 'Bịch 48 miếng', 'Bịch 72 miếng', 'Hộp giấy 250g'], required: true },
            { name: 'age_range', label: 'Độ tuổi / Giai đoạn', type: 'select', options: ['Sơ sinh (Newborn)', 'Dưới 6 tháng', '6-12 tháng', '1-3 tuổi', 'Trên 3 tuổi', 'Mẹ bầu'] },
            { name: 'certifications', label: 'Chứng nhận An toàn', type: 'select', options: ['Đã kiểm nghiệm da liễu', 'Chứng nhận FDA Hoa Kỳ', 'Chuẩn Hữu cơ (Organic)', 'BPA Free'] },
        ],
    },
    PET_CARE: {
        label: '🐾 Thú cưng',
        value: 'PET_CARE',
        icon: '🐾',
        description: 'Thức ăn chó, mèo, cát vệ sinh',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách đóng gói', type: 'select', options: ['Túi Zip 400g', 'Túi 1.5kg', 'Bao 3kg', 'Bao 5kg', 'Bao 10kg', 'Lon Pâté 400g', 'Gói Súp 85g', 'Bao cát 5L (Khoảng 4kg)'], required: true },
            { name: 'pet_type', label: 'Dành cho Thú cưng', type: 'select', options: ['Dành cho Chó (Dog)', 'Dành cho Mèo (Cat)', 'Dành cho Hamster/Thỏ', 'Dành cho Cá', 'Mọi loại thú cưng'] },
            { name: 'food_type', label: 'Loại sản phẩm', type: 'select', options: ['Thức ăn hạt (Dry food)', 'Pâté / Súp (Wet food)', 'Bánh thưởng (Snack/Treat)', 'Sữa tắm thú cưng', 'Cát vệ sinh khử mùi', 'Đồ chơi/Phụ kiện'] },
            { name: 'life_stage', label: 'Giai đoạn phát triển', type: 'select', options: ['Thú non (Puppy/Kitten dưới 1 tuổi)', 'Trưởng thành (Adult 1-7 tuổi)', 'Thú cưng lớn tuổi (Senior trên 7 tuổi)', 'Phù hợp mọi lứa tuổi (All life stages)'] },
        ],
    },
    HEALTH_SUPPLEMENTS: {
        label: '💊 Sức khỏe & Vitamin',
        value: 'HEALTH_SUPPLEMENTS',
        icon: '💊',
        description: 'Thực phẩm chức năng, Vitamin, Sâm',
        defaultSpecs: [
            { name: 'content_count', label: 'Quy cách', type: 'select', options: ['Hộp 30 viên', 'Hộp 60 viên', 'Hộp 100 viên', 'Lọ 200 viên', 'Hộp 30 gói (Dạng bột/nước)', 'Chai 50ml x 10 lọ'] },
            { name: 'main_ingredient', label: 'Công dụng chính', type: 'select', options: ['Tăng cường sức đề kháng (Vitamin C, Kẽm)', 'Bổ xương khớp (Canxi, D3, Glucosamine)', 'Hỗ trợ tiêu hóa (Men vi sinh)', 'Làm đẹp da (Collagen, Vitamin E)', 'Bổ mắt, não bộ (Omega 3)', 'Bồi bổ sức khỏe (Nhân sâm, Yến sào)'] },
            { name: 'dosage', label: 'Hướng dẫn sử dụng', type: 'select', options: ['1 viên/ngày, sau bữa ăn', '2 viên/ngày, chia 2 lần', 'Pha 1 gói với 150ml nước', 'Chỉ dùng cho người lớn trên 18 tuổi'] },
            { name: 'certifications', label: 'Chứng nhận Y tế', type: 'select', options: ['Cấp phép bởi Cục ATTP (Bộ Y Tế)', 'Sản xuất đạt chuẩn GMP', 'Chứng nhận FDA Hoa Kỳ', 'Nhập khẩu Úc / Mỹ chính hãng'] },
        ],
    },
    OTHER: {
        label: '📦 Khác',
        value: 'OTHER',
        icon: '📦',
        description: 'Văn phòng phẩm, đồ tạp hóa nhỏ lẻ',
        defaultSpecs: [
            { name: 'weight_volume', label: 'Quy cách / Khối lượng', type: 'select', options: ['Cái / Chiếc', 'Hộp', 'Lốc', 'Vỉ'] },
            { name: 'material', label: 'Chất liệu / Thành phần', type: 'select', options: ['Nhựa an toàn', 'Thủy tinh', 'Inox', 'Giấy tái chế', 'Khác'] },
            { name: 'color_type', label: 'Màu sắc / Phân loại', type: 'text', placeholder: 'Nhập màu sắc hoặc đặc điểm...' },
        ],
    },
};

/**
 * Helper function - Lấy cấu hình specs cho một danh mục cụ thể
 * @param {string} categoryValue - Giá trị category (VD: 'FRESH_FOOD', 'BEVERAGES')
 * @returns {Array} Mảng specs hoặc null
 */
export const getGrocerySpecs = (categoryValue) => {
    const category = GROCERY_CATEGORIES[categoryValue];
    return category ? category.defaultSpecs : null;
};

/**
 * Helper function - Lấy label danh mục
 * @param {string} categoryValue - Giá trị category
 * @returns {string} Label của danh mục
 */
export const getGroceryCategoryLabel = (categoryValue) => {
    const category = GROCERY_CATEGORIES[categoryValue];
    return category ? category.label : categoryValue;
};

/**
 * Helper function - Convert mảng Specs thành format cho Form.List
 * Mỗi spec trong array trở thành một row trong Form.List
 * @param {Array} specs - Mảng specs từ defaultSpecs
 * @returns {Array} Specs đã format
 */
export const formatSpecsForForm = (specs) => {
    if (!specs) return [];
    return specs.map((spec, index) => ({
        ...spec,
        id: `spec-${index}`,
    }));
};

export default GROCERY_CATEGORIES;