package com.optistock.backend.service;

import com.optistock.backend.dto.DeadStockDTO;
import com.optistock.backend.dto.ABCAnalysisDTO;
import com.optistock.backend.model.Product;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.model.VoucherItem;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.repository.StockVoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ReportService: Xử lý logic báo cáo & phân tích dành cho Accountant
 * 
 * Tính năng:
 * 1. Dead Stock Report: Hàng tồn không bán
 * 2. ABC Analysis: Phân tích ABC theo doanh thu
 * 3. Export to Excel: Xuất báo cáo ra file XLSX
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    
    private final ProductRepository productRepository;
    private final StockVoucherRepository stockVoucherRepository;
    
    // ============================================================
    // 1. DEAD STOCK REPORT
    // ============================================================
    
    /**
     * Lấy báo cáo hàng tồn không bán trong N ngày
     * 
     * Logic:
     * 1. Lấy tất cả products active của workspace
     * 2. Với mỗi product, tìm OUTBOUND voucher gần nhất (completed)
     * 3. Nếu không có hoặc > thresholdDays → thêm vào dead stock list
     * 4. Tính tổng giá trị (stock * cost), sắp xếp theo ngày giảm dần
     * 
     * @param tenantId - Workspace ID
     * @param thresholdDays - Số ngày không bán (vd: 90)
     * @return List<DeadStockDTO> - Danh sách hàng tồn không bán
     */
    public List<DeadStockDTO> getDeadStockReport(String tenantId, int thresholdDays) {
        log.info("Generating dead stock report for tenant={} with threshold={} days", tenantId, thresholdDays);
        
        try {
            // 1. Lấy tất cả products active của workspace
            List<Product> allProducts = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
            
            if (allProducts.isEmpty()) {
                log.warn("No active products found for tenant={}", tenantId);
                return new ArrayList<>();
            }
            
            // 2. Lấy tất cả OUTBOUND vouchers của workspace (completed)
            List<StockVoucher> outboundVouchers = stockVoucherRepository
                    .findByTenantIdAndTypeAndStatus(tenantId, "OUTBOUND", "COMPLETED");
            
            // 3. Tạo map: productId -> ngày bán cuối cùng
            Map<String, LocalDateTime> lastSaleDate = new HashMap<>();
            
            for (StockVoucher voucher : outboundVouchers) {
                if (voucher.getItems() != null) {
                    for (VoucherItem item : voucher.getItems()) {
                        // Sử dụng completedAt từ voucher hoặc updatedAt
                        LocalDateTime saleDate = voucher.getCompletedAt() != null 
                            ? voucher.getCompletedAt() 
                            : voucher.getUpdatedAt();
                        
                        // Cập nhật nếu là ngày bán mới nhất
                        lastSaleDate.merge(
                            item.getProductId(),
                            saleDate,
                            (existing, current) -> current.isAfter(existing) ? current : existing
                        );
                    }
                }
            }
            
            // 4. Lọc products không bán hoặc bán > thresholdDays
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(thresholdDays);
            
            List<DeadStockDTO> deadStocks = allProducts.stream()
                .filter(product -> {
                    LocalDateTime lastSale = lastSaleDate.get(product.getId());
                    
                    if (lastSale == null) {
                        // Không có lần bán nào → tính từ ngày tạo
                        return product.getCreatedAt().isBefore(cutoffDate);
                    }
                    
                    // Ngày bán cuối cùng quá lâu rồi
                    return lastSale.isBefore(cutoffDate);
                })
                .map(product -> {
                    LocalDateTime lastSale = lastSaleDate.getOrDefault(
                        product.getId(), 
                        product.getCreatedAt()
                    );
                    
                    long daysSinceLastSale = java.time.temporal.ChronoUnit.DAYS
                        .between(lastSale, LocalDateTime.now());
                    
                    double totalValue = product.getCurrentStock() * (product.getCost() != null ? product.getCost() : 0.0);
                    
                    return DeadStockDTO.builder()
                        .productId(product.getId())
                        .productName(product.getProductName())
                        .productCode(product.getProductCode())
                        .daysSinceLastSale(daysSinceLastSale)
                        .stockQuantity(product.getCurrentStock())
                        .totalValue(totalValue)
                        .costPrice(product.getCost())
                        .category(product.getCategory())
                        .condition(product.getCondition())
                        .build();
                })
                // Sắp xếp theo daysSinceLastSale giảm dần (lâu không bán nhất trước)
                .sorted((a, b) -> Long.compare(b.getDaysSinceLastSale(), a.getDaysSinceLastSale()))
                .collect(Collectors.toList());
            
            log.info("Found {} dead stock products for tenant={}", deadStocks.size(), tenantId);
            return deadStocks;
            
        } catch (Exception e) {
            log.error("Error generating dead stock report for tenant={}", tenantId, e);
            throw new RuntimeException("Failed to generate dead stock report: " + e.getMessage(), e);
        }
    }
    
    // ============================================================
    // 2. ABC ANALYSIS
    // ============================================================
    
    /**
     * Phân tích ABC dựa trên doanh thu
     * 
     * Logic:
     * 1. Lấy tất cả OUTBOUND vouchers (completed)
     * 2. Tính tổng doanh thu mỗi sản phẩm (sum quantityActual * price)
     * 3. Sắp xếp giảm dần theo doanh thu
     * 4. Tính cumulative percentage
     * 5. Phân loại: A (0-70%), B (70-90%), C (90-100%)
     * 
     * @param tenantId - Workspace ID
     * @return List<ABCAnalysisDTO> - Danh sách sản phẩm được phân loại ABC
     */
    public List<ABCAnalysisDTO> getABCAnalysis(String tenantId) {
        log.info("Generating ABC analysis for tenant={}", tenantId);
        
        try {
            // 1. Lấy tất cả OUTBOUND vouchers (completed)
            List<StockVoucher> outboundVouchers = stockVoucherRepository
                    .findByTenantIdAndTypeAndStatus(tenantId, "OUTBOUND", "COMPLETED");
            
            // 2. Tạo map: productId -> {revenue, quantity, price, productName}
            Map<String, ProductSalesData> salesDataMap = new HashMap<>();
            
            for (StockVoucher voucher : outboundVouchers) {
                if (voucher.getItems() != null) {
                    for (VoucherItem item : voucher.getItems()) {
                        // Tìm product để lấy price
                        Product product = productRepository.findById(item.getProductId()).orElse(null);
                        if (product == null) continue;
                        
                        double price = product.getPrice() != null ? product.getPrice() : 0.0;
                        double itemRevenue = item.getQuantityActual() * price;
                        
                        salesDataMap.merge(
                            item.getProductId(),
                            new ProductSalesData(
                                item.getProductId(),
                                item.getProductName(),
                                product.getProductCode(),
                                itemRevenue,
                                item.getQuantityActual(),
                                price,
                                product.getCategory()
                            ),
                            ProductSalesData::merge
                        );
                    }
                }
            }
            
            if (salesDataMap.isEmpty()) {
                log.warn("No sales data found for ABC analysis, tenant={}", tenantId);
                return new ArrayList<>();
            }
            
            // 3. Sắp xếp giảm dần theo doanh thu
            List<ProductSalesData> sortedByRevenue = salesDataMap.values().stream()
                .sorted((a, b) -> Double.compare(b.getRevenue(), a.getRevenue()))
                .collect(Collectors.toList());
            
            // 4. Tính tổng doanh thu
            double totalRevenue = sortedByRevenue.stream()
                .mapToDouble(ProductSalesData::getRevenue)
                .sum();
            
            // 5. Tính cumulative percentage và gán category
            List<ABCAnalysisDTO> result = new ArrayList<>();
            double cumulativeRevenue = 0.0;
            
            for (ProductSalesData data : sortedByRevenue) {
                cumulativeRevenue += data.getRevenue();
                double cumulativePercent = (cumulativeRevenue / totalRevenue) * 100.0;
                
                String category = cumulativePercent <= 70.0 ? "A" 
                                : cumulativePercent <= 90.0 ? "B" 
                                : "C";
                
                result.add(ABCAnalysisDTO.builder()
                    .productId(data.getProductId())
                    .productName(data.getProductName())
                    .productCode(data.getProductCode())
                    .totalRevenue(data.getRevenue())
                    .quantitySold(data.getQuantitySold())
                    .price(data.getPrice())
                    .productCategory(data.getProductCategory())
                    .cumulativePercentage(cumulativePercent)
                    .category(category)
                    .build());
            }
            
            log.info("ABC analysis generated: {} products analyzed for tenant={}", result.size(), tenantId);
            return result;
            
        } catch (Exception e) {
            log.error("Error generating ABC analysis for tenant={}", tenantId, e);
            throw new RuntimeException("Failed to generate ABC analysis: " + e.getMessage(), e);
        }
    }
    
    // ============================================================
    // 3. EXPORT TO EXCEL
    // ============================================================
    
    /**
     * Xuất báo cáo Dead Stock ra file Excel
     * 
     * @param tenantId - Workspace ID
     * @param thresholdDays - Số ngày không bán
     * @return byte[] - File XLSX data
     * @throws IOException - Lỗi I/O
     */
    public byte[] exportDeadStockToExcel(String tenantId, int thresholdDays) throws IOException {
        log.info("Exporting dead stock report to Excel for tenant={}", tenantId);
        
        try (
            XSSFWorkbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream baos = new ByteArrayOutputStream()
        ) {
            // Lấy dữ liệu
            List<DeadStockDTO> deadStocks = getDeadStockReport(tenantId, thresholdDays);
            
            // Tạo sheet
            Sheet sheet = workbook.createSheet("Dead Stock Report");
            
            // Style header
            CellStyle headerStyle = createHeaderStyle(workbook);
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "STT", "Mã Sản Phẩm", "Tên Sản Phẩm", "Danh Mục", "Tình Trạng",
                "Ngày Không Bán (ngày)", "Tồn Kho (units)", "Giá Vốn (VND)", "Tổng Giá Trị (VND)"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Điền dữ liệu
            int rowNum = 1;
            for (DeadStockDTO dto : deadStocks) {
                Row dataRow = sheet.createRow(rowNum++);
                
                dataRow.createCell(0).setCellValue(rowNum - 1);
                dataRow.createCell(1).setCellValue(dto.getProductCode() != null ? dto.getProductCode() : "");
                dataRow.createCell(2).setCellValue(dto.getProductName() != null ? dto.getProductName() : "");
                dataRow.createCell(3).setCellValue(dto.getCategory() != null ? dto.getCategory() : "");
                dataRow.createCell(4).setCellValue(dto.getCondition() != null ? dto.getCondition() : "");
                dataRow.createCell(5).setCellValue(dto.getDaysSinceLastSale() != null ? dto.getDaysSinceLastSale() : 0);
                dataRow.createCell(6).setCellValue(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
                dataRow.createCell(7).setCellValue(dto.getCostPrice() != null ? dto.getCostPrice() : 0.0);
                dataRow.createCell(8).setCellValue(dto.getTotalValue() != null ? dto.getTotalValue() : 0.0);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Ghi vào ByteArrayOutputStream
            workbook.write(baos);
            log.info("Dead stock Excel export completed for tenant={}", tenantId);
            
            return baos.toByteArray();
            
        } catch (IOException e) {
            log.error("Error exporting dead stock report to Excel for tenant={}", tenantId, e);
            throw new IOException("Failed to export dead stock report: " + e.getMessage(), e);
        }
    }
    
    /**
     * Xuất báo cáo ABC Analysis ra file Excel
     * 
     * @param tenantId - Workspace ID
     * @return byte[] - File XLSX data
     * @throws IOException - Lỗi I/O
     */
    public byte[] exportABCAnalysisToExcel(String tenantId) throws IOException {
        log.info("Exporting ABC analysis report to Excel for tenant={}", tenantId);
        
        try (
            XSSFWorkbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream baos = new ByteArrayOutputStream()
        ) {
            // Lấy dữ liệu
            List<ABCAnalysisDTO> abcList = getABCAnalysis(tenantId);
            
            // Tạo sheet
            Sheet sheet = workbook.createSheet("ABC Analysis");
            
            // Style header
            CellStyle headerStyle = createHeaderStyle(workbook);
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "STT", "Mã Sản Phẩm", "Tên Sản Phẩm", "Danh Mục",
                "Phân Loại ABC", "Số Lượng Bán", "Giá Bán (VND)", "Tổng Doanh Thu (VND)", "% Lũy Tích"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Điền dữ liệu
            int rowNum = 1;
            for (ABCAnalysisDTO dto : abcList) {
                Row dataRow = sheet.createRow(rowNum++);
                
                dataRow.createCell(0).setCellValue(rowNum - 1);
                dataRow.createCell(1).setCellValue(dto.getProductCode() != null ? dto.getProductCode() : "");
                dataRow.createCell(2).setCellValue(dto.getProductName() != null ? dto.getProductName() : "");
                dataRow.createCell(3).setCellValue(dto.getProductCategory() != null ? dto.getProductCategory() : "");
                dataRow.createCell(4).setCellValue(dto.getCategory() != null ? dto.getCategory() : "");
                dataRow.createCell(5).setCellValue(dto.getQuantitySold() != null ? dto.getQuantitySold() : 0);
                dataRow.createCell(6).setCellValue(dto.getPrice() != null ? dto.getPrice() : 0.0);
                dataRow.createCell(7).setCellValue(dto.getTotalRevenue() != null ? dto.getTotalRevenue() : 0.0);
                
                Cell percentCell = dataRow.createCell(8);
                percentCell.setCellValue(dto.getCumulativePercentage() != null 
                    ? String.format("%.2f%%", dto.getCumulativePercentage()) 
                    : "0%");
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Ghi vào ByteArrayOutputStream
            workbook.write(baos);
            log.info("ABC analysis Excel export completed for tenant={}", tenantId);
            
            return baos.toByteArray();
            
        } catch (IOException e) {
            log.error("Error exporting ABC analysis report to Excel for tenant={}", tenantId, e);
            throw new IOException("Failed to export ABC analysis report: " + e.getMessage(), e);
        }
    }
    
    // ============================================================
    // HELPER METHODS
    // ============================================================
    
    /**
     * Tạo style cho header (in đậm, nền màu xanh)
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    // ============================================================
    // INNER CLASS: Helper để tính toán doanh thu
    // ============================================================
    
    /**
     * Helper class để lưu dữ liệu bán hàng tạm thời
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class ProductSalesData {
        private String productId;
        private String productName;
        private String productCode;
        private Double revenue;
        private Integer quantitySold;
        private Double price;
        private String productCategory;
        
        /**
         * Merge dữ liệu từ nhiều transactions
         */
        public ProductSalesData merge(ProductSalesData other) {
            this.revenue += other.getRevenue();
            this.quantitySold += other.getQuantitySold();
            return this;
        }
    }
}
