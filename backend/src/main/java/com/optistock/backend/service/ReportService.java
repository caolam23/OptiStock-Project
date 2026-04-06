package com.optistock.backend.service;

import com.optistock.backend.model.Product;
import com.optistock.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ReportService: Xây dựng báo cáo nâng cao cho OptiStock.
 * 
 * Hỗ trợ 2 ngành hàng: ELECTRONICS, GROCERY
 * Cách ly dữ liệu qua `industryType` ở tầng Service.
 */
@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private ProductRepository productRepository;

    // ==================== INVENTORY VALUATION ====================
    
    /**
     * getInventoryValuation: Gom nhóm tồn kho theo Category, tính giá trị vốn.
     * 
     * Trả về: List<Map> với fields {category, totalQuantity, totalValue, avgCost}
     * Formula: totalValue = SUM(currentStock * cost)
     */
    public List<Map<String, Object>> getInventoryValuation(String tenantId, String industryType) {
        try {
            List<Product> products = productRepository.findByTenantIdAndIndustryTypeAndIsActive(
                tenantId, industryType, true
            );

            if (products.isEmpty()) {
                return List.of();
            }

            // Group by category
            Map<String, List<Product>> grouped = new java.util.LinkedHashMap<>();
            for (Product p : products) {
                String cat = p.getCategory() != null ? p.getCategory() : "Chưa phân loại";
                grouped.computeIfAbsent(cat, k -> new ArrayList<>()).add(p);
            }

            // Calculate totals per category
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map.Entry<String, List<Product>> entry : grouped.entrySet()) {
                double totalValue = 0;
                int totalQty = 0;
                double totalCost = 0;
                int count = 0;

                for (Product p : entry.getValue()) {
                    int qty = p.getCurrentStock() != null ? p.getCurrentStock() : 0;
                    double cost = p.getCost() != null ? p.getCost() : 0;
                    totalValue += qty * cost;
                    totalQty += qty;
                    totalCost += cost;
                    count++;
                }

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("category", entry.getKey());
                row.put("totalQuantity", totalQty);
                row.put("totalValue", Math.round(totalValue * 100.0) / 100.0);
                row.put("avgCost", totalCost / count);

                result.add(row);
            }

            // Sort by totalValue descending
            result.sort((a, b) -> Double.compare((double) b.get("totalValue"), (double) a.get("totalValue")));

            log.info("✅ Inventory Valuation Report - industryType: {}, records: {}", 
                industryType, result.size());
            
            return result;

        } catch (Exception e) {
            log.error("❌ Lỗi getInventoryValuation:", e);
            return List.of();
        }
    }

    // ==================== ABC ANALYSIS ====================
    
    /**
     * getAbcAnalysis: Phân tích ABC dựa trên giá trị tồn kho.
     * 
     * Class A: Top 80% cumulative value
     * Class B: Next 15% (80-95%)
     * Class C: Bottom 5% (95-100%)
     * 
     * Trả về: List<Map> với fields {productCode, productName, value, classification}
     */
    public List<Map<String, Object>> getAbcAnalysis(String tenantId, String industryType) {
        try {
            log.info("🔍 ABC Analysis - tenantId: {}, industryType: {}", tenantId, industryType);

            // Step 1: Lấy tất cả products
            List<Product> products = productRepository.findByTenantIdAndIndustryTypeAndIsActive(
                tenantId, industryType, true
            );

            if (products.isEmpty()) {
                return List.of();
            }

            // Step 2: Tính giá trị mỗi SKU (currentStock * cost)
            List<Map<String, Object>> skuValues = products.stream()
                .map(p -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("productCode", p.getProductCode());
                    row.put("productName", p.getProductName());
                    
                    int qty = p.getCurrentStock() != null ? p.getCurrentStock() : 0;
                    double cost = p.getCost() != null ? p.getCost() : 0;
                    double value = qty * cost;
                    
                    row.put("value", value);
                    row.put("quantity", qty);
                    row.put("cost", cost);
                    return row;
                })
                .sorted((a, b) -> Double.compare((double) b.get("value"), (double) a.get("value")))
                .collect(Collectors.toList());

            // Step 3: Tính tổng giá trị
            double totalValue = skuValues.stream()
                .mapToDouble(m -> (double) m.get("value"))
                .sum();

            if (totalValue <= 0) {
                log.warn("⚠️ Total value is 0, all items classified as C");
                return skuValues;
            }

            // Step 4: Phân loại ABC theo cumulative %
            double cumulativeValue = 0;
            for (Map<String, Object> sku : skuValues) {
                cumulativeValue += (double) sku.get("value");
                double percentage = (cumulativeValue / totalValue) * 100;

                String classification;
                if (percentage <= 80) {
                    classification = "A";
                } else if (percentage <= 95) {
                    classification = "B";
                } else {
                    classification = "C";
                }
                
                sku.put("classification", classification);
                sku.put("cumulativePercentage", Math.round(percentage * 100.0) / 100.0);
            }

            log.info("✅ ABC Analysis - Total SKUs: {}, A: {}, B: {}, C: {}", 
                skuValues.size(),
                skuValues.stream().filter(m -> "A".equals(m.get("classification"))).count(),
                skuValues.stream().filter(m -> "B".equals(m.get("classification"))).count(),
                skuValues.stream().filter(m -> "C".equals(m.get("classification"))).count()
            );

            return skuValues;

        } catch (Exception e) {
            log.error("❌ Lỗi getAbcAnalysis:", e);
            return List.of();
        }
    }

    // ==================== INDUSTRY-SPECIFIC REPORTS ====================

    /**
     * getExpiryReport (GROCERY): Báo cáo lô hàng sắp hết hạn hoặc quá hạn.
     * 
     * Lọc sản phẩm có mảng `batches` với:
     * - expiryDate < 30 ngày tới (vàng)
     * - expiryDate <= hôm nay (đỏ)
     * 
     * Trả về: List<Map> với fields {productCode, productName, batchCode, expiryDate, quantity, status}
     */
    public List<Map<String, Object>> getExpiryReport(String tenantId) {
        try {
            log.info("📦 Expiry Report (GROCERY) - tenantId: {}", tenantId);

            List<Product> products = productRepository.findByTenantIdAndIndustryTypeAndIsActive(
                tenantId, "GROCERY", true
            );

            List<Map<String, Object>> expiryItems = new ArrayList<>();
            LocalDate today = LocalDate.now();
            LocalDate threshold30 = today.plusDays(30);

            for (Product product : products) {
                if (product.getBatches() == null || product.getBatches().isEmpty()) continue;
                
                for (Product.Batch batch : product.getBatches()) {
                    LocalDateTime expiryDateTime = batch.getExpiryDate();
                    if (expiryDateTime == null) continue;

                    LocalDate expiryDate = expiryDateTime.toLocalDate();

                    // Lọc: expiryDate <= 30 ngày tới
                    if (!expiryDate.isAfter(threshold30)) {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("productCode", product.getProductCode());
                        row.put("productName", product.getProductName());
                        row.put("batchCode", batch.getBatchCode());
                        row.put("expiryDate", expiryDate);
                        row.put("quantity", batch.getQuantity());
                        
                        String status = !expiryDate.isAfter(today) ? "EXPIRED" : "WARNING";
                        row.put("status", status);
                        row.put("daysRemaining", java.time.temporal.ChronoUnit.DAYS.between(today, expiryDate));
                        
                        expiryItems.add(row);
                    }
                }
            }

            log.info("✅ Expiry Report - Total items: {}", expiryItems.size());
            return expiryItems;

        } catch (Exception e) {
            log.error("❌ Lỗi getExpiryReport:", e);
            return List.of();
        }
    }

    /**
     * getDeadStockReport (ELECTRONICS): Báo cáo tồn đọng - sản phẩm không bán (lưu kho > 60/90 ngày).
     * 
     * Cơ chế:
     * - Lấy `createdAt` (ngày nhập kho lần đầu)
     * - So sánh với hôm nay: tính ngày lưu kho
     * - Lọc: >= 60 ngày, >= 90 ngày
     * 
     * Trả về: List<Map> với fields {productCode, productName, sku, createdAt, lastSalesDate, 
     *                                 daysInStock, daysStockWarning (60/90)}
     */
    public List<Map<String, Object>> getDeadStockReport(String tenantId) {
        try {
            log.info("💀 Dead Stock Report (ELECTRONICS) - tenantId: {}", tenantId);

            // Lấy tất cả active products ELECTRONICS
            List<Product> products = productRepository.findByTenantIdAndIndustryTypeAndIsActive(
                tenantId, "ELECTRONICS", true
            );

            List<Map<String, Object>> deadStockItems = new ArrayList<>();
            LocalDate today = LocalDate.now();

            for (Product product : products) {
                LocalDateTime refDateTime = product.getCreatedAt();
                if (refDateTime == null) continue;

                LocalDate referenceDate = refDateTime.toLocalDate();
                long daysInStock = java.time.temporal.ChronoUnit.DAYS.between(referenceDate, today);

                // Chỉ báo cáo items lưu kho > 60 ngày
                if (daysInStock >= 60) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("productCode", product.getProductCode());
                    row.put("productName", product.getProductName());
                    row.put("sku", product.getProductCode());
                    row.put("createdAt", referenceDate);
                    row.put("lastSalesDate", "Chưa xuất kho");
                    row.put("daysInStock", daysInStock);
                    
                    String warning = daysInStock >= 90 ? "CRITICAL_90_DAYS" : "WARNING_60_DAYS";
                    row.put("daysStockWarning", warning);
                    
                    deadStockItems.add(row);
                }
            }

            // Sort theo daysInStock descending (lâu nhất trước)
            deadStockItems.sort((a, b) -> Long.compare(
                (long) b.get("daysInStock"),
                (long) a.get("daysInStock")
            ));

            log.info("✅ Dead Stock Report - Total items: {} (>60 days)", deadStockItems.size());
            return deadStockItems;

        } catch (Exception e) {
            log.error("❌ Lỗi getDeadStockReport:", e);
            return List.of();
        }
    }

    // ==================== HELPER: COUNT BY CLASSIFICATION ====================
    
    /**
     * getAbcSummary: Đếm số lượng SKU theo từng class (A, B, C).
     * Dùng để hiển thị PieChart.
     */
    public Map<String, Object> getAbcSummary(String tenantId, String industryType) {
        List<Map<String, Object>> analysis = getAbcAnalysis(tenantId, industryType);
        
        long classA = analysis.stream()
            .filter(m -> "A".equals(m.get("classification")))
            .count();
        
        long classB = analysis.stream()
            .filter(m -> "B".equals(m.get("classification")))
            .count();
        
        long classC = analysis.stream()
            .filter(m -> "C".equals(m.get("classification")))
            .count();

        // Tính giá trị theo class
        double valueA = analysis.stream()
            .filter(m -> "A".equals(m.get("classification")))
            .mapToDouble(m -> (double) m.get("value"))
            .sum();

        double valueB = analysis.stream()
            .filter(m -> "B".equals(m.get("classification")))
            .mapToDouble(m -> (double) m.get("value"))
            .sum();

        double valueC = analysis.stream()
            .filter(m -> "C".equals(m.get("classification")))
            .mapToDouble(m -> (double) m.get("value"))
            .sum();

        double totalValue = valueA + valueB + valueC;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("classA", Map.of("count", classA, "value", valueA, 
            "percentage", totalValue > 0 ? Math.round((valueA / totalValue) * 10000.0) / 100.0 : 0));
        summary.put("classB", Map.of("count", classB, "value", valueB, 
            "percentage", totalValue > 0 ? Math.round((valueB / totalValue) * 10000.0) / 100.0 : 0));
        summary.put("classC", Map.of("count", classC, "value", valueC, 
            "percentage", totalValue > 0 ? Math.round((valueC / totalValue) * 10000.0) / 100.0 : 0));
        summary.put("totalValue", totalValue);

        return summary;
    }
}
