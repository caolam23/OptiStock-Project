package com.optistock.backend.controller;

import com.optistock.backend.dto.DeadStockDTO;
import com.optistock.backend.dto.ABCAnalysisDTO;
import com.optistock.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ReportController: API endpoints cho báo cáo & phân tích dành cho Accountant
 * 
 * Base path: /api/v1/workspaces/{workspaceId}/reports
 * 
 * Endpoints:
 * - GET /dead-stock?days=90 - Báo cáo hàng tồn không bán
 * - GET /abc-analysis - Phân tích ABC
 * - GET /export/dead-stock - Xuất excel dead stock
 * - GET /export/abc-analysis - Xuất excel ABC
 */
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {
    
    private final ReportService reportService;
    
    // ============================================================
    // 1. DEAD STOCK REPORT ENDPOINT
    // ============================================================
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/reports/dead-stock?days=90
     * 
     * Lấy báo cáo hàng tồn không bán trong N ngày (mặc định 90 ngày)
     * 
     * Response:
     * {
     *   "success": true,
     *   "timestamp": "2025-04-06T10:30:45",
     *   "data": [
     *     {
     *       "productId": "...",
     *       "productName": "iPhone 13 Pro",
     *       "productCode": "A001",
     *       "daysSinceLastSale": 95,
     *       "stockQuantity": 5,
     *       "totalValue": 45000000,
     *       ...
     *     }
     *   ],
     *   "count": 5
     * }
     */
    @GetMapping("/dead-stock")
    public ResponseEntity<Map<String, Object>> getDeadStockReport(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "90") int days) {
        
        log.info("API: Getting dead stock report - workspaceId={}, days={}", workspaceId, days);
        
        try {
            if (days < 1) {
                log.warn("Invalid days parameter: {}", days);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Days parameter must be >= 1"
                ));
            }
            
            List<DeadStockDTO> deadStocks = reportService.getDeadStockReport(workspaceId, days);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            response.put("data", deadStocks);
            response.put("count", deadStocks.size());
            response.put("threshold_days", days);
            
            log.info("API: Dead stock report retrieved successfully - count={}", deadStocks.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("API: Error getting dead stock report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve dead stock report: " + e.getMessage()
            ));
        }
    }
    
    // ============================================================
    // 2. ABC ANALYSIS ENDPOINT
    // ============================================================
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/reports/abc-analysis
     * 
     * Phân tích ABC dựa trên doanh thu
     * 
     * Response:
     * {
     *   "success": true,
     *   "timestamp": "2025-04-06T10:30:45",
     *   "data": [
     *     {
     *       "productId": "...",
     *       "productName": "iPhone 13 Pro",
     *       "category": "A",
     *       "totalRevenue": 1500000000,
     *       "cumulativePercentage": 25.5,
     *       ...
     *     }
     *   ],
     *   "count": 150,
     *   "summary": {
     *     "category_A_count": 50,
     *     "category_B_count": 50,
     *     "category_C_count": 50
     *   }
     * }
     */
    @GetMapping("/abc-analysis")
    public ResponseEntity<Map<String, Object>> getABCAnalysis(
            @PathVariable String workspaceId) {
        
        log.info("API: Getting ABC analysis - workspaceId={}", workspaceId);
        
        try {
            List<ABCAnalysisDTO> abcList = reportService.getABCAnalysis(workspaceId);
            
            // Tính summary
            long countA = abcList.stream().filter(a -> "A".equals(a.getCategory())).count();
            long countB = abcList.stream().filter(a -> "B".equals(a.getCategory())).count();
            long countC = abcList.stream().filter(a -> "C".equals(a.getCategory())).count();
            
            Map<String, Long> summary = Map.of(
                "category_A_count", countA,
                "category_B_count", countB,
                "category_C_count", countC
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            response.put("data", abcList);
            response.put("count", abcList.size());
            response.put("summary", summary);
            
            log.info("API: ABC analysis retrieved successfully - count={}", abcList.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("API: Error getting ABC analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to retrieve ABC analysis: " + e.getMessage()
            ));
        }
    }
    
    // ============================================================
    // 3. EXPORT ENDPOINTS
    // ============================================================
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/reports/export/dead-stock?days=90
     * 
     * Xuất báo cáo Dead Stock ra file Excel
     * 
     * Response: File XLSX (.xlsx)
     * Content-Disposition: attachment; filename="dead-stock-report-2025-04-06.xlsx"
     */
    @GetMapping("/export/dead-stock")
    public ResponseEntity<byte[]> exportDeadStockToExcel(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "90") int days) {
        
        log.info("API: Exporting dead stock report - workspaceId={}, days={}", workspaceId, days);
        
        try {
            if (days < 1) {
                log.warn("Invalid days parameter: {}", days);
                return ResponseEntity.badRequest().build();
            }
            
            byte[] excelData = reportService.exportDeadStockToExcel(workspaceId, days);
            
            String fileName = String.format("dead-stock-report-%s.xlsx",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HHmmss")));
            
            log.info("API: Dead stock export completed - fileSize={} bytes", excelData.length);
            
            return ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(excelData);
                    
        } catch (IOException e) {
            log.error("API: Error exporting dead stock report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("API: Unexpected error exporting dead stock report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/reports/export/abc-analysis
     * 
     * Xuất báo cáo ABC Analysis ra file Excel
     * 
     * Response: File XLSX (.xlsx)
     * Content-Disposition: attachment; filename="abc-analysis-report-2025-04-06.xlsx"
     */
    @GetMapping("/export/abc-analysis")
    public ResponseEntity<byte[]> exportABCAnalysisToExcel(
            @PathVariable String workspaceId) {
        
        log.info("API: Exporting ABC analysis report - workspaceId={}", workspaceId);
        
        try {
            byte[] excelData = reportService.exportABCAnalysisToExcel(workspaceId);
            
            String fileName = String.format("abc-analysis-report-%s.xlsx",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HHmmss")));
            
            log.info("API: ABC analysis export completed - fileSize={} bytes", excelData.length);
            
            return ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(excelData);
                    
        } catch (IOException e) {
            log.error("API: Error exporting ABC analysis report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("API: Unexpected error exporting ABC analysis report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ============================================================
    // HEALTH CHECK
    // ============================================================
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/reports/health
     * 
     * Kiểm tra xem Report API có hoạt động không
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(
            @PathVariable String workspaceId) {
        
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Report API is healthy",
            "workspaceId", workspaceId,
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        ));
    }
}
