/**
 * Computer Components Brand Models Data - CPUs, GPUs, RAM
 */

export const componentModels = {
    'Intel_Components': {
        label: 'Intel',
        category: 'Linh kiện máy tính',
        models: [
            {
                id: 'intel-core-i9-14900k',
                name: 'Intel Core i9-14900K',
                year: 2024,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '24-core / 32-thread',
                    'Clock': '3.2-6.0 GHz',
                    'TDP': '125W',
                    'Cache': '36MB',
                }
            },
            {
                id: 'intel-core-i7-14700k',
                name: 'Intel Core i7-14700K',
                year: 2024,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '20-core / 28-thread',
                    'Clock': '3.4-5.6 GHz',
                    'TDP': '125W',
                    'Cache': '33MB',
                }
            },
            {
                id: 'intel-core-i5-14600k',
                name: 'Intel Core i5-14600K',
                year: 2024,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '14-core / 20-thread',
                    'Clock': '3.5-5.5 GHz',
                    'TDP': '125W',
                    'Cache': '24MB',
                }
            },
            {
                id: 'intel-core-ultra-9-285k',
                name: 'Intel Core Ultra 9 285K',
                year: 2024,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '24-core / 24-thread',
                    'Clock': '3.7-5.7 GHz',
                    'TDP': '125W',
                    'Cache': '36MB',
                }
            }
        ]
    },
    'AMD_Components': {
        label: 'AMD',
        category: 'Linh kiện máy tính',
        models: [
            {
                id: 'ryzen-9-7950x3d',
                name: 'Ryzen 9 7950X3D',
                year: 2023,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '16-core / 32-thread',
                    'Clock': '4.2-5.7 GHz',
                    'TDP': '120W',
                    'Cache': '144MB 3D V-Cache',
                }
            },
            {
                id: 'ryzen-9-7950x',
                name: 'Ryzen 9 7950X',
                year: 2023,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '16-core / 32-thread',
                    'Clock': '4.5-5.7 GHz',
                    'TDP': '105W',
                    'Cache': '64MB L3',
                }
            },
            {
                id: 'ryzen-7-7700x',
                name: 'Ryzen 7 7700X',
                year: 2023,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '8-core / 16-thread',
                    'Clock': '4.5-5.4 GHz',
                    'TDP': '105W',
                    'Cache': '32MB L3',
                }
            },
            {
                id: 'ryzen-5-7600x',
                name: 'Ryzen 5 7600X',
                year: 2023,
                colors: ['N/A'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'CPU',
                    'Cores/Threads': '6-core / 12-thread',
                    'Clock': '4.7-5.3 GHz',
                    'TDP': '105W',
                    'Cache': '32MB L3',
                }
            }
        ]
    },
    'NVIDIA_Components': {
        label: 'NVIDIA',
        category: 'Linh kiện máy tính',
        models: [
            {
                id: 'rtx-4090',
                name: 'RTX 4090',
                year: 2022,
                colors: ['Đen'],
                storageOptions: ['24GB'],
                specs: {
                    'Loại': 'GPU',
                    'VRAM': '24GB GDDR6X',
                    'CUDA Cores': '16384',
                    'Memory Speed': '20 Gbps',
                    'TDP': '450W',
                }
            },
            {
                id: 'rtx-4080',
                name: 'RTX 4080',
                year: 2022,
                colors: ['Đen'],
                storageOptions: ['16GB'],
                specs: {
                    'Loại': 'GPU',
                    'VRAM': '16GB GDDR6X',
                    'CUDA Cores': '9728',
                    'Memory Speed': '20 Gbps',
                    'TDP': '320W',
                }
            },
            {
                id: 'rtx-4070-ti-super',
                name: 'RTX 4070 Ti Super',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['12GB'],
                specs: {
                    'Loại': 'GPU',
                    'VRAM': '12GB GDDR6X',
                    'CUDA Cores': '7680',
                    'Memory Speed': '21 Gbps',
                    'TDP': '285W',
                }
            },
            {
                id: 'rtx-4070-super',
                name: 'RTX 4070 Super',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['12GB'],
                specs: {
                    'Loại': 'GPU',
                    'VRAM': '12GB GDDR6X',
                    'CUDA Cores': '5888',
                    'Memory Speed': '21 Gbps',
                    'TDP': '220W',
                }
            }
        ]
    },
    'Kingston_RAM': {
        label: 'Kingston',
        category: 'Linh kiện máy tính',
        models: [
            {
                id: 'fury-beast-32gb-ddr5',
                name: 'Fury Beast 32GB DDR5',
                year: 2023,
                colors: ['Đen'],
                storageOptions: ['32GB'],
                specs: {
                    'Loại': 'RAM',
                    'Dung lượng': '32GB',
                    'Nhập': 'DDR5',
                    'Speed': '6000 MHz',
                    'Latency': 'CAS 30',
                }
            },
            {
                id: 'fury-beast-64gb-ddr5',
                name: 'Fury Beast 64GB DDR5',
                year: 2023,
                colors: ['Đen'],
                storageOptions: ['64GB'],
                specs: {
                    'Loại': 'RAM',
                    'Dung lượng': '64GB',
                    'Nhập': 'DDR5',
                    'Speed': '6000 MHz',
                    'Latency': 'CAS 30',
                }
            },
            {
                id: 'fury-beast-16gb-ddr4',
                name: 'Fury Beast 16GB DDR4',
                year: 2022,
                colors: ['Đen'],
                storageOptions: ['16GB'],
                specs: {
                    'Loại': 'RAM',
                    'Dung lượng': '16GB',
                    'Nhập': 'DDR4',
                    'Speed': '3600 MHz',
                    'Latency': 'CAS 18',
                }
            },
            {
                id: 'fury-renegade-32gb-ddr5',
                name: 'Fury Renegade 32GB DDR5',
                year: 2024,
                colors: ['Đen', 'Bạc'],
                storageOptions: ['32GB'],
                specs: {
                    'Loại': 'RAM',
                    'Dung lượng': '32GB',
                    'Nhập': 'DDR5',
                    'Speed': '7200 MHz',
                    'Latency': 'CAS 34',
                }
            }
        ]
    },
};
