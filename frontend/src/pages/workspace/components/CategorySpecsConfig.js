/**
 * CategorySpecsConfig.js - UPGRADED VERSION
 * Cấu hình Dynamic Attributes cho 14 danh mục Electronics & Gadgets (v2.0)
 * 
 * UPGRADE POINTS:
 * - Chuyển hầu hết "input" thành "select" với options phong phú
 * - Chuẩn hóa dữ liệu, giảm rác dữ liệu
 * - Thêm hỗ trợ tags mode để người dùng vẫn có thể nhập custom values
 */

export const CATEGORY_SPECS = {
  "Điện thoại": [
    { name: "model", label: "Model / Dòng máy", type: "select", options: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14", "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy A55", "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Xiaomi 14 Ultra", "Xiaomi 14", "OnePlus 12", "OnePlus Open", "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9 Pro Fold", "Pixel Fold", "realme 12 Pro+", "realme GT 6", "POCO X7 Pro", "Nothing Phone 2a Plus", "Vivo X100 Pro", "Oppo Find X6 Pro"], placeholder: "Chọn dòng máy" },
    { name: "storage", label: "Dung lượng", type: "select", options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], placeholder: "Chọn dung lượng" },
    { name: "ram", label: "RAM", type: "select", options: ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB"], placeholder: "Chọn RAM" },
    { name: "color", label: "Màu sắc", type: "select", options: ["Đen / Black", "Trắng / White", "Bạc / Silver", "Vàng / Gold", "Hồng / Pink", "Xanh biển / Teal", "Xanh dương / Blue", "Xanh lục / Green", "Tím / Purple", "Đỏ / Red", "Cam / Orange", "Nâu / Brown"], placeholder: "Chọn màu" },
    { name: "condition", label: "Tình trạng", type: "select", options: ["Pin mới 100%", "Pin 90-99%", "Pin 80-89%", "Pin 70-79%", "Pin dưới 70%"], placeholder: "Chọn tình trạng pin" },
    { name: "region", label: "Phiên bản (VN/A, Quốc tế)", type: "select", options: ["VN/A (Việt Nam)", "Quốc tế (International)", "Asia", "US", "EU", "Hong Kong", "Singapore"], placeholder: "Chọn phiên bản" },
    { name: "includedAccessories", label: "Phụ kiện đi kèm", type: "select", options: ["Chỉ máy", "Máy + Cáp", "Máy + Cáp + Micro SIM", "Máy + Cáp + Adapter", "Máy + Hộp + Tất cả phụ kiện gốc", "Máy + Một số phụ kiện"], placeholder: "Chọn phụ kiện" }
  ],

  "Laptop": [
    { name: "model", label: "Dòng máy", type: "select", options: ["MacBook Pro 16", "MacBook Pro 14", "MacBook Air 15", "MacBook Air 13", "MacBook Pro M3", "MacBook Pro M4", "MacBook Pro M4 Max", "Dell XPS 17", "Dell XPS 15", "Dell XPS 13", "ThinkPad X1 Carbon", "ThinkPad X1 Yoga", "ThinkPad T14", "ThinkPad P1", "HP EliteBook 840", "HP Pavilion 15", "Asus Vivobook 15", "Asus ROG Gaming Laptop", "Acer Swift 3", "Lenovo IdeaPad 5"], placeholder: "Chọn dòng máy" },
    { name: "cpu", label: "CPU", type: "select", options: ["Intel Core i3 Gen 13", "Intel Core i5 Gen 13", "Intel Core i7 Gen 13", "Intel Core i9 Gen 13", "Intel Core i5 Gen 14", "Intel Core i7 Gen 14", "Intel Core i9 Gen 14", "AMD Ryzen 5 7520U", "AMD Ryzen 7 7840U", "Apple M1", "Apple M2", "Apple M3", "Apple M3 Pro", "Apple M3 Max", "Apple M4", "Apple M4 Pro", "Apple M4 Max"], placeholder: "Chọn CPU" },
    { name: "ram", label: "RAM", type: "select", options: ["8GB DDR4", "16GB DDR4", "32GB DDR4", "8GB DDR5", "16GB DDR5", "32GB DDR5", "64GB DDR5", "8GB LPDDR5", "16GB LPDDR5", "32GB LPDDR5", "24GB LPDDR5"], placeholder: "Chọn RAM" },
    { name: "storage", label: "Ổ cứng (SSD/HDD + Dung lượng)", type: "select", options: ["256GB SSD NVMe", "512GB SSD NVMe", "1TB SSD NVMe", "2TB SSD NVMe", "256GB SSD SATA", "512GB SSD SATA", "1TB SSD SATA", "256GB + 1TB HDD", "512GB + 1TB HDD", "1TB + 2TB HDD"], placeholder: "Chọn ổ cứng" },
    { name: "gpu", label: "Card đồ họa (VGA)", type: "select", options: ["Intel UHD Graphics", "Intel Iris Xe Graphics", "NVIDIA GeForce GTX 1650", "NVIDIA RTX 3050", "NVIDIA RTX 4050", "NVIDIA RTX 4070", "AMD Radeon Graphics", "Apple GPU (8-core)", "Apple GPU (10-core)", "Không rời rạc (iGPU)"], placeholder: "Chọn VGA" },
    { name: "screen", label: "Màn hình (Inch, Độ phân giải)", type: "select", options: ["13 inch Full HD (1920x1200)", "14 inch Full HD (2560x1600)", "15 inch Full HD (1920x1080)", "15.6 inch Full HD (1920x1080)", "17 inch Full HD (1920x1200)", "13 inch 4K (3840x2400)", "14 inch 4K (3840x2400)", "15 inch 2.8K (2880x1800)", "17 inch 2K (2560x1600)", "16 inch 2.5K (3456x2234)"], placeholder: "Chọn màn hình" },
    { name: "refreshRate", label: "Tần số quét (Hz)", type: "select", options: ["60Hz", "90Hz", "120Hz", "144Hz", "165Hz", "240Hz"], placeholder: "Chọn tần số quét" },
    { name: "batteryCycles", label: "Pin (Số chu kỳ / %)", type: "select", options: ["Mới 100%", "95-99%", "90-94%", "85-89%", "80-84%", "75-79%", "70-74%", "Dưới 70%"], placeholder: "Chọn tình trạng pin" },
    { name: "os", label: "Hệ điều hành", type: "select", options: ["Windows 11 Home", "Windows 11 Pro", "Windows 11 Enterprise", "Windows 10 Home", "Windows 10 Pro", "macOS Ventura", "macOS Sonoma", "macOS Monterey", "Ubuntu 22.04", "Ubuntu 20.04"], placeholder: "Chọn OS" },
    { name: "color", label: "Màu sắc", type: "select", options: ["Bạc / Silver", "Space Gray", "Midnight", "Starlight", "Đen / Black", "Vàng / Gold", "Xanh biển / Teal"], placeholder: "Chọn màu" }
  ],

  "Máy tính để bàn (PC)": [
    { name: "pcType", label: "Loại", type: "select", options: ["PC Build (Custom)", "PC Đồng bộ (Prebuilt)", "Mini PC", "All-in-One PC"], placeholder: "Chọn loại" },
    { name: "cpu", label: "CPU", type: "select", options: ["Intel Core i5-13600K", "Intel Core i7-13700K", "Intel Core i7-13700KF", "Intel Core i9-13900K", "Intel Core i9-13900KS", "AMD Ryzen 5 5600X", "AMD Ryzen 7 5800X", "AMD Ryzen 9 7900X", "AMD Ryzen 9 7950X", "AMD Ryzen 9 7950X3D"], placeholder: "Chọn CPU" },
    { name: "mainboard", label: "Mainboard", type: "select", options: ["ASUS ROG Strix Z790", "ASUS ProArt Z790", "MSI MEG Z790", "MSI MPG Z790", "Gigabyte Z790 AORUS", "ASRock Z790", "ASUS ROG Strix B650", "MSI MPG B650", "Gigabyte B650 AORUS"], placeholder: "Chọn mainboard" },
    { name: "ram", label: "RAM", type: "select", options: ["16GB DDR5 6000MHz", "32GB DDR5 6000MHz", "64GB DDR5 6400MHz", "32GB DDR4 3600MHz", "64GB DDR4 3600MHz", "128GB DDR5"], placeholder: "Chọn RAM" },
    { name: "gpu", label: "Card màn hình (VGA)", type: "select", options: ["NVIDIA RTX 4090", "NVIDIA RTX 4080 Super", "NVIDIA RTX 4080", "NVIDIA RTX 4070 Ti", "NVIDIA RTX 4070", "NVIDIA RTX 4070 SUPER", "AMD Radeon RX 7900 XTX", "AMD Radeon RX 7900 XT", "AMD Radeon RX 7800 XT", "Không rời rạc"], placeholder: "Chọn VGA" },
    { name: "storage", label: "Ổ cứng", type: "select", options: ["1TB SSD NVMe", "2TB SSD NVMe", "512GB SSD NVMe + 1TB HDD", "1TB SSD NVMe + 2TB HDD", "2TB SSD NVMe + 4TB HDD", "4TB SSD NVMe", "RAID 0 (2x SSD)"], placeholder: "Chọn storage" },
    { name: "psu", label: "Nguồn (PSU)", type: "select", options: ["650W 80+ Gold", "750W 80+ Gold", "850W 80+ Gold", "1000W 80+ Platinum", "1200W 80+ Platinum", "1500W Modular"], placeholder: "Chọn PSU" },
    { name: "case", label: "Vỏ Case", type: "select", options: ["Anidees AI Crystal", "Corsair iCUE 5000T", "NZXT H7 Flow", "Lian Li Lancool 3", "Fractal Design North", "Phanteks Eclipse P400A", "Thermaltake View 91", "Be Quiet Pure Base 500DX"], placeholder: "Chọn case" },
    { name: "os", label: "Hệ điều hành", type: "select", options: ["Windows 11 Pro", "Windows 11 Home", "Windows 10 Pro", "Ubuntu 22.04", "Không kèm OS"], placeholder: "Chọn OS" }
  ],

  "Linh kiện máy tính": [
    { name: "componentType", label: "Loại linh kiện", type: "select", options: ["CPU", "RAM", "SSD/HDD", "VGA Card", "Mainboard", "Nguồn (PSU)", "Tản nhiệt CPU", "Tản nhiệt GPU", "Case", "Fan", "Cáp"], placeholder: "Chọn loại" },
    { name: "model", label: "Model linh kiện", type: "select", options: ["Intel Core i9-13900K", "Intel Core i7-13700K", "AMD Ryzen 9 7950X", "Kingston Fury Beast 32GB", "Corsair Vengeance RGB 32GB", "Samsung 990 Pro 2TB", "WD Black SN850X 1TB", "NVIDIA RTX 4090", "NVIDIA RTX 4080", "AMD RX 7900 XTX", "ASUS ROG Strix Z790", "Corsair 1000W Platinum", "Noctua NH-D15", "Lian Li Lancool 3"], placeholder: "Chọn model" },
    { name: "specs", label: "Thông số kỹ thuật chính", type: "textarea", placeholder: "VD: 14 cores, 20 threads, 3.4-5.4GHz, TDP 150W" }
  ],

  "Máy tính bảng": [
    { name: "model", label: "Model", type: "select", options: ["iPad Pro 12.9", "iPad Pro 11", "iPad Air 6", "iPad Air 5", "iPad 10", "iPad Mini 7", "Samsung Galaxy Tab S9 Ultra", "Samsung Galaxy Tab S9 Plus", "Samsung Galaxy Tab S9", "Xiaomi Pad 6 Pro", "Microsoft Surface Go 3", "Microsoft Surface Pro 9"], placeholder: "Chọn model" },
    { name: "storage", label: "Dung lượng", type: "select", options: ["64GB", "128GB", "256GB", "512GB", "1TB"], placeholder: "Chọn dung lượng" },
    { name: "ram", label: "RAM", type: "select", options: ["4GB", "6GB", "8GB", "12GB", "16GB"], placeholder: "Chọn RAM" },
    { name: "screen", label: "Kích thước màn hình", type: "select", options: ["7 inch", "8 inch", "10 inch", "10.9 inch", "11 inch", "12.9 inch"], placeholder: "Chọn kích thước" },
    { name: "resolution", label: "Độ phân giải", type: "select", options: ["1024x768", "1280x800", "2048x1536", "2360x1640", "2560x1600", "2732x2048"], placeholder: "Chọn độ phân giải" },
    { name: "color", label: "Màu sắc", type: "select", options: ["Bạc / Silver", "Space Gray", "Gold", "Rose Gold", "Đen / Black"], placeholder: "Chọn màu" },
    { name: "network", label: "Phiên bản mạng", type: "select", options: ["WiFi Only", "WiFi + LTE", "WiFi + 5G"], placeholder: "Chọn phiên bản" }
  ],

  "Thiết bị đeo": [
    { name: "model", label: "Model", type: "select", options: ["Apple Watch Ultra 2", "Apple Watch Series 9", "Apple Watch SE 2024", "Garmin Fenix 7", "Garmin Epix 2", "Samsung Galaxy Watch 6", "Samsung Galaxy Watch 6 Classic", "Fitbit Charge 6", "Fitbit Sense 2", "Xiaomi Band 8 Pro"], placeholder: "Chọn model" },
    { name: "size", label: "Kích thước mặt (mm)", type: "select", options: ["38mm", "40mm", "41mm", "42mm", "44mm", "45mm", "46mm", "49mm"], placeholder: "Chọn kích thước" },
    { name: "color", label: "Màu khung", type: "select", options: ["Bạc / Silver", "Space Gray", "Gold", "Rose Gold", "Đen / Black", "Xanh biển / Teal", "Đỏ / Red"], placeholder: "Chọn màu khung" },
    { name: "strapColor", label: "Màu dây", type: "select", options: ["Đen / Black", "Trắng / White", "Đỏ / Red", "Xanh biển / Ocean", "Cánh hoa / Flora", "Vàng / Gold", "Hồng / Pink"], placeholder: "Chọn màu dây" },
    { name: "batteryHealth", label: "Tình trạng Pin", type: "select", options: ["Mới 100%", "95-99%", "90-94%", "85-89%", "80-84%", "75-79%"], placeholder: "Chọn tình trạng pin" },
    { name: "features", label: "Tính năng nổi bật", type: "select", options: ["GPS không liên tục", "GPS + LTE", "Always-On Display", "EKG", "SPO2", "Micrô/Loa", "Thanh toán"],  placeholder: "Chọn tính năng" }
  ],

  "Phụ kiện công nghệ": [
    { name: "accType", label: "Loại phụ kiện", type: "select", options: ["Tai nghe", "Sạc, cáp", "Pin dự phòng", "Bàn phím, chuột", "Loa", "Dock/Hub", "Bảo vệ (Case, Dán màn hình)", "Đế, Stand", "Khác"], placeholder: "Chọn loại" },
    { name: "model", label: "Model", type: "select", options: ["AirPods Pro Max", "AirPods Pro 2", "AirPods 3", "Samsung Galaxy Buds3", "Sony WF-1000XM5", "Bose QuietComfort Ultra", "Sennheiser Momentum 4", "anker Soundcore Elite", "Beats Studio Pro", "Razer Hammerhead Pro HyperSpeed"], placeholder: "Chọn model" },
    { name: "specs", label: "Công suất / Thông số", type: "select", options: ["5W", "10W", "20W", "30W", "40W", "60W", "65W", "100W", "Bluetooth 5.0", "Bluetooth 5.1", "Bluetooth 5.3", "USB-C", "Lightning"], placeholder: "Chọn thông số" },
    { name: "color", label: "Màu sắc", type: "select", options: ["Trắng / White", "Đen / Black", "Bạc / Silver", "Vàng / Gold", "Rose Gold", "Xanh biển / Teal"], placeholder: "Chọn màu" }
  ],

  "Camera": [
    { name: "camType", label: "Loại Camera", type: "select", options: ["Camera an niêm (IP Cam)", "Máy ảnh mirrorless", "Máy ảnh DSLR", "Máy quay phim", "Webcam", "Action Camera", "Drone"], placeholder: "Chọn loại" },
    { name: "model", label: "Model", type: "select", options: ["Canon EOS R8", "Canon EOS R7", "Canon EOS R6 Mark II", "Nikon Z9", "Nikon Z8", "Nikon Z6 II", "Sony A7R VI", "Sony A7R V", "Sony A7C II", "Panasonic Lumix S5II", "GoPro Hero 12 Black", "DJI Osmo Action 4"], placeholder: "Chọn model" },
    { name: "resolution", label: "Độ phân giải", type: "select", options: ["12MP", "16MP", "20MP", "24MP", "32MP", "42MP", "45MP", "61MP", "4K 30fps", "4K 60fps", "8K 24fps", "8K 60fps"], placeholder: "Chọn độ phân giải" },
    { name: "sensor", label: "Kích thước cảm biến", type: "select", options: ["Full Frame", "APS-C", "1 inch", "2/3 inch", "1/1.3 inch"], placeholder: "Chọn sensor" },
    { name: "features", label: "Tính năng nổi bật", type: "select", options: ["AI Detection", "Night Vision", "Autofocus", "Image Stabilization", "4K Video", "8K Video", "WiFi", "Cloud Storage"], placeholder: "Chọn tính năng" }
  ],

  "TV / Màn hình": [
    { name: "size", label: "Kích thước (inch)", type: "select", options: ["24", "27", "31.5", "32", "40", "43", "50", "55", "65", "75", "85", "98"], placeholder: "Chọn kích thước" },
    { name: "resolution", label: "Độ phân giải", type: "select", options: ["HD (1366x768)", "Full HD (1920x1080)", "2K (2560x1440)", "4K (3840x2160)", "8K (7680x4320)"], placeholder: "Chọn độ phân giải" },
    { name: "panelType", label: "Loại tấm nền", type: "select", options: ["LCD", "LED", "QLED", "OLED", "Mini-LED", "MicroLED", "IPS", "VA"], placeholder: "Chọn loại panel" },
    { name: "refreshRate", label: "Tần số quét (Hz)", type: "select", options: ["60Hz", "75Hz", "90Hz", "120Hz", "144Hz", "165Hz"], placeholder: "Chọn tần số" },
    { name: "hdr", label: "Hỗ trợ HDR", type: "select", options: ["Không hỗ trợ", "HDR10", "HDR10+", "Dolby Vision"], placeholder: "Chọn HDR" },
    { name: "ports", label: "Cổng kết nối", type: "select", options: ["2x HDMI + USB", "3x HDMI + 2x USB", "3x HDMI + 2x USB + Optical", "Thunderbolt 4"], placeholder: "Chọn cổng" }
  ],

  "Thiết bị gaming": [
    { name: "gamingType", label: "Loại thiết bị", type: "select", options: ["Console (PlayStation)", "Console (Xbox)", "Console (Nintendo)", "Tay cầm (Controller)", "Tai nghe gaming", "Bàn phím gaming", "Chuột gaming", "Bàn gaming", "Ghế gaming"], placeholder: "Chọn loại" },
    { name: "model", label: "Model", type: "select", options: ["PlayStation 5", "PlayStation 4 Pro", "Xbox Series X", "Xbox Series S", "Nintendo Switch Pro", "Nintendo Switch OLED", "Nintendo Switch Lite"], placeholder: "Chọn model" },
    { name: "version", label: "Phiên bản", type: "select", options: ["Standard Edition", "Pro Edition", "Disc Edition", "Digital Edition", "Bundle with Game"], placeholder: "Chọn phiên bản" },
    { name: "storage", label: "Dung lượng lưu trữ", type: "select", options: ["512GB", "1TB", "2TB", "Expandable via MicroSD"], placeholder: "Chọn dung lượng" },
    { name: "accessories", label: "Phụ kiện đi kèm", type: "select", options: ["Chỉ máy", "Máy + 1 Tay cầm", "Máy + 2 Tay cầm", "Máy + Tay cầm + Cáp HDMI", "Bundle Game"], placeholder: "Chọn phụ kiện" }
  ],

  "Thiết bị mạng": [
    { name: "netType", label: "Loại thiết bị", type: "select", options: ["Router WiFi", "Modem", "Switch Mạng", "Access Point", "WiFi Mesh", "Repeater"], placeholder: "Chọn loại" },
    { name: "model", label: "Model", type: "select", options: ["TP-Link Archer AX12", "TP-Link Archer AX6000", "ASUS RT-AX88U", "Netgear Nighthawk AX12", "D-Link DIR-X5060", "Eero Pro 6", "Ubiquiti UniFi 6", "Linksys Velop MX5"], placeholder: "Chọn model" },
    { name: "wifiStandard", label: "Chuẩn WiFi", type: "select", options: ["WiFi 4 (802.11n)", "WiFi 5 (802.11ac)", "WiFi 6 (802.11ax)", "WiFi 6E (802.11ax)", "WiFi 7 (802.11be)"], placeholder: "Chọn chuẩn WiFi" },
    { name: "speed", label: "Tốc độ tối đa", type: "select", options: ["300 Mbps", "600 Mbps", "1.2 Gbps", "2.4 Gbps", "4.8 Gbps", "10 Gbps"], placeholder: "Chọn tốc độ" },
    { name: "ports", label: "Số cổng Gigabit", type: "select", options: ["2 cổng", "4 cổng", "5 cổng", "8 cổng", "16 cổng"], placeholder: "Chọn số cổng" }
  ],

  "Thiết bị văn phòng": [
    { name: "officeType", label: "Loại thiết bị", type: "select", options: ["Máy in Laser", "Máy in Phun", "Máy scan", "Máy photocopy", "Máy fax", "Máy in All-in-One"], placeholder: "Chọn loại" },
    { name: "model", label: "Model", type: "select", options: ["HP LaserJet Pro M404n", "HP LaserJet Pro M428fdw", "Canon imageCLASS MF445dw", "Brother HL-L8360CDW", "Xerox VersaLink C405", "Ricoh MP C3005"], placeholder: "Chọn model" },
    { name: "printType", label: "Loại in", type: "select", options: ["In Laser Đen trắng", "In Laser Color", "In Phun (Mực nước)", "In Nhiệt"], placeholder: "Chọn loại in" },
    { name: "printSpeed", label: "Tốc độ in", type: "select", options: ["15 trang/phút", "20 trang/phút", "30 trang/phút", "40 trang/phút", "50 trang/phút", "60 trang/phút"], placeholder: "Chọn tốc độ" },
    { name: "networkFeatures", label: "Tính năng kết nối", type: "select", options: ["USB chỉ", "USB + Ethernet", "USB + WiFi", "USB + Ethernet + WiFi", "Cloud Print"], placeholder: "Chọn tính năng" },
    { name: "inkStatus", label: "Tình trạng mực/toner", type: "select", options: ["Mới 100%", "90-99%", "80-89%", "70-79%", "Dưới 70%"], placeholder: "Chọn tình trạng" }
  ],

  "Lưu trữ dữ liệu": [
    { name: "storageType", label: "Loại lưu trữ", type: "select", options: ["USB Flash Drive", "Ổ cứng ngoài", "SSD Ngoài", "NAS (Network Storage)", "SD Card", "MicroSD Card", "Memory Card (CompactFlash)"], placeholder: "Chọn loại" },
    { name: "capacity", label: "Dung lượng", type: "select", options: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "4TB", "8TB", "12TB", "16TB"], placeholder: "Chọn dung lượng" },
    { name: "connectionType", label: "Chuẩn kết nối", type: "select", options: ["USB 2.0", "USB 3.0", "USB 3.1", "USB 3.2 Gen2", "USB-C", "Thunderbolt 3", "Thunderbolt 4", "Gigabit Ethernet"], placeholder: "Chọn kết nối" },
    { name: "speed", label: "Tốc độ đọc/ghi", type: "select", options: ["Đọc: 100MB/s", "Đọc: 400MB/s, Ghi: 300MB/s", "Đọc: 550MB/s, Ghi: 450MB/s", "Đọc: 1050MB/s, Ghi: 1000MB/s", "Đọc: 2000MB/s, Ghi: 1400MB/s"], placeholder: "Chọn tốc độ" },
    { name: "features", label: "Tính năng", type: "select", options: ["Chỉ lưu trữ", "Mã hóa dữ liệu", "Bảo vệ chống sốc", "Waterproof", "Backup tự động"], placeholder: "Chọn tính năng" }
  ],

  "Thiết bị điện thông minh": [
    { name: "smartType", label: "Loại thiết bị", type: "select", options: ["Đèn thông minh", "Ổ cắm thông minh", "Robot hút bụi", "Khóa cửa thông minh", "Cảm biến chuyển động", "Cảm biến nhiệt độ", "Bóng đèn LED", "Loa thông minh", "Màn hình thông minh"], placeholder: "Chọn loại" },
    { name: "model", label: "Model", type: "select", options: ["Philips Hue Bridge", "Philips Hue Color Bulb", "LIFX Color A19", "Wyze Cam v3", "TP-Link Smart Plug", "Meross Smart Plug", "Nuki Smart Lock", "August Smart Lock", "Ecobee SmartThermostat", "Google Home Mini"], placeholder: "Chọn model" },
    { name: "connectionStandard", label: "Chuẩn kết nối", type: "select", options: ["WiFi", "Zigbee", "Bluetooth", "Z-Wave", "Matter", "Thread"], placeholder: "Chọn chuẩn kết nối" },
    { name: "voiceAssistant", label: "Trợ lý giọng nói", type: "select", options: ["Google Assistant", "Amazon Alexa", "Apple Siri", "Không hỗ trợ", "Tương thích đa nền tảng"], placeholder: "Chọn trợ lý" },
    { name: "timeOnMarket", label: "Tình trạng sản phẩm", type: "select", options: ["Mới 100% (Nguyên seal)", "Chưa qua sử dụng (opened)", "Like New 99%", "Sử dụng nhẹ 95%"], placeholder: "Chọn tình trạng" },
    { name: "features", label: "Tính năng nổi bật", type: "textarea", placeholder: "VD: Điều khiển giọng nói, Lập kế hoạch tự động, Tiết kiệm năng lượng, Thống kê dữ liệu" }
  ]
};

/**
 * Danh sách các brand phổ biến
 */
export const POPULAR_BRANDS = [
  "Apple", "Samsung", "LG", "Sony", "Dell", "HP", "Lenovo", "Asus", "Acer",
  "MSI", "NZXT", "Corsair", "Razer", "GoPro", "Canon", "Nikon", "JBL",
  "Sennheiser", "Bose", "Anker", "TP-Link", "Xiaomi", "DJI", "Google",
  "Microsoft", "Intel", "NVIDIA", "AMD", "Kingston", "Seagate", "WD",
  "Philips", "Osram", "Lutron", "Eero", "Netgear", "Ubiquiti", "Realme", "OnePlus",
  "Xiaomi", "POCO", "Vivo", "Oppo", "Nokia", "HTC", "Garmin", "Fitbit"
];

/**
 * Danh sách các điều kiện máy (condition)
 */
export const PRODUCT_CONDITIONS = [
  { value: "New", label: "Mới 100% (Nguyên seal)" },
  { value: "LikeNew", label: "Like New 99%" },
  { value: "Good", label: "Cũ 95%" },
  { value: "Refurbished", label: "Refurbished (CPO)" },
  { value: "Display", label: "Hàng trưng bày" }
];

/**
 * Lấy cấu hình specs theo danh mục
 */
export const getSpecsForCategory = (category) => {
  return CATEGORY_SPECS[category] || [];
};

/**
 * Lấy danh sách tất cả danh mục
 */
export const getAllCategories = () => {
  return Object.keys(CATEGORY_SPECS);
};
