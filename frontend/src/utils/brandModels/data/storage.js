/**
 * Storage Devices Brand Models Data - HDD, SSD, USB Drives
 */

export const storageModels = {
    'SanDisk_Storage': {
        label: 'SanDisk',
        category: 'Lưu trữ dữ liệu',
        models: [
            {
                id: 'sandisk-extreme-ssd-1tb',
                name: 'Extreme Portable SSD 1TB',
                year: 2024,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['256GB', '512GB', '1TB', '2TB'],
                specs: {
                    'Loại': 'External SSD',
                    'Dung lượng': '1TB',
                    'Tốc độ': 'Up to 1050 MB/s',
                    'Kết nối': 'USB 3.2 Gen 2',
                    'Khả năng chống nước': 'IP65',
                }
            },
            {
                id: 'sandisk-ultra-3d-ssd',
                name: 'Ultra 3D SSD 1TB',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['256GB', '512GB', '1TB', '2TB'],
                specs: {
                    'Loại': 'Internal SSD SATA',
                    'Dung lượng': '1TB',
                    'Tốc độ': 'Up to 560 MB/s',
                    'Form Factor': '2.5 inch',
                    'Warranty': '5 Years',
                }
            },
            {
                id: 'sandisk-ultra-fit-usb',
                name: 'Ultra Fit USB 3.1',
                year: 2024,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['32GB', '64GB', '128GB'],
                specs: {
                    'Loại': 'USB Flash Drive',
                    'Dung lượng': '128GB',
                    'Tốc độ': 'Up to 170 MB/s',
                    'Form Factor': 'Ultra-compact',
                    'Warranty': '2 Years',
                }
            }
        ]
    },
    'Seagate_Storage': {
        label: 'Seagate',
        category: 'Lưu trữ dữ liệu',
        models: [
            {
                id: 'seagate-barracuda-2tb',
                name: 'Barracuda 2TB HDD',
                year: 2023,
                colors: ['Đen'],
                storageOptions: ['2TB', '4TB', '8TB'],
                specs: {
                    'Loại': 'Internal HDD',
                    'Dung lượng': '2TB',
                    'Interface': 'SATA 6 Gb/s',
                    'RPM': '5400',
                    'Cache': '256MB',
                }
            },
            {
                id: 'seagate-firecuda-external',
                name: 'FireCuda Gaming HDD External',
                year: 2024,
                colors: ['Đen', 'RGB'],
                storageOptions: ['1TB', '2TB', '4TB'],
                specs: {
                    'Loại': 'External Gaming HDD',
                    'Dung lượng': '2TB',
                    'Interface': 'USB 3.0',
                    'Speed': 'Up to 7200 RPM',
                    'Features': 'RGB LED',
                }
            },
            {
                id: 'seagate-ssd-barracuda-pro',
                name: 'Barracuda Pro 4TB',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['1TB', '2TB', '4TB'],
                specs: {
                    'Loại': 'Internal SSD',
                    'Dung lượng': '4TB',
                    'Interface': 'SATA 6 Gb/s',
                    'Speed': 'Up to 545 MB/s',
                    'Warranty': '5 Years',
                }
            }
        ]
    },
    'WD_Storage': {
        label: 'Western Digital',
        category: 'Lưu trữ dữ liệu',
        models: [
            {
                id: 'wd-blue-ssd-1tb',
                name: 'Blue SSD 1TB',
                year: 2024,
                colors: ['Xanh dương'],
                storageOptions: ['250GB', '500GB', '1TB', '2TB'],
                specs: {
                    'Loại': 'Internal SSD SATA',
                    'Dung lượng': '1TB',
                    'Interface': 'SATA 6 Gb/s',
                    'Tốc độ': 'Up to 560 MB/s',
                    'Form Factor': '2.5 inch',
                }
            },
            {
                id: 'wd-black-ssd-nvme',
                name: 'Black SSD NVMe 1TB',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['250GB', '500GB', '1TB'],
                specs: {
                    'Loại': 'Internal SSD NVMe',
                    'Dung lượng': '1TB',
                    'Interface': 'NVMe M.2',
                    'Speed': 'Up to 7100 MB/s',
                    'Form Factor': 'M.2 2280',
                }
            },
            {
                id: 'wd-my-book-external',
                name: 'My Book External 4TB',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['2TB', '4TB', '6TB'],
                specs: {
                    'Loại': 'External HDD',
                    'Dung lượng': '4TB',
                    'Interface': 'USB 3.0',
                    'Speed': '5400 RPM',
                    'Features': 'Password Protected',
                }
            },
            {
                id: 'wd-red-pro-backup',
                name: 'Red Pro NAS 8TB',
                year: 2024,
                colors: ['Đỏ'],
                storageOptions: ['2TB', '4TB', '8TB'],
                specs: {
                    'Loại': 'Internal HDD NAS',
                    'Dung lượng': '8TB',
                    'Interface': 'SATA 6 Gb/s',
                    'RPM': '7200',
                    'Workload': '24/7 NAS',
                }
            }
        ]
    },
};
