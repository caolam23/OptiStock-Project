/**
 * Gaming Consoles and Devices Brand Models Data
 */

export const gamingModels = {
    'Sony_Gaming': {
        label: 'Sony',
        category: 'Thiết bị gaming',
        models: [
            {
                id: 'ps5-standard',
                name: 'PlayStation 5 (Standard)',
                year: 2020,
                colors: ['Trắng'],
                storageOptions: ['825GB'],
                specs: {
                    'Loại': 'Console',
                    'CPU': 'Custom AMD Zen 2',
                    'GPU': 'RDNA 2',
                    'RAM': '16GB',
                    'Storage': '825GB SSD',
                }
            },
            {
                id: 'ps5-digital',
                name: 'PlayStation 5 (Digital)',
                year: 2020,
                colors: ['Trắng'],
                storageOptions: ['825GB'],
                specs: {
                    'Loại': 'Console',
                    'CPU': 'Custom AMD Zen 2',
                    'GPU': 'RDNA 2',
                    'RAM': '16GB',
                    'Storage': '825GB SSD',
                }
            },
            {
                id: 'ps5-pro',
                name: 'PlayStation 5 Pro',
                year: 2024,
                colors: ['Đen Trắng'],
                storageOptions: ['2TB'],
                specs: {
                    'Loại': 'Console',
                    'CPU': 'Custom AMD Zen 2',
                    'GPU': 'RDNA 2 Enhanced',
                    'RAM': '16GB',
                    'Storage': '2TB SSD',
                }
            }
        ]
    },
    'Microsoft_Gaming': {
        label: 'Microsoft',
        category: 'Thiết bị gaming',
        models: [
            {
                id: 'xbox-series-x',
                name: 'Xbox Series X',
                year: 2020,
                colors: ['Đen'],
                storageOptions: ['1TB'],
                specs: {
                    'Loại': 'Console',
                    'CPU': 'Custom AMD Zen 2',
                    'GPU': 'RDNA 2',
                    'RAM': '16GB',
                    'Storage': '1TB SSD',
                }
            },
            {
                id: 'xbox-series-s',
                name: 'Xbox Series S',
                year: 2020,
                colors: ['Trắng'],
                storageOptions: ['512GB'],
                specs: {
                    'Loại': 'Console',
                    'CPU': 'Custom AMD Zen 2',
                    'GPU': 'RDNA 2 Custom',
                    'RAM': '10GB',
                    'Storage': '512GB SSD',
                }
            },
            {
                id: 'xbox-controller-series2',
                name: 'Xbox Wireless Controller Series 2',
                year: 2024,
                colors: ['Đen', 'Trắng', 'Xanh'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Controller',
                    'Kết nối': 'Wireless 2.4GHz',
                    'Pin': 'AA Batteries',
                    'Features': 'Share Button, Textured Grip',
                }
            }
        ]
    },
    'Nintendo_Gaming': {
        label: 'Nintendo',
        category: 'Thiết bị gaming',
        models: [
            {
                id: 'switch-oled',
                name: 'Switch OLED Model',
                year: 2021,
                colors: ['Trắng', 'Đen', 'Neon'],
                storageOptions: ['64GB'],
                specs: {
                    'Loại': 'Hybrid Console',
                    'Display': '7 inch 720p OLED',
                    'Storage': '64GB',
                    'Battery': '~4.5-9 hours',
                    'Features': 'Handheld & Dock',
                }
            },
            {
                id: 'switch-v2',
                name: 'Switch (Renewed Model)',
                year: 2019,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['32GB'],
                specs: {
                    'Loại': 'Hybrid Console',
                    'Display': '6.2 inch 720p LCD',
                    'Storage': '32GB',
                    'Battery': '~5.5-9 hours',
                    'Features': 'Handheld & Dock',
                }
            },
            {
                id: 'switch-lite',
                name: 'Switch Lite',
                year: 2019,
                colors: ['Xám', 'Xanh', 'Vàng'],
                storageOptions: ['32GB'],
                specs: {
                    'Loại': 'Portable Console',
                    'Display': '5.5 inch 720p LCD',
                    'Storage': '32GB',
                    'Battery': '~5.5 hours',
                    'Features': 'Portable Only',
                }
            }
        ]
    },
};
