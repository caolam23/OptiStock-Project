/**
 * Smartphone Brand Models Data
 */

export const smartphoneModels = {
    'Apple_Smartphone': {
        label: 'Apple',
        category: 'Điện thoại',
        models: [
            {
                id: 'iphone-15-pro-max',
                name: 'iPhone 15 Pro Max',
                year: 2023,
                colors: ['Đen Titan', 'Trắng Titan', 'Xanh Titan', 'Tự nhiên Titan'],
                storageOptions: ['256GB', '512GB', '1TB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '8GB',
                    'Màu': 'Đen Titan',
                    'Display': '6.7 inch Super Retina XDR OLED 120Hz',
                    'Processor': 'A17 Pro',
                }
            },
            {
                id: 'iphone-15-pro',
                name: 'iPhone 15 Pro',
                year: 2023,
                colors: ['Đen Titan', 'Trắng Titan', 'Xanh Titan'],
                storageOptions: ['128GB', '256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '8GB',
                    'Display': '6.1 inch Super Retina XDR OLED 120Hz',
                    'Processor': 'A17 Pro',
                    'Camera': '48MP Main',
                }
            },
            {
                id: 'iphone-15',
                name: 'iPhone 15',
                year: 2023,
                colors: ['Đen', 'Xanh dương', 'Xanh lục', 'Vàng'],
                storageOptions: ['128GB', '256GB', '512GB'],
                specs: {
                    'Dung lượng': '128GB',
                    'RAM': '6GB',
                    'Display': '6.1 inch Liquid Retina OLED',
                    'Processor': 'A16 Bionic',
                    'Camera': '12MP Dual',
                }
            },
            {
                id: 'iphone-14-pro-max',
                name: 'iPhone 14 Pro Max',
                year: 2022,
                colors: ['Đen', 'Tím', 'Vàng', 'Bạc'],
                storageOptions: ['128GB', '256GB', '512GB', '1TB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '6GB',
                    'Display': '6.7 inch ProMotion LTPO OLED',
                    'Processor': 'A16 Bionic',
                    'Camera': '48MP Pro',
                }
            },
            {
                id: 'iphone-14',
                name: 'iPhone 14',
                year: 2022,
                colors: ['Đen', 'Tím', 'Xanh dương'],
                storageOptions: ['128GB', '256GB', '512GB'],
                specs: {
                    'Dung lượng': '128GB',
                    'RAM': '6GB',
                    'Display': '6.1 inch Super Retina XDR OLED',
                    'Processor': 'A15 Bionic',
                    'Camera': '12MP Dual',
                }
            }
        ]
    },
    'Samsung_Smartphone': {
        label: 'Samsung',
        category: 'Điện thoại',
        models: [
            {
                id: 'galaxy-s24-ultra',
                name: 'Galaxy S24 Ultra',
                year: 2024,
                colors: ['Đen', 'Xám', 'Xanh lục', 'Bạc'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '12GB',
                    'Màu': 'Đen',
                    'Display': '6.8 inch 120Hz AMOLED',
                    'Processor': 'Snapdragon 8 Gen 3',
                }
            },
            {
                id: 'galaxy-s24-plus',
                name: 'Galaxy S24+',
                year: 2024,
                colors: ['Đen', 'Bạc', 'Vàng'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '12GB',
                    'Display': '6.7 inch 120Hz AMOLED',
                    'Processor': 'Snapdragon 8 Gen 3',
                    'Camera': '50MP Main',
                }
            },
            {
                id: 'galaxy-s24',
                name: 'Galaxy S24',
                year: 2024,
                colors: ['Đen', 'Bạc', 'Xanh lục'],
                storageOptions: ['128GB', '256GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '8GB',
                    'Display': '6.2 inch 120Hz AMOLED',
                    'Processor': 'Snapdragon 8 Gen 3',
                    'Camera': '50MP Dual',
                }
            },
            {
                id: 'galaxy-s23-ultra',
                name: 'Galaxy S23 Ultra',
                year: 2023,
                colors: ['Đen', 'Xám', 'Xanh lục'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '12GB',
                    'Display': '6.8 inch 120Hz AMOLED',
                    'Processor': 'Snapdragon 8 Gen 2',
                    'Camera': '200MP Main',
                }
            },
            {
                id: 'galaxy-a54',
                name: 'Galaxy A54',
                year: 2023,
                colors: ['Đen', 'Trắng', 'Xanh dương'],
                storageOptions: ['128GB', '256GB'],
                specs: {
                    'Dung lượng': '128GB',
                    'RAM': '8GB',
                    'Display': '6.4 inch AMOLED',
                    'Processor': 'Exynos 1280',
                    'Camera': '50MP Main',
                }
            }
        ]
    },
    'Xiaomi_Smartphone': {
        label: 'Xiaomi',
        category: 'Điện thoại',
        models: [
            {
                id: 'xiaomi-14-ultra',
                name: 'Xiaomi 14 Ultra',
                year: 2024,
                colors: ['Đen', 'Vàng', 'Bạc', 'Xám'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'Dung lượng': '512GB',
                    'RAM': '16GB',
                    'Màu': 'Đen',
                    'Display': '6.73 inch AMOLED 120Hz',
                    'Processor': 'Snapdragon 8 Gen 3 Leading Version',
                }
            },
            {
                id: 'xiaomi-14',
                name: 'Xiaomi 14',
                year: 2024,
                colors: ['Đen', 'Trắng', 'Vàng'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '12GB',
                    'Display': '6.36 inch AMOLED 120Hz',
                    'Processor': 'Snapdragon 8 Gen 3',
                    'Camera': '50MP Main',
                }
            },
            {
                id: 'xiaomi-13-pro',
                name: 'Xiaomi 13 Pro',
                year: 2023,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '12GB',
                    'Display': '6.73 inch AMOLED 120Hz',
                    'Processor': 'Snapdragon 8 Gen 2',
                    'Camera': '50MP Main + Leica',
                }
            },
            {
                id: 'xiaomi-redmi-note-13',
                name: 'Redmi Note 13 Pro',
                year: 2024,
                colors: ['Đen', 'Xanh dương', 'Tím'],
                storageOptions: ['128GB', '256GB', '512GB'],
                specs: {
                    'Dung lượng': '256GB',
                    'RAM': '8GB',
                    'Display': '6.67 inch AMOLED 120Hz',
                    'Processor': 'MediaTek Dimensity 7200',
                    'Camera': '50MP Main',
                }
            },
            {
                id: 'xiaomi-redmi-12c',
                name: 'Redmi 12C',
                year: 2024,
                colors: ['Đen', 'Trắng', 'Xanh'],
                storageOptions: ['64GB', '128GB'],
                specs: {
                    'Dung lượng': '128GB',
                    'RAM': '4GB',
                    'Display': '6.71 inch IPS LCD',
                    'Processor': 'MediaTek Helio G88',
                    'Camera': '50MP Single',
                }
            }
        ]
    },
};
