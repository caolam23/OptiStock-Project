package com.optistock.backend.service;

import com.optistock.backend.dto.*;
import com.optistock.backend.model.Product;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.repository.StockVoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * DashboardService: Tính toán các số liệu tổng hợp cho Dashboard
 * 
 * Strategy:
 * 1. Load dữ liệu từ Repository
 * 2. Tính toán và filter phía Backend bằng Java Streams (hiệu suất cao)
 * 3. Mapping kết quả sang DTO
 * 4. Frontend chỉ cần render dữ liệu đã tính toán
 */
@Service
public class DashboardService {
    
    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private StockVoucherRepository stockVoucherRepository;
    
    // ==================== PUBLIC METHODS ====================
    
    /**
     * GET /api/v1/dashboard/summary
     * Tính toán tổng quan: Giá trị kho, SKU, Phiếu chờ xử lý
     */
    public DashboardSummaryDTO getSummary(String tenantId) {
        try {
            // A. Lấy tất cả products và tính toán
            List<Product> products = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
            
            Double totalInventoryValue = products.stream()
                .mapToDouble(p -> {
                    Double cost = p.getCost() != null ? p.getCost() : 0.0;
                    Integer stock = p.getCurrentStock() != null ? p.getCurrentStock() : 0;
                    return cost * stock;
                })
                .sum();
            
            Integer totalActiveSkus = (int) products.stream()
                .filter(p -> p.getCurrentStock() != null && p.getCurrentStock() > 0)
                .count();
            
            Integer totalProducts = products.size();
            
            Integer outOfStockProducts = (int) products.stream()
                .filter(p -> p.getCurrentStock() == null || p.getCurrentStock() <= 0)
                .count();
            
            // B. Tính số phiếu PENDING
            Integer pendingVouchers = (int) stockVoucherRepository.countByTenantIdAndStatus(tenantId, "PENDING");
            
            return DashboardSummaryDTO.builder()
                .totalInventoryValue(totalInventoryValue)
                .totalActiveSkus(totalActiveSkus)
                .pendingVouchers(pendingVouchers)
                .totalProducts(totalProducts)
                .outOfStockProducts(outOfStockProducts)
                .build();
                
        } catch (Exception e) {
            log.error("Error calculating summary for tenantId: {}", tenantId, e);
            return DashboardSummaryDTO.builder()
                .totalInventoryValue(0.0)
                .totalActiveSkus(0)
                .pendingVouchers(0)
                .totalProducts(0)
                .outOfStockProducts(0)
                .build();
        }
    }
    
    /**
     * GET /api/v1/dashboard/alerts
     * Lấy danh sách cảnh báo: Hết hàng + Hạn sử dụng (GROCERY)
     */
    public DashboardAlertDTO getAlerts(String tenantId, String industryType) {
        List<DashboardAlertDTO.LowStockAlertItem> lowStockProducts = getLowStockProducts(tenantId);
        List<DashboardAlertDTO.ExpiryBatchAlertItem> expiringBatches = new ArrayList<>();
        
        // Nếu GROCERY, thêm cảnh báo hạn sử dụng
        if ("GROCERY".equalsIgnoreCase(industryType)) {
            expiringBatches = getExpiringBatches(tenantId);
        }
        
        return DashboardAlertDTO.builder()
            .lowStockProducts(lowStockProducts)
            .expiringBatches(expiringBatches)
            .totalLowStockCount(lowStockProducts.size())
            .totalExpiringBatchCount(expiringBatches.size())
            .build();
    }
    
    /**
     * GET /api/v1/dashboard/charts
     * Lấy dữ liệu biểu đồ: Nhập/Xuất 7 ngày + Cơ cấu kho theo danh mục
     */
    public DashboardChartDTO getCharts(String tenantId) {
        List<DashboardChartDTO.DailyInOutData> sevenDayChart = getSevenDayInOutChart(tenantId);
        List<DashboardChartDTO.CategoryInventoryData> categoryData = getCategoryInventoryData(tenantId);
        
        return DashboardChartDTO.builder()
            .sevenDayInOutChart(sevenDayChart)
            .inventoryByCategory(categoryData)
            .build();
    }
    
    // ==================== PRIVATE HELPER METHODS ====================
    
    /**
     * Lấy Top 5 sản phẩm dưới minStock (tồn kho tối thiểu)
     * Sắp xếp theo stockDeficit giảm dần
     */
    private List<DashboardAlertDTO.LowStockAlertItem> getLowStockProducts(String tenantId) {
        try {
            List<Product> products = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
            
            return products.stream()
                .filter(p -> p.getCurrentStock() != null && 
                           p.getMinStock() != null && 
                           p.getCurrentStock() < p.getMinStock())
                .map(p -> {
                    int deficit = p.getMinStock() - p.getCurrentStock();
                    return DashboardAlertDTO.LowStockAlertItem.builder()
                        .productId(p.getId())
                        .productCode(p.getProductCode())
                        .productName(p.getProductName())
                        .category(p.getCategory())
                        .currentStock(p.getCurrentStock())
                        .minStock(p.getMinStock())
                        .stockDeficit(deficit)
                        .cost(p.getCost() != null ? p.getCost() : 0.0)
                        .mainUnit(p.getMainUnit())
                        .build();
                })
                .sorted((a, b) -> Integer.compare(b.getStockDeficit(), a.getStockDeficit()))
                .limit(5)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting low stock products for tenantId: {}", tenantId, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Lấy Top 5 lô hàng sắp hết hạn trong 30 ngày (GROCERY)
     * Sắp xếp theo daysRemaining tăng dần (gần hết hạn nhất lên đầu)
     */
    private List<DashboardAlertDTO.ExpiryBatchAlertItem> getExpiringBatches(String tenantId) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime thirtyDaysLater = now.plusDays(30);
            
            // Fetch all GROCERY products with batches
            List<Product> groceryProducts = productRepository.findByTenantIdAndIndustryTypeAndIsActive(
                tenantId, "GROCERY", true
            );
            
            List<DashboardAlertDTO.ExpiryBatchAlertItem> items = new ArrayList<>();
            
            for (Product product : groceryProducts) {
                if (product.getBatches() != null && !product.getBatches().isEmpty()) {
                    product.getBatches().forEach(batch -> {
                        if (batch.getExpiryDate() != null && 
                            batch.getExpiryDate().isAfter(now) &&
                            batch.getExpiryDate().isBefore(thirtyDaysLater)) {
                            
                            long daysRemaining = ChronoUnit.DAYS.between(now, batch.getExpiryDate());
                            String alertLevel = getAlertLevel(daysRemaining);
                            
                            items.add(DashboardAlertDTO.ExpiryBatchAlertItem.builder()
                                .productId(product.getId())
                                .productCode(product.getProductCode())
                                .productName(product.getProductName())
                                .batchCode(batch.getBatchCode())
                                .expiryDate(batch.getExpiryDate())
                                .daysRemaining(daysRemaining)
                                .quantity(batch.getQuantity() != null ? batch.getQuantity() : 0)
                                .mainUnit(product.getMainUnit())
                                .alertLevel(alertLevel)
                                .build());
                        }
                    });
                }
            }
            
            // Sort by daysRemaining ascending (most urgent first)
            return items.stream()
                .sorted(Comparator.comparing(DashboardAlertDTO.ExpiryBatchAlertItem::getDaysRemaining))
                .limit(5)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting expiring batches for tenantId: {}", tenantId, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Lấy dữ liệu Nhập/Xuất 7 ngày gần nhất
     */
    private List<DashboardChartDTO.DailyInOutData> getSevenDayInOutChart(String tenantId) {
        try {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            LocalDateTime now = LocalDateTime.now();
            
            // Lấy tất cả vouchers trong 7 ngày qua
            List<StockVoucher> vouchers = stockVoucherRepository
                .findByTenantIdAndCreatedAtBetweenAndStatusNot(
                    tenantId, 
                    sevenDaysAgo, 
                    now, 
                    "CANCELLED"
                );
            
            // Initialize 7 days map
            Map<String, DashboardChartDTO.DailyInOutData> dailyData = new LinkedHashMap<>();
            for (int i = 6; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                String dateStr = date.toString();
                dailyData.put(dateStr, DashboardChartDTO.DailyInOutData.builder()
                    .date(dateStr)
                    .inboundQuantity(0)
                    .outboundQuantity(0)
                    .inboundValue(0.0)
                    .outboundValue(0.0)
                    .build());
            }
            
            // Aggregate vouchers by date and type
            for (StockVoucher voucher : vouchers) {
                String dateStr = voucher.getCreatedAt().toLocalDate().toString();
                if (dailyData.containsKey(dateStr)) {
                    DashboardChartDTO.DailyInOutData dayData = dailyData.get(dateStr);
                    Integer totalQty = voucher.getTotalQuantityRequired();
                    Double totalValue = calculateVoucherValue(voucher);
                    
                    if ("INBOUND".equals(voucher.getType())) {
                        dayData.setInboundQuantity(dayData.getInboundQuantity() + totalQty);
                        dayData.setInboundValue(dayData.getInboundValue() + totalValue);
                    } else if ("OUTBOUND".equals(voucher.getType())) {
                        dayData.setOutboundQuantity(dayData.getOutboundQuantity() + totalQty);
                        dayData.setOutboundValue(dayData.getOutboundValue() + totalValue);
                    }
                }
            }
            
            return new ArrayList<>(dailyData.values());
            
        } catch (Exception e) {
            log.error("Error getting 7-day chart data for tenantId: {}", tenantId, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Lấy cơ cấu tồn kho theo danh mục (Pie Chart)
     */
    private List<DashboardChartDTO.CategoryInventoryData> getCategoryInventoryData(String tenantId) {
        try {
            List<Product> products = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
            
            // Group by category
            Map<String, List<Product>> byCategory = products.stream()
                .collect(Collectors.groupingBy(p -> p.getCategory() != null ? p.getCategory() : "Khác"));
            
            // Calculate total inventory value
            Double totalValue = products.stream()
                .mapToDouble(p -> {
                    Double cost = p.getCost() != null ? p.getCost() : 0.0;
                    Integer stock = p.getCurrentStock() != null ? p.getCurrentStock() : 0;
                    return cost * stock;
                })
                .sum();
            
            Double finalTotalValue = totalValue > 0 ? totalValue : 1.0;
            
            // Build result
            return byCategory.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    Double categoryValue = entry.getValue().stream()
                        .mapToDouble(p -> {
                            Double cost = p.getCost() != null ? p.getCost() : 0.0;
                            Integer stock = p.getCurrentStock() != null ? p.getCurrentStock() : 0;
                            return cost * stock;
                        })
                        .sum();
                    
                    Integer categoryQuantity = entry.getValue().stream()
                        .mapToInt(p -> p.getCurrentStock() != null ? p.getCurrentStock() : 0)
                        .sum();
                    
                    Double percentage = (categoryValue / finalTotalValue) * 100;
                    
                    return DashboardChartDTO.CategoryInventoryData.builder()
                        .category(category)
                        .value(categoryValue)
                        .quantity(categoryQuantity)
                        .percentage(Math.round(percentage * 100.0) / 100.0)
                        .build();
                })
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(10)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting category inventory data for tenantId: {}", tenantId, e);
            return new ArrayList<>();
        }
    }
    
    // ==================== UTILITY METHODS ====================
    
    /**
     * Tính giá trị tổng của một voucher dựa trên items
     */
    private Double calculateVoucherValue(StockVoucher voucher) {
        if (voucher.getItems() == null || voucher.getItems().isEmpty()) {
            return 0.0;
        }
        
        return voucher.getItems().stream()
            .mapToDouble(item -> {
                Integer qty = item.getQuantityRequired() != null ? item.getQuantityRequired() : 0;
                // Note: VoucherItem doesn't have cost, we approximate based on quantity
                // In a real scenario, you'd get price from the Product model
                return qty;
            })
            .sum() * 1000.0; // Placeholder multiplier (~1000 per item average)
    }
    
    /**
     * Xác định mức cảnh báo dựa trên số ngày còn lại
     */
    private String getAlertLevel(long daysRemaining) {
        if (daysRemaining <= 7) {
            return "CRITICAL";
        } else if (daysRemaining <= 14) {
            return "HIGH";
        } else {
            return "MEDIUM";
        }
    }
}
