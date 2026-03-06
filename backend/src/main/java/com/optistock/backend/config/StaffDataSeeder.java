package com.optistock.backend.config;

import com.optistock.backend.model.*;
import com.optistock.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * StaffDataSeeder: Tạo dữ liệu test cho role Staff.
 *
 * CHỈ CHẠY KHI PROFILE = "dev" (production tự bỏ qua).
 * Hoạt động hoàn toàn độc lập — xóa file này không ảnh hưởng code.
 *
 * Tạo:
 * - 10 Products test (có barcode)
 * - 5 Locations test
 * - 3 phiếu Nhập kho (PENDING)
 * - 3 phiếu Xuất kho (PENDING)
 * - 2 phiếu Kiểm kê (PENDING)
 *
 * Data sẽ link vào Tenant đầu tiên tìm được trong DB.
 * Nếu chưa có Tenant → skip (cần tạo workspace trước).
 */
@Component
@Profile("dev")
@Order(2) // Chạy sau AdminDataInitializer
public class StaffDataSeeder implements CommandLineRunner {

        @Autowired
        private TenantRepository tenantRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private LocationRepository locationRepository;

        @Autowired
        private StockVoucherRepository stockVoucherRepository;

        @Autowired
        private StocktakeTicketRepository stocktakeTicketRepository;

        @Override
        public void run(String... args) {
                // Tìm tenant đầu tiên trong DB
                List<Tenant> tenants = tenantRepository.findAll();
                if (tenants.isEmpty()) {
                        System.out.println("⏭️ StaffDataSeeder: Chưa có Tenant — bỏ qua. Hãy tạo workspace trước.");
                        return;
                }

                Tenant tenant = tenants.get(tenants.size() - 1); // Lấy tenant mới nhất
                String tenantId = tenant.getId();

                System.out.println(
                                "🌱 StaffDataSeeder: Đang seed data cho tenant '" + tenant.getName() + "' (ID: "
                                                + tenantId + ")");

                seedProducts(tenantId);
                seedLocations(tenantId);
                seedStockVouchers(tenantId);
                seedStocktakeTickets(tenantId);

                System.out.println("✅ StaffDataSeeder: Hoàn tất seed data test cho Staff!");
        }

        // ============================================================
        // PRODUCTS — 10 sản phẩm test
        // ============================================================
        private void seedProducts(String tenantId) {
                if (productRepository.findByTenantId(tenantId).size() >= 10) {
                        System.out.println("   📦 Products: Đã có đủ data — bỏ qua.");
                        return;
                }

                List<Product> products = Arrays.asList(
                                createProduct(tenantId, "SP-001", "89300012", "iPhone 13 Pro Max", "Điện thoại", "Chai",
                                                50, 10, 100),
                                createProduct(tenantId, "SP-002", "89300099", "Mac Mini M2", "Máy tính", "Cái", 15, 5,
                                                30),
                                createProduct(tenantId, "SP-003", "89300155", "Sony WH-1000XM5", "Tai nghe", "Cái", 30,
                                                10, 50),
                                createProduct(tenantId, "SP-004", "89300045", "Samsung Galaxy S22", "Điện thoại", "Cái",
                                                40, 15, 80),
                                createProduct(tenantId, "SP-005", "89300221", "Logitech MX Master 3", "Phụ kiện", "Cái",
                                                60, 20, 100),
                                createProduct(tenantId, "SP-006", "MBP-14-M3-BLK", "MacBook Pro 14\"", "Máy tính",
                                                "Cái", 8, 3, 20),
                                createProduct(tenantId, "SP-007", "IPA-AIR5-BLU", "iPad Air 5", "Máy tính bảng", "Cái",
                                                25, 10, 40),
                                createProduct(tenantId, "SP-008", "APP2-USBC", "AirPods Pro (2nd Gen)", "Tai nghe",
                                                "Cái", 45, 20, 80),
                                createProduct(tenantId, "SP-009", "AW-ULT2-OCN", "Apple Watch Ultra 2", "Đồng hồ",
                                                "Cái", 12, 5, 25),
                                createProduct(tenantId, "SP-010", "MK-TOUCH-NUM", "Magic Keyboard", "Phụ kiện", "Cái",
                                                35, 15, 60));

                productRepository.saveAll(products);
                System.out.println("   📦 Products: Đã tạo " + products.size() + " sản phẩm test.");
        }

        private Product createProduct(String tenantId, String code, String barcode, String name,
                        String category, String unit, int stock, int min, int max) {
                Product p = new Product(tenantId, code, name, unit);
                p.setProductCode(barcode); // Dùng barcode làm productCode cho quét mã
                p.setCategory(category);
                p.setCurrentStock(stock);
                p.setMinStock(min);
                p.setMaxStock(max);
                p.setActive(true);
                return p;
        }

        // ============================================================
        // LOCATIONS — 5 vị trí kho
        // ============================================================
        private void seedLocations(String tenantId) {
                long existingCount = locationRepository.findByTenantId(tenantId).size();
                if (existingCount >= 5) {
                        System.out.println("   📍 Locations: Đã có đủ data — bỏ qua.");
                        return;
                }

                List<Location> locations = Arrays.asList(
                                Location.builder().tenantId(tenantId).code("Shelf A-01").name("Kệ A - Tầng 1")
                                                .type("STORAGE")
                                                .capacity(200).build(),
                                Location.builder().tenantId(tenantId).code("Shelf B-04").name("Kệ B - Tầng 4")
                                                .type("STORAGE")
                                                .capacity(150).build(),
                                Location.builder().tenantId(tenantId).code("Shelf C-05").name("Kệ C - Tầng 5")
                                                .type("STORAGE")
                                                .capacity(100).build(),
                                Location.builder().tenantId(tenantId).code("Zone A-12").name("Khu A - Vị trí 12")
                                                .type("DISPLAY")
                                                .capacity(50).build(),
                                Location.builder().tenantId(tenantId).code("Shelf E-08").name("Kệ E - Tầng 8")
                                                .type("STORAGE")
                                                .capacity(180).build());

                locationRepository.saveAll(locations);
                System.out.println("   📍 Locations: Đã tạo " + locations.size() + " vị trí kho test.");
        }

        // ============================================================
        // STOCK VOUCHERS — 3 Nhập + 3 Xuất
        // ============================================================
        private void seedStockVouchers(String tenantId) {
                // Luôn xóa phiếu test cũ và tạo mới — tránh stale PROCESSING/COMPLETED data
                List<String> testCodes = Arrays.asList("PN-001", "PN-002", "PN-003", "PX-055", "PX-056", "PX-057");
                List<StockVoucher> old = new java.util.ArrayList<>(
                                stockVoucherRepository.findByTenantIdAndStatus(tenantId, "PENDING"));
                old.addAll(stockVoucherRepository.findByTenantIdAndStatus(tenantId, "PROCESSING"));
                old.addAll(stockVoucherRepository.findByTenantIdAndStatus(tenantId, "COMPLETED"));
                old.stream()
                                .filter(v -> testCodes.contains(v.getVoucherCode()))
                                .forEach(v -> stockVoucherRepository.deleteById(v.getId()));

                System.out.println("   📋 StockVouchers: Xóa phiếu test cũ, tạo lại fresh data...");

                LocalDateTime now = LocalDateTime.now();

                // ── 3 PHIẾU NHẬP ──────────────────────────────
                StockVoucher pn001 = StockVoucher.builder()
                                .tenantId(tenantId).voucherCode("PN-001").type("INBOUND")
                                .title("Nhập hàng từ NCC").priority("HIGH")
                                .items(Arrays.asList(
                                                VoucherItem.builder().productCode("89300012")
                                                                .productName("iPhone 13 Pro Max")
                                                                .productVariant("Color: Sierra Blue • 256GB")
                                                                .locationCode("Shelf A-01")
                                                                .quantityRequired(10).build(),
                                                VoucherItem.builder().productCode("89300099").productName("Mac Mini M2")
                                                                .productVariant("Chip: M2 • 8GB • 256GB")
                                                                .locationCode("Shelf C-05").quantityRequired(5)
                                                                .build(),
                                                VoucherItem.builder().productCode("89300155")
                                                                .productName("Sony WH-1000XM5")
                                                                .productVariant("Color: Black")
                                                                .locationCode("Shelf E-08").quantityRequired(8).build(),
                                                VoucherItem.builder().productCode("89300045")
                                                                .productName("Samsung Galaxy S22")
                                                                .productVariant("Color: Phantom Black")
                                                                .locationCode("Shelf B-04").quantityRequired(10)
                                                                .build(),
                                                VoucherItem.builder().productCode("89300221")
                                                                .productName("Logitech MX Master 3")
                                                                .productVariant("Wireless Mouse")
                                                                .locationCode("Shelf C-05").quantityRequired(20)
                                                                .build()))
                                .createdAt(now.minusHours(2)).build();

                StockVoucher pn002 = StockVoucher.builder()
                                .tenantId(tenantId).voucherCode("PN-002").type("INBOUND")
                                .title("Trả hàng từ CH").priority("NORMAL")
                                .items(Arrays.asList(
                                                VoucherItem.builder().productCode("89300012")
                                                                .productName("iPhone 13 Pro Max")
                                                                .productVariant("Color: Gold • 128GB")
                                                                .locationCode("Shelf A-01").quantityRequired(3)
                                                                .build(),
                                                VoucherItem.builder().productCode("APP2-USBC")
                                                                .productName("AirPods Pro (2nd Gen)")
                                                                .productVariant("USB-C MagSafe Case")
                                                                .locationCode("Shelf B-04").quantityRequired(5)
                                                                .build(),
                                                VoucherItem.builder().productCode("AW-ULT2-OCN")
                                                                .productName("Apple Watch Ultra 2")
                                                                .productVariant("Titanium • Ocean Band")
                                                                .locationCode("Zone A-12").quantityRequired(4)
                                                                .build()))
                                .createdAt(now.minusHours(1).minusMinutes(15)).build();

                StockVoucher pn003 = StockVoucher.builder()
                                .tenantId(tenantId).voucherCode("PN-003").type("INBOUND")
                                .title("Nhập nội bộ").priority("LOW")
                                .items(Arrays.asList(
                                                VoucherItem.builder().productCode("MBP-14-M3-BLK")
                                                                .productName("MacBook Pro 14\"")
                                                                .productVariant("M3 Pro • Space Black • 1TB")
                                                                .locationCode("Zone A-12")
                                                                .quantityRequired(5).build(),
                                                VoucherItem.builder().productCode("MK-TOUCH-NUM")
                                                                .productName("Magic Keyboard")
                                                                .productVariant("Touch ID • Numeric Keypad")
                                                                .locationCode("Shelf C-05")
                                                                .quantityRequired(15).build(),
                                                VoucherItem.builder().productCode("89300045")
                                                                .productName("Samsung Galaxy S22")
                                                                .productVariant("Color: Green • 256GB")
                                                                .locationCode("Shelf A-01").quantityRequired(10)
                                                                .build()))
                                .createdAt(now.minusMinutes(30)).build();

                // ── 3 PHIẾU XUẤT ──────────────────────────────
                StockVoucher px055 = StockVoucher.builder()
                                .tenantId(tenantId).voucherCode("PX-055").type("OUTBOUND")
                                .title("Xuất Cửa hàng A").priority("HIGH").destination("Cửa hàng Quận 1")
                                .items(Arrays.asList(
                                                VoucherItem.builder().productCode("89300012")
                                                                .productName("iPhone 13 Pro Max")
                                                                .productVariant("Color: Sierra Blue • 256GB")
                                                                .locationCode("Shelf A-01")
                                                                .quantityRequired(4).build(),
                                                VoucherItem.builder().productCode("89300045")
                                                                .productName("Samsung Galaxy S22")
                                                                .productVariant("Color: Phantom Black")
                                                                .locationCode("Shelf B-04").quantityRequired(6)
                                                                .build()))
                                .createdAt(now.minusHours(1).minusMinutes(45)).build();

                StockVoucher px056 = StockVoucher.builder()
                                .tenantId(tenantId).voucherCode("PX-056").type("OUTBOUND")
                                .title("Xuất NCC B").priority("NORMAL").destination("NCC B - Kho trung chuyển")
                                .items(Arrays.asList(
                                                VoucherItem.builder().productCode("89300155")
                                                                .productName("Sony WH-1000XM5")
                                                                .productVariant("Color: Black")
                                                                .locationCode("Shelf E-08").quantityRequired(10)
                                                                .build(),
                                                VoucherItem.builder().productCode("89300221")
                                                                .productName("Logitech MX Master 3")
                                                                .productVariant("Wireless Mouse")
                                                                .locationCode("Shelf C-05").quantityRequired(25)
                                                                .build(),
                                                VoucherItem.builder().productCode("APP2-USBC")
                                                                .productName("AirPods Pro (2nd Gen)")
                                                                .productVariant("USB-C MagSafe Case")
                                                                .locationCode("Shelf B-04").quantityRequired(15)
                                                                .build()))
                                .createdAt(now.minusHours(1)).build();

                StockVoucher px057 = StockVoucher.builder()
                                .tenantId(tenantId).voucherCode("PX-057").type("OUTBOUND")
                                .title("Chuyển kho").priority("LOW").destination("Kho chi nhánh 2")
                                .items(Arrays.asList(
                                                VoucherItem.builder().productCode("MBP-14-M3-BLK")
                                                                .productName("MacBook Pro 14\"")
                                                                .productVariant("M3 Pro • Space Black • 1TB")
                                                                .locationCode("Zone A-12")
                                                                .quantityRequired(3).build(),
                                                VoucherItem.builder().productCode("MK-TOUCH-NUM")
                                                                .productName("Magic Keyboard")
                                                                .productVariant("Touch ID • Numeric Keypad")
                                                                .locationCode("Shelf C-05")
                                                                .quantityRequired(10).build()))
                                .createdAt(now.minusMinutes(45)).build();

                stockVoucherRepository.saveAll(Arrays.asList(pn001, pn002, pn003, px055, px056, px057));
                System.out.println("   📋 StockVouchers: Đã tạo 6 phiếu test (3 Nhập + 3 Xuất).");
        }

        // ============================================================
        // STOCKTAKE TICKETS — 2 phiếu kiểm kê
        // ============================================================
        private void seedStocktakeTickets(String tenantId) {
                // Luôn xóa phiếu kiểm kê test cũ và tạo mới
                List<String> testCodes = Arrays.asList("KK-003", "KK-004");
                List<StocktakeTicket> allTickets = stocktakeTicketRepository.findByTenantId(tenantId);
                allTickets.stream()
                                .filter(t -> testCodes.contains(t.getTicketCode()))
                                .forEach(t -> stocktakeTicketRepository.deleteById(t.getId()));

                System.out.println("   📝 StocktakeTickets: Xóa phiếu kiểm kê test cũ, tạo lại fresh data...");

                StocktakeTicket kk003 = StocktakeTicket.builder()
                                .tenantId(tenantId).ticketCode("KK-003")
                                .title("Kiểm kê khu A").locationCode("Kệ A - Tầng 1")
                                .items(Arrays.asList(
                                                StocktakeItem.builder().productCode("SP-001")
                                                                .productName("Áo Thun Cotton Basic - Trắng / L")
                                                                .locationCode("A-01-01").systemQuantity(20).build(),
                                                StocktakeItem.builder().productCode("SP-002")
                                                                .productName("Quần Jeans Nam Slim Fit - Xanh / 32")
                                                                .locationCode("A-01-02").systemQuantity(18).build(),
                                                StocktakeItem.builder().productCode("SP-003")
                                                                .productName("Giày Sneaker Sport - Đen / 42")
                                                                .locationCode("A-01-03").systemQuantity(12).build(),
                                                StocktakeItem.builder().productCode("SP-004")
                                                                .productName("Balo Laptop Chống Nước 15.6 inch")
                                                                .locationCode("A-01-04").systemQuantity(8).build(),
                                                StocktakeItem.builder().productCode("SP-005")
                                                                .productName("Mũ Lưỡi Trai Unisex - Be")
                                                                .locationCode("A-01-05").systemQuantity(45).build(),
                                                StocktakeItem.builder().productCode("SP-006")
                                                                .productName("Tất Cổ Ngắn Cotton (Combo 5 đôi)")
                                                                .locationCode("A-01-06").systemQuantity(60).build(),
                                                StocktakeItem.builder().productCode("SP-007")
                                                                .productName("Áo Khoác Gió 2 Lớp - Đen / XL")
                                                                .locationCode("A-01-07").systemQuantity(10).build(),
                                                StocktakeItem.builder().productCode("SP-008")
                                                                .productName("Găng Tay Len Mùa Đông")
                                                                .locationCode("A-01-08").systemQuantity(25).build()))
                                .createdAt(LocalDateTime.now().minusDays(1)).build();

                StocktakeTicket kk004 = StocktakeTicket.builder()
                                .tenantId(tenantId).ticketCode("KK-004")
                                .title("Kiểm kê khu B").locationCode("Kệ B - Tầng 1")
                                .items(Arrays.asList(
                                                StocktakeItem.builder().productCode("89300012")
                                                                .productName("iPhone 13 Pro Max")
                                                                .locationCode("B-01-01").systemQuantity(50).build(),
                                                StocktakeItem.builder().productCode("89300099")
                                                                .productName("Mac Mini M2")
                                                                .locationCode("B-01-02").systemQuantity(15).build(),
                                                StocktakeItem.builder().productCode("89300155")
                                                                .productName("Sony WH-1000XM5")
                                                                .locationCode("B-01-03").systemQuantity(30).build(),
                                                StocktakeItem.builder().productCode("89300045")
                                                                .productName("Samsung Galaxy S22")
                                                                .locationCode("B-01-04").systemQuantity(40).build(),
                                                StocktakeItem.builder().productCode("89300221")
                                                                .productName("Logitech MX Master 3")
                                                                .locationCode("B-01-05").systemQuantity(60).build()))
                                .createdAt(LocalDateTime.now()).build();

                stocktakeTicketRepository.saveAll(Arrays.asList(kk003, kk004));
                System.out.println("   📝 StocktakeTickets: Đã tạo 2 phiếu kiểm kê test.");
        }
}
