package com.optistock.backend.controller;

import com.optistock.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ReportController: REST API endpoints cho module Reports
 * 
 * Base URL: /api/v1/workspaces/{tenantId}/reports
 * 
 * Endpoints:
 * - GET /inventory-valuation (Giá trị tồn kho theo danh mục)
 * - GET /abc-analysis (Phân tích ABC)
 * - GET /abc-summary (Tóm tắt ABC cho PieChart)
 * - GET /expiry-report (Báo cáo date hết hạn - GROCERY)
 * - GET /deadstock-report (Báo cáo dead stock - ELECTRONICS)
 */
@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    // ==================== COMMON REPORTS ====================

    /**
     * GET /inventory-valuation?industryType=ELECTRONICS
     * 
     * Lấy giá trị tồn kho gom nhóm theo Category
     */
    @GetMapping("/inventory-valuation")
    public ResponseEntity<?> getInventoryValuation(
        @PathVariable String tenantId,
        @RequestParam(required = false, defaultValue = "ELECTRONICS") String industryType
    ) {
        try {
            log.info("GET /inventory-valuation - tenantId: {}, industryType: {}", tenantId, industryType);
            
            List<Map<String, Object>> data = reportService.getInventoryValuation(tenantId, industryType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", data);
            response.put("total", data.size());
            response.put("status", "SUCCESS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi inventoryValuation:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    /**
     * GET /abc-analysis?industryType=ELECTRONICS
     * 
     * Lấy danh sách SKU phân loại ABC
     */
    @GetMapping("/abc-analysis")
    public ResponseEntity<?> getAbcAnalysis(
        @PathVariable String tenantId,
        @RequestParam(required = false, defaultValue = "ELECTRONICS") String industryType
    ) {
        try {
            log.info("GET /abc-analysis - tenantId: {}, industryType: {}", tenantId, industryType);
            
            List<Map<String, Object>> data = reportService.getAbcAnalysis(tenantId, industryType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", data);
            response.put("total", data.size());
            response.put("status", "SUCCESS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi abcAnalysis:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    /**
     * GET /abc-summary?industryType=ELECTRONICS
     * 
     * Lấy tóm tắt ABC (count + value + percentage) cho PieChart
     */
    @GetMapping("/abc-summary")
    public ResponseEntity<?> getAbcSummary(
        @PathVariable String tenantId,
        @RequestParam(required = false, defaultValue = "ELECTRONICS") String industryType
    ) {
        try {
            log.info("GET /abc-summary - tenantId: {}, industryType: {}", tenantId, industryType);
            
            Map<String, Object> summary = reportService.getAbcSummary(tenantId, industryType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", summary);
            response.put("status", "SUCCESS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi abcSummary:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    // ==================== INDUSTRY-SPECIFIC REPORTS ====================

    /**
     * GET /expiry-report
     * 
     * Báo cáo lô hàng sắp hết hạn hoặc quá hạn (GROCERY)
     * Dữ liệu: Tên SP, Mã Lô, Ngày Hết Hạn, Tồn kho lô, Trạng thái cảnh báo
     */
    @GetMapping("/expiry-report")
    public ResponseEntity<?> getExpiryReport(
        @PathVariable String tenantId
    ) {
        try {
            log.info("GET /expiry-report - tenantId: {}", tenantId);
            
            List<Map<String, Object>> data = reportService.getExpiryReport(tenantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", data);
            response.put("total", data.size());
            response.put("status", "SUCCESS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi expiryReport:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    /**
     * GET /deadstock-report
     * 
     * Báo cáo tồn đọng (ELECTRONICS)
     * Dữ liệu: Tên SP, Mã SKU, Ngày nhập, Số ngày lưu kho, Cảnh báo 60/90 ngày
     */
    @GetMapping("/deadstock-report")
    public ResponseEntity<?> getDeadstockReport(
        @PathVariable String tenantId
    ) {
        try {
            log.info("GET /deadstock-report - tenantId: {}", tenantId);
            
            List<Map<String, Object>> data = reportService.getDeadStockReport(tenantId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", data);
            response.put("total", data.size());
            response.put("status", "SUCCESS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi deadstockReport:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }
}
