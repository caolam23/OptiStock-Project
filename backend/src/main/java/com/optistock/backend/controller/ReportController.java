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
 * ReportController: API endpoints cho báo cáo & phân tích (Hợp nhất từ 2 nhánh)
 * 
 * Base URL: /api/v1/workspaces/{workspaceId}/reports
 */
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/reports")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    // ============================================================
    // 1. DEAD STOCK REPORT (Sales history based - Từ feature/error)
    // ============================================================
    @GetMapping("/dead-stock")
    public ResponseEntity<Map<String, Object>> getDeadStockReport(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "90") int days) {
        log.info("API: Getting dead stock report - workspaceId={}, days={}", workspaceId, days);
        try {
            if (days < 1) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Days must be >= 1"));
            }
            List<DeadStockDTO> deadStocks = reportService.getDeadStockReport(workspaceId, days);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            response.put("data", deadStocks);
            response.put("count", deadStocks.size());
            response.put("threshold_days", days);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("API: Error getting dead stock report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================
    // 2. ABC ANALYSIS (Revenue based - Từ feature/error)
    // ============================================================
    @GetMapping("/abc-analysis")
    public ResponseEntity<Map<String, Object>> getABCAnalysis(@PathVariable String workspaceId) {
        log.info("API: Getting ABC analysis - workspaceId={}", workspaceId);
        try {
            List<ABCAnalysisDTO> abcList = reportService.getABCAnalysis(workspaceId);
            long countA = abcList.stream().filter(a -> "A".equals(a.getCategory())).count();
            long countB = abcList.stream().filter(a -> "B".equals(a.getCategory())).count();
            long countC = abcList.stream().filter(a -> "C".equals(a.getCategory())).count();
            Map<String, Long> summary = Map.of("category_A_count", countA, "category_B_count", countB,
                    "category_C_count", countC);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", abcList);
            response.put("count", abcList.size());
            response.put("summary", summary);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("API: Error getting ABC analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================
    // 3. EXPORT ENDPOINTS (Từ feature/error)
    // ============================================================
    @GetMapping("/export/dead-stock")
    public ResponseEntity<byte[]> exportDeadStockToExcel(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "90") int days) {
        try {
            byte[] excelData = reportService.exportDeadStockToExcel(workspaceId, days);
            String fileName = String.format("dead-stock-report-%s.xlsx",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HHmmss")));
            return ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(excelData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/abc-analysis")
    public ResponseEntity<byte[]> exportABCAnalysisToExcel(@PathVariable String workspaceId) {
        try {
            byte[] excelData = reportService.exportABCAnalysisToExcel(workspaceId);
            String fileName = String.format("abc-analysis-report-%s.xlsx",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HHmmss")));
            return ResponseEntity.status(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(excelData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================
    // HEALTH CHECK
    // ============================================================
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(@PathVariable String workspaceId) {
        return ResponseEntity.ok(Map.of("status", "OK", "workspaceId", workspaceId));
    }

    // ============================================================
    // COMMON REPORTS (Từ merge-lam-thanh)
    // ============================================================
    @GetMapping("/inventory-valuation")
    public ResponseEntity<?> getInventoryValuation(
            @PathVariable("workspaceId") String tenantId,
            @RequestParam(required = false, defaultValue = "ELECTRONICS") String industryType) {
        try {
            List<Map<String, Object>> data = reportService.getInventoryValuation(tenantId, industryType);
            return ResponseEntity.ok(Map.of("data", data, "total", data.size(), "status", "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/abc-inventory")
    public ResponseEntity<?> getAbcAnalysisInventory(
            @PathVariable("workspaceId") String tenantId,
            @RequestParam(required = false, defaultValue = "ELECTRONICS") String industryType) {
        try {
            List<Map<String, Object>> data = reportService.getAbcAnalysis(tenantId, industryType);
            return ResponseEntity.ok(Map.of("data", data, "total", data.size(), "status", "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/abc-summary")
    public ResponseEntity<?> getAbcSummary(
            @PathVariable("workspaceId") String tenantId,
            @RequestParam(required = false, defaultValue = "ELECTRONICS") String industryType) {
        try {
            Map<String, Object> summary = reportService.getAbcSummary(tenantId, industryType);
            return ResponseEntity.ok(Map.of("data", summary, "status", "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ============================================================
    // INDUSTRY-SPECIFIC REPORTS (Từ merge-lam-thanh)
    // ============================================================
    @GetMapping("/expiry-report")
    public ResponseEntity<?> getExpiryReport(@PathVariable("workspaceId") String tenantId) {
        try {
            List<Map<String, Object>> data = reportService.getExpiryReport(tenantId);
            return ResponseEntity.ok(Map.of("data", data, "total", data.size(), "status", "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/deadstock-report")
    public ResponseEntity<?> getDeadstockReport(@PathVariable("workspaceId") String tenantId) {
        try {
            List<Map<String, Object>> data = reportService.getDeadStockReport(tenantId);
            return ResponseEntity.ok(Map.of("data", data, "total", data.size(), "status", "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
