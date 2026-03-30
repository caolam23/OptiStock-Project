/**
 * Smart Home Devices Brand Models Data - IoT, Smart Speakers, Smart Cameras
 */

export const smartHomeModels = {
    'Google_SmartHome': {
        label: 'Google',
        category: 'Smart Home',
        models: [
            {
                id: 'google-nest-hub-max',
                name: 'Nest Hub Max',
                year: 2024,
                colors: ['Trắng', 'Xám'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Display',
                    'Kích thước màn hình': '10 inch',
                    'Độ phân giải': '2560 x 1600',
                    'Kính Camera': 'HD Camera tích hợp',
                    'Kết nối': 'Wi-Fi 6E, Bluetooth 5.2',
                    'Âm thanh': 'Loa kép',
                }
            },
            {
                id: 'google-home-mini',
                name: 'Google Home Mini',
                year: 2023,
                colors: ['Trắng', 'Xám', 'Xanh', 'Cam'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Speaker',
                    'Kích thước': 'Compact',
                    'Mic': '4 microphones',
                    'Kết nối': 'Wi-Fi 5, Bluetooth 5.0',
                    'Âm thanh': 'Google Assistant',
                }
            },
            {
                id: 'google-nest-mini',
                name: 'Google Nest Mini',
                year: 2024,
                colors: ['Trắng', 'Xám', 'Xanh', 'Vàng'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Speaker',
                    'Kích thước': 'Compact',
                    'Mic': '4 microphones',
                    'Kết nối': 'Wi-Fi 5, Bluetooth 5.1',
                    'Features': 'Chế độ xem trước', 
                }
            }
        ]
    },
    'Amazon_SmartHome': {
        label: 'Amazon',
        category: 'Smart Home',
        models: [
            {
                id: 'amazon-echo-dot-5',
                name: 'Echo Dot 5th Gen',
                year: 2024,
                colors: ['Xám', 'Trắng', 'Xanh'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Speaker',
                    'Form': 'Bi tròn',
                    'Hình ảnh': 'LED smart display tích hợp',
                    'Mic': '4 microphones',
                    'Âm thanh': 'Alexa',
                }
            },
            {
                id: 'amazon-echo-show-8',
                name: 'Echo Show 8 (2024)',
                year: 2024,
                colors: ['Xám', 'Trắng'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Display',
                    'Kích thước màn hình': '8 inch',
                    'Độ phân giải': '1280 x 800',
                    'Camera': '13MP HD camera',
                    'Kết nối': 'Wi-Fi 6, Bluetooth 5.2',
                }
            },
            {
                id: 'amazon-echo-show-15',
                name: 'Echo Show 15 (2024)',
                year: 2024,
                colors: ['Đen', 'Trắng'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Display Hub',
                    'Kích thước màn hình': '15.6 inch',
                    'Độ phân giải': '1920 x 1080',
                    'Camera': '13MP HD camera',
                    'Feature': 'Điều khiển nhà thông minh',
                }
            }
        ]
    },
    'Apple_SmartHome': {
        label: 'Apple',
        category: 'Smart Home',
        models: [
            {
                id: 'apple-homepod-mini',
                name: 'HomePod mini',
                year: 2024,
                colors: 'Mix nhiều màu',
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Speaker',
                    'Đường kính': '3.3 inches',
                    'Mic': '4 microphones',
                    'Kết nối': 'Wi-Fi 6, Bluetooth 5.0',
                    'Assistant': 'Siri',
                    'Specs': 'Đồ nghe Spatial Audio',
                }
            },
            {
                id: 'apple-homepod-2gen',
                name: 'HomePod 2nd Generation',
                year: 2023,
                colors: ['Trắng', 'Trung tính'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Speaker',
                    'Chiều cao': '6.6 inches',
                    'Mic': '6 microphones',
                    'Kết nối': 'Wi-Fi 6, Bluetooth 5.3',
                    'Audio': 'High-fidelity sound',
                    'Smart Hub': 'Thread compatible',
                }
            }
        ]
    },
    'Philips_SmartHome': {
        label: 'Philips Hue',
        category: 'Smart Home',
        models: [
            {
                id: 'philips-hue-color-bulb',
                name: 'Hue Color Bulb A19',
                year: 2024,
                colors: ['Đa phong cách'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Bulb',
                    'Công suất': '16 triệu màu',
                    'Công suất điện': '8.5W (tương đương 60W)',
                    'Kết nối': 'Zigbee',
                    'Compatibility': 'Alexa,Google Home,Apple',
                }
            },
            {
                id: 'philips-hue-hub',
                name: 'Hue Bridge 2.1',
                year: 2024,
                colors: ['Trắng'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Hub',
                    'Kết nối': 'Ethernet/Wi-Fi',
                    'Phạm vi': 'Up to 50 devices',
                    'Điều khiển': 'Remote có thể yêu cầu',
                    'Standards': 'Zigbee 3.0',
                }
            }
        ]
    },
    'Wyze_SmartHome': {
        label: 'Wyze',
        category: 'Smart Home',
        models: [
            {
                id: 'wyze-cam-v3-pro',
                name: 'Wyze Cam v3 Pro',
                year: 2024,
                colors: ['Trắng'],
                storageOptions: [],
                specs: {
                    'Loại': 'Smart Camera',
                    'Độ phân giải': '1080p HD',
                    'Night Vision': 'Color Night Vision',
                    'Kết nối': 'Wi-Fi 5, Bluetooth LTE',
                    'Features': 'Person/Pet Detection, 2-way Audio',
                }
            },
            {
                id: 'wyze-outdoor-cam-pro',
                name: 'Wyze Outdoor Cam Pro',
                year: 2024,
                colors: ['Trắng', 'Đen'],
                storageOptions: [],
                specs: {
                    'Loại': 'Outdoor Smart Camera',
                    'Độ phân giải': '2K QHD',
                    'Night Vision': 'Infrared',
                    'Chống nước': 'IP64',
                    'Kết nối': 'Wi-Fi 6, 4G LTE',
                }
            }
        ]
    },
};
