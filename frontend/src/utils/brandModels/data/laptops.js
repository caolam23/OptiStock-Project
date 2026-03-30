/**
 * Laptop Brand Models Data
 */

export const laptopModels = {
    'Apple_Laptop': {
        label: 'Apple',
        category: 'Laptop',
        models: [
            {
                id: 'mbp-16-m3-max',
                name: 'MacBook Pro 16" M4 Max',
                year: 2024,
                colors: ['Bạc', 'Đen Không gian'],
                storageOptions: ['512GB', '1TB', '2TB'],
                specs: {
                    'CPU': 'Apple M4 Max',
                    'RAM': '36GB',
                    'Dung lượng': '512GB',
                    'Display': '16 inch Liquid Retina XDR',
                    'GPU': '48-core GPU',
                }
            },
            {
                id: 'mbp-14-m4-pro',
                name: 'MacBook Pro 14" M4 Pro',
                year: 2024,
                colors: ['Bạc', 'Đen Không gian'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Apple M4 Pro',
                    'RAM': '18GB',
                    'Dung lượng': '512GB',
                    'Display': '14.2 inch Liquid Retina XDR',
                    'GPU': '20-core GPU',
                }
            },
            {
                id: 'mbp-13-m3',
                name: 'MacBook Pro 13" M3',
                year: 2024,
                colors: ['Bạc', 'Đen Không gian'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Apple M3',
                    'RAM': '8GB',
                    'Dung lượng': '256GB',
                    'Display': '13.3 inch Retina',
                    'GPU': '8-core GPU',
                }
            },
            {
                id: 'mba-15-m3',
                name: 'MacBook Air 15" M3',
                year: 2024,
                colors: ['Bạc', 'Đen Không gian', 'Xám'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Apple M3',
                    'RAM': '8GB',
                    'Dung lượng': '256GB',
                    'Display': '15.3 inch Liquid Retina',
                    'GPU': '10-core GPU',
                }
            }
        ]
    },
    'Dell_Laptop': {
        label: 'Dell',
        category: 'Laptop',
        models: [
            {
                id: 'xps-17-9730',
                name: 'XPS 17 (9730)',
                year: 2024,
                colors: ['Bạc', 'Xám'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i9-13900H',
                    'RAM': '32GB DDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '17 inch 4K OLED',
                    'GPU': 'NVIDIA RTX 4060',
                }
            },
            {
                id: 'xps-15-9530',
                name: 'XPS 15 (9530)',
                year: 2024,
                colors: ['Bạc', 'Xám'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-13700H',
                    'RAM': '16GB DDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '15.6 inch 4K OLED',
                    'GPU': 'NVIDIA RTX 4050',
                }
            },
            {
                id: 'xps-13-9330',
                name: 'XPS 13 (9330)',
                year: 2024,
                colors: ['Bạc', 'Xám'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Intel Core i7-1365U',
                    'RAM': '16GB LPDDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '13.4 inch FHD+ IPS',
                    'GPU': 'Intel Iris Xe',
                }
            },
            {
                id: 'inspiron-15-5530',
                name: 'Inspiron 15 (5530)',
                year: 2024,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Intel Core i5-13420H',
                    'RAM': '8GB DDR4',
                    'Dung lượng': '512GB SSD',
                    'Display': '15.6 inch FHD IPS',
                    'GPU': 'NVIDIA RTX 3050',
                }
            }
        ]
    },
    'HP_Laptop': {
        label: 'HP',
        category: 'Laptop',
        models: [
            {
                id: 'pavilion-15-m',
                name: 'HP Pavilion 15 (M-Series)',
                year: 2024,
                colors: ['Bạc', 'Xám'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Intel Core i5-13500H',
                    'RAM': '8GB DDR4',
                    'Dung lượng': '256GB SSD',
                    'Display': '15.6 inch Full HD IPS',
                    'GPU': 'Intel Iris Xe',
                }
            },
            {
                id: 'envy-13-ba',
                name: 'HP Envy 13',
                year: 2024,
                colors: ['Bạc', 'Xám'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Intel Core i7-1365U',
                    'RAM': '16GB LPDDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '13.3 inch OLED',
                    'GPU': 'Intel Iris Xe',
                }
            },
            {
                id: 'omen-16-ba',
                name: 'HP Omen 16',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-14700H',
                    'RAM': '16GB DDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '16 inch 2.5K 165Hz',
                    'GPU': 'NVIDIA RTX 4070',
                }
            }
        ]
    },
    'ASUS_Laptop': {
        label: 'ASUS',
        category: 'Laptop',
        models: [
            {
                id: 'rog-zephyrus-g16',
                name: 'ROG Zephyrus G16',
                year: 2024,
                colors: ['Đen', 'Xám'],
                storageOptions: ['1TB', '2TB'],
                specs: {
                    'CPU': 'Intel Core i9-14900HX',
                    'RAM': '32GB DDR5',
                    'Dung lượng': '1TB SSD',
                    'Display': '16 inch OLED 240Hz',
                    'GPU': 'NVIDIA RTX 4090',
                }
            },
            {
                id: 'rog-zephyrus-g15',
                name: 'ROG Zephyrus G15',
                year: 2024,
                colors: ['Đen', 'Xám'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-14700H',
                    'RAM': '16GB DDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '15.6 inch OLED 165Hz',
                    'GPU': 'NVIDIA RTX 4070',
                }
            },
            {
                id: 'vivobook-pro-15',
                name: 'Vivobook Pro 15',
                year: 2024,
                colors: ['Bạc', 'Xám'],
                storageOptions: ['512GB'],
                specs: {
                    'CPU': 'AMD Ryzen 7 7735U',
                    'RAM': '16GB',
                    'Dung lượng': '512GB SSD',
                    'Display': '15.6 inch OLED 2.8K',
                    'GPU': 'AMD Radeon',
                }
            }
        ]
    },
    'Lenovo_Laptop': {
        label: 'Lenovo',
        category: 'Laptop',
        models: [
            {
                id: 'thinkpad-x1-carbon',
                name: 'ThinkPad X1 Carbon Gen 12',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-1365U',
                    'RAM': '16GB LPDDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '14 inch IPS Full HD',
                    'GPU': 'Intel Iris Xe',
                }
            },
            {
                id: 'thinkpad-e15-gen7',
                name: 'ThinkPad E15 Gen 7',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['256GB', '512GB'],
                specs: {
                    'CPU': 'Intel Core i5-1335U',
                    'RAM': '8GB DDR5',
                    'Dung lượng': '512GB SSD',
                    'Display': '15.6 inch FHD IPS',
                    'GPU': 'Intel Iris Xe',
                }
            },
            {
                id: 'thinkpad-p16-pro',
                name: 'ThinkPad P16 Pro',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i9-13900H',
                    'RAM': '32GB DDR5',
                    'Dung lượng': '1TB SSD',
                    'Display': '16 inch IPS 4K',
                    'GPU': 'NVIDIA RTX 5880',
                }
            },
            {
                id: 'legion-pro-7i',
                name: 'Legion Pro 7i',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i9-14900HX',
                    'RAM': '32GB DDR5',
                    'Dung lượng': '1TB SSD',
                    'Display': '16 inch 2.5K 165Hz',
                    'GPU': 'NVIDIA RTX 4080',
                }
            }
        ]
    },
};
