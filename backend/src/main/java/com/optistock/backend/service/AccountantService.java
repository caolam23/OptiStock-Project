package com.optistock.backend.service;

import com.optistock.backend.dto.AccountantDashboardDTO;
import com.optistock.backend.model.Product;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.model.VoucherItem;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.repository.StockVoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AccountantService - Logic tính toán tài chính cho Accountant Dashboard
 * 
 * Chức năng:
 * 1. Tính toán tồn kho (quantity, value)
 * 2. Thống kê hoạt động nhập/xuất 7 ngày
 * 3. Xây dựng dashboard summary
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountantService {
    
    private final ProductRepository productRepository;
    private final StockVoucherRepository stockVoucherRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int ACTIVITY_DAYS = 7;
    
    /**
     * Lấy dashboard summary cho Accountant
     * 
     * @param tenantId - Workspace ID
     * @return AccountantDashboardDTO chứa tất cả thống kê
     */
    public AccountantDashboardDTO getDashboardSummary(String tenantId) {
        log.info("Generating accountant dashboard for tenant={}", tenantId);
        
        try {
            if (tenantId == null || tenantId.trim().isEmpty()) {
                throw new IllegalArgumentException("Tenant ID cannot be null or empty");
            }
            
            // 1. Lấy dữ liệu cơ bản
            List<Product> activeProducts = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
            if (activeProducts == null) {
                activeProducts = new ArrayList<>();
            }
            
            int totalProducts = activeProducts.size();
            int totalStockQuantity = calculateTotalStockQuantity(activeProducts);
            BigDecimal totalInventoryValue = calculateTotalInventoryValue(activeProducts);
            int todayVouchersCount = countTodayVouchers(tenantId);
            
            // 2. Lấy dữ liệu hoạt động (activity chart)
            List<AccountantDashboardDTO.ActivityRecord> activityData = getActivityChartData(tenantId);
            if (activityData == null) {
                activityData = new ArrayList<>();
            }
            
            // 3. Build DTO
            AccountantDashboardDTO dashboard = AccountantDashboardDTO.builder()
                    .totalProducts(totalProducts)
                    .totalStockQuantity(totalStockQuantity)
                    .todayVouchersCount(todayVouchersCount)
                    .totalInventoryValue(totalInventoryValue != null ? totalInventoryValue : BigDecimal.ZERO)
                    .activityData(activityData)
                    .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
            
            log.info("Dashboard generated: products={}, stockQty={}, value={}", 
                    totalProducts, totalStockQuantity, totalInventoryValue);
            
            return dashboard;
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid argument in getDashboardSummary: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error generating accountant dashboard for tenant={}", tenantId, e);
            throw new RuntimeException("Failed to generate dashboard: " + e.getMessage(), e);
        }
    }
    
    /**
     * Tính tổng tồn kho (units) từ danh sách sản phẩm
     */
    private int calculateTotalStockQuantity(List<Product> products) {
        return products.stream()
                .mapToInt(p -> p.getCurrentStock() != null ? p.getCurrentStock() : 0)
                .sum();
    }
    
    /**
     * Tính tổng giá trị tồn kho hiện tại
     * 
     * Logic: Σ(currentStock × costPrice)
     * 
     * @param products - Danh sách sản phẩm active
     * @return BigDecimal - Tổng giá trị (VND)
     */
    private BigDecimal calculateTotalInventoryValue(List<Product> products) {
        return products.stream()
                .map(product -> {
                    int stock = product.getCurrentStock() != null ? product.getCurrentStock() : 0;
                    double cost = product.getCost() != null ? product.getCost() : 0.0;
                    return BigDecimal.valueOf(stock * cost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Đếm số phiếu (voucher) được tạo hôm nay
     */
    private int countTodayVouchers(String tenantId) {
        try {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay();
            
            List<StockVoucher> allVouchers = stockVoucherRepository.findByTenantId(tenantId);
            
            return (int) allVouchers.stream()
                    .filter(v -> v.getCreatedAt() != null &&
                            v.getCreatedAt().isAfter(startOfDay) &&
                            v.getCreatedAt().isBefore(endOfDay))
                    .count();
            
        } catch (Exception e) {
            log.warn("Error counting today vouchers: {}", e.getMessage());
            return 0;
        }
    }
    
    /**
     * Lấy dữ liệu hoạt động nhập/xuất trong N ngày gần nhất (mặc định 7 ngày)
     * 
     * Logic:
     * 1. Lấy các phiếu COMPLETED từ N ngày qua
     * 2. Group by ngày
     * 3. Tính tổng import/export value theo ngày
     * 
     * @param tenantId - Workspace ID
     * @return List<ActivityRecord> - Dữ liệu 7 ngày
     */
    public List<AccountantDashboardDTO.ActivityRecord> getActivityChartData(String tenantId) {
        try {
            LocalDateTime fromDate = LocalDateTime.now().minusDays(ACTIVITY_DAYS);
            
            // 1. Lấy tất cả COMPLETED vouchers của workspace
            List<StockVoucher> completedVouchers = stockVoucherRepository
                    .findByTenantIdAndStatus(tenantId, "COMPLETED");
            
            if (completedVouchers == null) {
                completedVouchers = new ArrayList<>();
            }
            
            // 2. Lọc vouchers trong ACTIVITY_DAYS ngày gần nhất
            List<StockVoucher> recentVouchers = completedVouchers.stream()
                    .filter(v -> v != null && v.getCompletedAt() != null && v.getCompletedAt().isAfter(fromDate))
                    .collect(Collectors.toList());
            
            // 3. Map để lưu hoạt động theo ngày: date -> {importValue, exportValue, ...}
            Map<String, ActivityData> activityMap = new TreeMap<>();
            
            // Khởi tạo 7 ngày với giá trị 0
            for (int i = ACTIVITY_DAYS - 1; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                String dateStr = date.format(DATE_FORMATTER);
                activityMap.put(dateStr, new ActivityData());
            }
            
            // 4. Xử lý từng phiếu và cộng giá trị vào map
            for (StockVoucher voucher : recentVouchers) {
                try {
                    if (voucher.getCompletedAt() == null || voucher.getType() == null) {
                        continue;
                    }
                    
                    LocalDate voucherDate = voucher.getCompletedAt().toLocalDate();
                    String dateStr = voucherDate.format(DATE_FORMATTER);
                    
                    ActivityData data = activityMap.getOrDefault(dateStr, new ActivityData());
                    
                    // Tính tổng giá trị các items trong phiếu
                    BigDecimal voucherValue = calculateVoucherValue(voucher);
                    
                    if ("INBOUND".equals(voucher.getType())) {
                        data.importValue = data.importValue.add(voucherValue);
                        data.importCount++;
                    } else if ("OUTBOUND".equals(voucher.getType())) {
                        data.exportValue = data.exportValue.add(voucherValue);
                        data.exportCount++;
                    }
                    
                    activityMap.put(dateStr, data);
                } catch (Exception e) {
                    log.warn("Error processing voucher {}: {}", 
                            voucher != null ? voucher.getId() : "null", e.getMessage());
                }
            }
            
            // 5. Convert map thành list DTO
            return activityMap.entrySet().stream()
                    .map(entry -> AccountantDashboardDTO.ActivityRecord.builder()
                            .date(entry.getKey())
                            .importValue(entry.getValue().importValue)
                            .exportValue(entry.getValue().exportValue)
                            .importCount(entry.getValue().importCount)
                            .exportCount(entry.getValue().exportCount)
                            .build())
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("Error generating activity chart data for tenant={}", tenantId, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Tính tổng giá trị của một phiếu voucher
     * = Tổng(quantityActual × price từ Backend lấy từ products)
     */
    private BigDecimal calculateVoucherValue(StockVoucher voucher) {
        if (voucher == null || voucher.getItems() == null || voucher.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal totalValue = BigDecimal.ZERO;
        
        for (VoucherItem item : voucher.getItems()) {
            try {
                if (item == null || item.getProductId() == null) {
                    continue;
                }
                
                // Lấy product để có giá (price hoặc cost)
                Product product = productRepository.findById(item.getProductId()).orElse(null);
                
                if (product == null) {
                    log.warn("Product not found: {}", item.getProductId());
                    continue;
                }
                
                int quantity = item.getQuantityActual() != null ? item.getQuantityActual() : 0;
                double price = product.getPrice() != null ? product.getPrice() : 
                               (product.getCost() != null ? product.getCost() : 0.0);
                
                totalValue = totalValue.add(BigDecimal.valueOf(quantity * price));
                
            } catch (Exception e) {
                log.warn("Error calculating item value for item {}: {}", 
                        item != null ? item.getProductId() : "null", e.getMessage());
            }
        }
        
        return totalValue;
    }
    
    /**
     * Helper class để tạm lưu dữ liệu hoạt động trong map
     */
    @lombok.Data
    private static class ActivityData {
        private BigDecimal importValue = BigDecimal.ZERO;
        private BigDecimal exportValue = BigDecimal.ZERO;
        private Integer importCount = 0;
        private Integer exportCount = 0;
    }
}
