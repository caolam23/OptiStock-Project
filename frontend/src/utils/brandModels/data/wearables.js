/**
 * Wearable Devices Brand Models Data - Smartwatches
 */

export const wearableModels = {
    'Apple_Watch': {
        label: 'Apple',
        category: 'Thiết bị đeo',
        models: [
            {
                id: 'apple-watch-series-9',
                name: 'Apple Watch Series 9',
                year: 2023,
                colors: ['Bạc', 'Vàng', 'Đen Titan', 'Xanh'],
                storageOptions: ['32GB'],
                specs: {
                    'Kích thước': '41mm / 45mm',
                    'Processor': 'S9 Chip',
                    'Memory': '32GB',
                    'Display': '1.9 inch LTPO OLED',
                    'Battery': 'Up to 18 hours',
                }
            },
            {
                id: 'apple-watch-series-9-se',
                name: 'Apple Watch SE (3rd Gen)',
                year: 2024,
                colors: ['Bạc', 'Vàng', 'Đen'],
                storageOptions: ['16GB'],
                specs: {
                    'Kích thước': '40mm / 44mm',
                    'Processor': 'S8 Chip',
                    'Memory': '16GB',
                    'Display': '1.6 inch Retina LTPO OLED',
                    'Battery': 'Up to 18 hours',
                }
            },
            {
                id: 'apple-watch-ultra-2',
                name: 'Apple Watch Ultra 2',
                year: 2024,
                colors: ['Titan Tự nhiên', 'Titan Đen'],
                storageOptions: ['32GB'],
                specs: {
                    'Kích thước': '49mm',
                    'Processor': 'S9 Chip',
                    'Memory': '32GB',
                    'Display': '2.0 inch Retina LTPO OLED',
                    'Battery': 'Up to 36 hours',
                }
            }
        ]
    },
    'Samsung_Watch': {
        label: 'Samsung',
        category: 'Thiết bị đeo',
        models: [
            {
                id: 'galaxy-watch-6-classic',
                name: 'Galaxy Watch 6 Classic',
                year: 2023,
                colors: ['Đen', 'Bạc', 'Xám'],
                storageOptions: ['16GB'],
                specs: {
                    'Kích thước': '43mm / 47mm',
                    'Processor': 'Snapdragon 4100',
                    'Memory': '16GB',
                    'Display': '1.3 inch Super AMOLED',
                    'Battery': 'Up to 40 hours',
                }
            },
            {
                id: 'galaxy-watch-6',
                name: 'Galaxy Watch 6',
                year: 2023,
                colors: ['Đen', 'Bạc', 'Vàng'],
                storageOptions: ['16GB'],
                specs: {
                    'Kích thước': '40mm / 44mm',
                    'Processor': 'Snapdragon 4100',
                    'Memory': '16GB',
                    'Display': '1.3 inch Super AMOLED',
                    'Battery': 'Up to 40 hours',
                }
            },
            {
                id: 'galaxy-watch-5-pro',
                name: 'Galaxy Watch 5 Pro',
                year: 2022,
                colors: ['Đen', 'Xám', 'Vàng'],
                storageOptions: ['16GB'],
                specs: {
                    'Kích thước': '45mm',
                    'Processor': 'Snapdragon 4100',
                    'Memory': '16GB',
                    'Display': '1.4 inch AMOLED',
                    'Battery': 'Up to 80 hours',
                }
            }
        ]
    },
    'Xiaomi_Watch': {
        label: 'Xiaomi',
        category: 'Thiết bị đeo',
        models: [
            {
                id: 'mi-band-8-pro',
                name: 'Mi Band 8 Pro',
                year: 2023,
                colors: ['Đen', 'Xám', 'Vàng'],
                storageOptions: ['N/A'],
                specs: {
                    'Kích thước': '1.74 inch',
                    'Display': 'AMOLED 600 nits',
                    'Processor': 'Cortex-M4',
                    'Battery': 'Up to 14 days',
                    'Features': 'GPS, HR, Sleep',
                }
            },
            {
                id: 'mi-watch-s1-pro',
                name: 'Mi Watch S1 Pro',
                year: 2023,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['N/A'],
                specs: {
                    'Kích thước': '1.47 inch AMOLED',
                    'Processor': 'Dual-core',
                    'Memory': '512MB',
                    'Battery': 'Up to 24 hours',
                    'Features': 'GPS, NFC, eSIM',
                }
            },
            {
                id: 'mi-watch-lite-2',
                name: 'Mi Watch Lite 2',
                year: 2024,
                colors: ['Đen', 'Xanh'],
                storageOptions: ['N/A'],
                specs: {
                    'Kích thước': '1.4 inch LCD',
                    'Processor': 'Cortex-M4F',
                    'Memory': '128MB',
                    'Battery': 'Up to 10 days',
                    'Features': 'GPS, HR, Water-resistant',
                }
            }
        ]
    },
};
