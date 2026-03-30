/**
 * Audio Brand Models Data - Headphones, Speakers, and Audio Devices
 */

export const audioModels = {
    'Sony_Audio': {
        label: 'Sony',
        category: 'Tai nghe & Âm thanh',
        models: [
            {
                id: 'sony-wh1000xm5',
                name: 'WH-1000XM5 Headphones',
                year: 2023,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Tai nghe Over-ear',
                    'Tính năng': 'Noise Cancelling',
                    'Thời lượng pin': '40 hours',
                    'Connectivity': 'Bluetooth 5.3',
                    'Codec': 'LDAC',
                }
            },
            {
                id: 'sony-wf-c700n',
                name: 'WF-C700N True Wireless',
                year: 2024,
                colors: ['Đen', 'Trắng', 'Bạc'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Earbuds',
                    'Tính năng': 'ANC, Ambient Mode',
                    'Thời lượng pin': '8 + 16 hours',
                    'Connectivity': 'Bluetooth 5.3',
                    'Form Factor': 'In-ear',
                }
            },
            {
                id: 'sony-srs-xb13',
                name: 'SRS-XB13 Portable Speaker',
                year: 2024,
                colors: ['Đen', 'Xanh', 'Đỏ'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Portable Speaker',
                    'Tính năng': 'Extra Bass',
                    'Thời lượng pin': '16 hours',
                    'Waterproof': 'IP67',
                    'Design': 'Compact',
                }
            },
            {
                id: 'sony-srs-xb33',
                name: 'SRS-XB33 Wireless Speaker',
                year: 2024,
                colors: ['Đen', 'Xanh', 'Cam'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Portable Speaker',
                    'Tính năng': 'Extra Bass, Live Sound',
                    'Thời lượng pin': '24 hours',
                    'Waterproof': 'IP67',
                    'Drivers': 'Dual Passive Radiators',
                }
            }
        ]
    },
    'Bose_Audio': {
        label: 'Bose',
        category: 'Tai nghe & Âm thanh',
        models: [
            {
                id: 'bose-quietcomfort-ultra',
                name: 'QuietComfort Ultra Headphones',
                year: 2024,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Tai nghe Over-ear',
                    'Tính năng': 'Noise Cancelling',
                    'Thời lượng pin': '24 hours',
                    'Connectivity': 'Bluetooth',
                    'Comfort': 'Premium Padding',
                }
            },
            {
                id: 'bose-quietcomfort-earbuds-ii',
                name: 'QuietComfort Earbuds II',
                year: 2024,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Earbuds',
                    'Tính năng': 'ANC, Spatial Audio',
                    'Thời lượng pin': '6 + 24 hours',
                    'Connectivity': 'Bluetooth 5.3',
                    'Controls': 'Touch + Voice',
                }
            },
            {
                id: 'bose-home-speaker-300',
                name: 'Home Speaker 300',
                year: 2024,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Smart Speaker',
                    'Connectivity': 'WiFi, Bluetooth, AirPlay',
                    'Voice': 'Alexa built-in',
                    'Audio': 'High-quality stereo',
                    'Setup': 'Easy WiFi Setup',
                }
            },
            {
                id: 'bose-soundlink-revolve-plus',
                name: 'SoundLink Revolve+ II',
                year: 2024,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Portable Speaker',
                    'Tính năng': '360-degree Sound',
                    'Thời lượng pin': '17 hours',
                    'Waterproof': 'IPX4',
                    'Design': 'Cylindrical',
                }
            }
        ]
    },
    'Sennheiser_Audio': {
        label: 'Sennheiser',
        category: 'Tai nghe & Âm thanh',
        models: [
            {
                id: 'sennheiser-momentum-4',
                name: 'Momentum 4 Wireless',
                year: 2024,
                colors: ['Đen', 'Xám'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Tai nghe Over-ear',
                    'Tính năng': 'ANC',
                    'Thời lượng pin': '60 hours',
                    'Connectivity': 'Bluetooth 5.3',
                    'Sound': 'Studio-quality',
                }
            },
            {
                id: 'sennheiser-momentum-sport',
                name: 'Momentum Sport True Wireless',
                year: 2024,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Earbuds',
                    'Tính năng': 'ANC, Sport-focused',
                    'Thời lượng pin': '8 + 28 hours',
                    'Connectivity': 'Bluetooth 5.3',
                    'Water Resistance': 'IPX4',
                }
            },
            {
                id: 'sennheiser-hd-660s2',
                name: 'HD 660S2 Open-Back',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Tai nghe Over-ear',
                    'Loại': 'Wired',
                    'Kết nối': '3.5mm Jack',
                    'Sound': 'Open-back Design',
                    'Impedance': '300 ohm',
                }
            },
            {
                id: 'sennheiser-cx-plus-true-wireless',
                name: 'CX Plus True Wireless',
                year: 2023,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Earbuds',
                    'Tính năng': 'Active Noise Cancelling',
                    'Thời lượng pin': '8 + 24 hours',
                    'Connectivity': 'Bluetooth 5.3',
                    'Controls': 'Touch Control',
                }
            }
        ]
    }
};
