/**
 * Network Devices Brand Models Data - Routers, WiFi Systems
 */

export const networkModels = {
    'TP_Link_Network': {
        label: 'TP-Link',
        category: 'Thiết bị mạng',
        models: [
            {
                id: 'tp-link-wifi6-ax200',
                name: 'WiFi 6 Router AXE300',
                year: 2024,
                colors: ['Đen', 'Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Router WiFi',
                    'Chuẩn': 'WiFi 6 (802.11ax)',
                    'Tốc độ': 'AXE300',
                    'Phạm vi': 'Up to 2500 sq ft',
                    'Cổng': '4x Gigabit',
                }
            },
            {
                id: 'tp-link-wifi6-ax3000',
                name: 'WiFi 6 Router AX3000',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Router WiFi',
                    'Chuẩn': 'WiFi 6 (802.11ax)',
                    'Tốc độ': 'AX3000',
                    'Phạm vi': 'Up to 1500 sq ft',
                    'Cổng': '4x Gigabit',
                }
            },
            {
                id: 'tp-link-archer-ax90',
                name: 'Archer AX90',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Router WiFi',
                    'Chuẩn': 'WiFi 6',
                    'Tốc độ': 'AX6000',
                    'Phạm vi': 'Up to 3000 sq ft',
                    'Ăng-ten': '4 External',
                }
            },
            {
                id: 'tp-link-deco-m5',
                name: 'Deco M5 Mesh System (3-pack)',
                year: 2023,
                colors: ['Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Mesh WiFi',
                    'Chuẩn': 'WiFi 5 (802.11ac)',
                    'Tốc độ': 'AC1300',
                    'Phạm vi': 'Up to 4500 sq ft',
                    'Coverage': '3-pack',
                }
            }
        ]
    },
    'Netgear_Network': {
        label: 'Netgear',
        category: 'Thiết bị mạng',
        models: [
            {
                id: 'netgear-nighthawk-ax12',
                name: 'Nighthawk AX12',
                year: 2023,
                colors: ['Đen', 'Xám'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Router WiFi',
                    'Chuẩn': 'WiFi 6 (802.11ax)',
                    'Tốc độ': 'AX12 (1.2 Gbps)',
                    'Ăng-ten': '4 External',
                    'Cổng': '1 WAN + 4 LAN',
                }
            },
            {
                id: 'netgear-nighthawk-be20',
                name: 'Nighthawk BE20',
                year: 2024,
                colors: ['Đen'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Router WiFi',
                    'Chuẩn': 'WiFi 7 (802.11be)',
                    'Tốc độ': 'BE20000',
                    'Phạm vi': 'Up to 3000 sq ft',
                    'Cổng': '2.5G WAN + 4x 1G LAN',
                }
            },
            {
                id: 'netgear-orbi-ax6000',
                name: 'Orbi AX6000 System',
                year: 2023,
                colors: ['Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Mesh WiFi',
                    'Chuẩn': 'WiFi 6',
                    'Tốc độ': 'AX6000',
                    'Phạm vi': 'Up to 5000 sq ft',
                    'Coverage': '1 Router + 2 Satellites',
                }
            },
            {
                id: 'netgear-pb10',
                name: 'Powerline Adapter 1200',
                year: 2023,
                colors: ['Trắng'],
                storageOptions: ['N/A'],
                specs: {
                    'Loại': 'Powerline Adapter',
                    'Tốc độ': 'Up to 1200 Mbps',
                    'Chuẩn': '802.11ac',
                    'Phạm vi': 'Throughout home',
                    'Setup': 'Plug & Play',
                }
            }
        ]
    },
};
