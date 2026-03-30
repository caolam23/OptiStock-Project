/**
 * Office Devices Brand Models Data - Printers, Copiers
 */

export const officeModels = {
    'HP_Office': {
        label: 'HP',
        category: 'Thiết bị văn phòng',
        models: [
            {
                id: 'hp-laserjet-pro-m404',
                name: 'LaserJet Pro M404n',
                year: 2023,
                colors: ['Trắng', 'Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Máy in Laser',
                    'Màu sắc': 'Monochrome',
                    'Tốc độ': '40 ppm',
                    'Kết nối': 'Ethernet, USB',
                    'Khay giấy': 'Up to 350 sheets',
                }
            },
            {
                id: 'hp-laserjet-pro-m454dw',
                name: 'LaserJet Pro M454dw',
                year: 2024,
                colors: ['Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Máy in Laser',
                    'Màu sắc': 'Monochrome',
                    'Tốc độ': '38 ppm',
                    'Kết nối': 'Duplex WiFi, USB, Ethernet',
                    'Khay giấy': 'Up to 350 sheets',
                }
            },
            {
                id: 'hp-color-laserjet-pro-m455dn',
                name: 'Color LaserJet Pro M455dn',
                year: 2024,
                colors: ['Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'máy in Laser màu',
                    'Màu sắc': 'Full Color',
                    'Tốc độ': '35 ppm',
                    'Kết nối': 'Ethernet, USB',
                    'Khay giấy': 'Up to 550 sheets',
                }
            },
            {
                id: 'hp-officejet-pro-9015',
                name: 'OfficeJet Pro 9015 AIO',
                year: 2024,
                colors: ['Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Máy in/Scan/Copy Màu',
                    'Chức năng': 'Print, Copy, Scan, Fax',
                    'Tốc độ': '33 ppm',
                    'Kết nối': 'WiFi, USB, Ethernet',
                    'Auto Duplex': 'Yes',
                }
            }
        ]
    },
    'Canon_Office': {
        label: 'Canon',
        category: 'Thiết bị văn phòng',
        models: [
            {
                id: 'canon-imagerunner-2520',
                name: 'ImageRunner 2520',
                year: 2023,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Máy Photocopy',
                    'Chức năng': 'Print, Copy, Scan',
                    'Tốc độ': '25 ppm',
                    'Kích thước tối đa': 'A3',
                    'Dung lượng': 'Up to 100k pages/month',
                }
            },
            {
                id: 'canon-imagerunner-3520',
                name: 'ImageRunner 3520',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Máy Photocopy',
                    'Chức năng': 'Print, Copy, Scan, Fax',
                    'Tốc độ': '35 ppm',
                    'Kích thước tối đa': 'A3',
                    'Dung lượng': 'Up to 150k pages/month',
                }
            },
            {
                id: 'canon-lr2425',
                name: 'ImageRunner LR2425',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Máy Photocopy',
                    'Chức năng': 'B/W Copy, Print, Scan',
                    'Tốc độ': '25 ppm',
                    'Kích thước tối đa': 'A3',
                    'Entry-level': 'DADF, Network Print',
                }
            },
            {
                id: 'canon-lbp664cx',
                name: 'imageCLASS LBP664Cx',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'máy in màu Laser',
                    'Chức năng': 'Color Print, Scan',
                    'Tốc độ': '33 ppm',
                    'Kích thước tối đa': 'A4',
                    'Network': 'Ethernet, WiFi',
                }
            }
        ]
    },
};
