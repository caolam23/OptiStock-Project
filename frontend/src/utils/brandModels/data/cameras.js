/**
 * Camera Brand Models Data
 */

export const cameraModels = {
    'Canon_Camera': {
        label: 'Canon',
        category: 'Camera',
        models: [
            {
                id: 'canon-eos-r3',
                name: 'EOS R3',
                year: 2022,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '24.1MP Full Frame',
                    'Processor': 'DIGIC X',
                    'Autofocus': '1053 AF Points',
                    'Video': '4K 120fps',
                }
            },
            {
                id: 'canon-eos-r8',
                name: 'EOS R8',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '24.2MP Full Frame',
                    'Processor': 'DIGIC X',
                    'Autofocus': '1053 Dual Pixel AF',
                    'Video': '6K 60fps',
                }
            },
            {
                id: 'canon-eos-5d-mark-iv',
                name: 'EOS 5D Mark IV',
                year: 2016,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'DSLR',
                    'Sensor': '30.4MP Full Frame',
                    'Processor': 'DIGIC 6',
                    'Autofocus': '61 AF Points',
                    'Video': '4K 30fps',
                }
            },
            {
                id: 'canon-eos-m6-mk2',
                name: 'EOS M6 Mark II',
                year: 2019,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless APS-C',
                    'Sensor': '32.5MP APS-C',
                    'Processor': 'DIGIC 8',
                    'Autofocus': 'Dual Pixel AF',
                    'Video': '4K 24fps',
                }
            }
        ]
    },
    'Sony_Camera': {
        label: 'Sony',
        category: 'Camera',
        models: [
            {
                id: 'sony-a7r-v',
                name: 'a7R V',
                year: 2022,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '61MP Full Frame',
                    'Processor': 'Bionz XR',
                    'Video': '8K 24fps',
                    'Autofocus': 'AI-based Eye AF',
                }
            },
            {
                id: 'sony-a7iv',
                name: 'a7 IV',
                year: 2021,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '61MP Full Frame',
                    'Processor': 'Bionz X',
                    'Video': '4K 60fps',
                    'Autofocus': '567 Points',
                }
            },
            {
                id: 'sony-a6700',
                name: 'a6700',
                year: 2023,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless APS-C',
                    'Sensor': '26.1MP APS-C',
                    'Processor': 'Bionz XR',
                    'Video': '4K 60fps',
                    'Autofocus': 'Real-time Eye AF',
                }
            }
        ]
    },
    'Nikon_Camera': {
        label: 'Nikon',
        category: 'Camera',
        models: [
            {
                id: 'nikon-z9',
                name: 'Z9',
                year: 2021,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '45.7MP Full Frame',
                    'Video': '8K 60fps',
                    'ISO': '100-32000',
                    'Autofocus': '493 Points',
                }
            },
            {
                id: 'nikon-z8',
                name: 'Z8',
                year: 2023,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '45.7MP Full Frame',
                    'Video': '8K 60fps',
                    'ISO': '100-32000',
                    'Autofocus': '493 Points',
                }
            },
            {
                id: 'nikon-z6iii',
                name: 'Z6 III',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless',
                    'Sensor': '24.2MP Full Frame',
                    'Video': '8K 30fps',
                    'ISO': '100-102400',
                    'Autofocus': '287 Points',
                }
            },
            {
                id: 'nikon-z30',
                name: 'Z30',
                year: 2023,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['Body Only'],
                specs: {
                    'Loại': 'Mirrorless APS-C',
                    'Sensor': '20.9MP APS-C',
                    'Video': '4K 60fps',
                    'ISO': '100-25600',
                    'Autofocus': '209 Points',
                }
            }
        ]
    },
};
