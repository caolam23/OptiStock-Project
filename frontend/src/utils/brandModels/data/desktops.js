/**
 * Desktop PC Brand Models Data
 */

export const desktopModels = {
    'Dell_PC': {
        label: 'Dell',
        category: 'Máy tính để bàn (PC)',
        models: [
            {
                id: 'alienware-aurora-r15',
                name: 'Alienware Aurora R15',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['1TB', '2TB'],
                specs: {
                    'CPU': 'Intel Core i9-14900K',
                    'RAM': '32GB DDR5',
                    'GPU': 'NVIDIA RTX 4090',
                    'Storage': '1TB NVMe SSD',
                    'Power': '1500W',
                }
            },
            {
                id: 'alienware-aurora-r14',
                name: 'Alienware Aurora R14',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-14700K',
                    'RAM': '16GB DDR5',
                    'GPU': 'NVIDIA RTX 4070',
                    'Storage': '1TB SSD',
                    'Power': '850W',
                }
            },
            {
                id: 'xps-desktop-8960',
                name: 'XPS Desktop 8960',
                year: 2024,
                colors: ['Bạc', 'Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-14700',
                    'RAM': '16GB DDR5',
                    'GPU': 'Integrated / RTX 4060',
                    'Storage': '1TB SSD',
                    'Power': '650W',
                }
            }
        ]
    },
    'ASUS_PC': {
        label: 'ASUS',
        category: 'Máy tính để bàn (PC)',
        models: [
            {
                id: 'rog-strix-g35cy',
                name: 'ROG Strix G35CY',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['1TB', '2TB'],
                specs: {
                    'CPU': 'AMD Ryzen 9 7950X3D',
                    'RAM': '32GB DDR5',
                    'GPU': 'RTX 4090',
                    'Storage': '2TB NVMe SSD',
                    'Power': '1200W',
                }
            },
            {
                id: 'rog-strix-g32cy',
                name: 'ROG Strix G32CY',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['1TB'],
                specs: {
                    'CPU': 'AMD Ryzen 7 7700X',
                    'RAM': '16GB DDR5',
                    'GPU': 'RTX 4070',
                    'Storage': '1TB SSD',
                    'Power': '850W',
                }
            },
            {
                id: 'rog-strix-g31',
                name: 'ROG Strix G31',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['512GB', '1TB'],
                specs: {
                    'CPU': 'Intel Core i7-14700K',
                    'RAM': '32GB DDR5',
                    'GPU': 'NVIDIA RTX 4070',
                    'Storage': '1TB SSD',
                    'Power': '850W',
                }
            },
            {
                id: 'vivopc-m16',
                name: 'VivoPC M16',
                year: 2024,
                colors: ['Bạc'],
                storageOptions: ['512GB'],
                specs: {
                    'CPU': 'Intel Core i5-13400',
                    'RAM': '8GB DDR4',
                    'GPU': 'Integrated',
                    'Storage': '512GB SSD',
                    'Power': '400W',
                }
            }
        ]
    },
};
