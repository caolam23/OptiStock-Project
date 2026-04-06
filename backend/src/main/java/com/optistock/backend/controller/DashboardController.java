package com.optistock.backend.controller;

import com.optistock.backend.dto.DashboardSummaryDTO;
import com.optistock.backend.dto.DashboardAlertDTO;
import com.optistock.backend.dto.DashboardChartDTO;
import com.optistock.backend.service.DashboardService;
import com.optistock.backend.service.TenantService;
import com.optistock.backend.model.Tenant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * DashboardController: API endpoints cho trang Dashboard
 * 
 * Phục vụ cả 2 ngành hàng: ELECTRONICS và GROCERY
 * Dữ liệu phụ thuộc vào industryType trong Tenant settings
 * 
 * Base URL: /api/v1/workspaces/{tenantId}/dashboard
 */
@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private TenantService tenantService;

    /**
     * GET /api/v1/workspaces/{tenantId}/dashboard/summary
     * 
     * Lấy dữ liệu tổng quan cho Dashboard
     * 
     * Response: 200 OK
     * {
     *   "data": {
     *     "totalInventoryValue": 125000000.50,  // VNĐ
     *     "totalActiveSkus": 245,                // Số SKU
     *     "pendingVouchers": 12,                 // Phiếu chờ xử lý
     *     "totalProducts": 320,
     *     "outOfStockProducts": 45
     *   },
     *   "message": "Success",
     *   "status": "SUCCESS"
     * }
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
        @PathVariable String tenantId
    ) {
        try {
            log.info("GET /dashboard/summary for tenantId: {}", tenantId);

            DashboardSummaryDTO summary = dashboardService.getSummary(tenantId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", summary);
            response.put("message", "Summary data retrieved successfully");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting dashboard summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", e.getMessage(),
                    "status", "ERROR"
                ));
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/dashboard/alerts
     * 
     * Lấy danh sách cảnh báo cho Dashboard
     * 
     * Cảnh báo chung:
     * - Top 5 sản phẩm dưới minStock (Hết hàng)
     * 
     * Cảnh báo GROCERY (nếu industryType == GROCERY):
     * - Top 5 lô hàng sắp hết hạn trong 30 ngày
     * 
     * Response: 200 OK
     * {
     *   "data": {
     *     "lowStockProducts": [
     *       {
     *         "productId": "...",
     *         "productCode": "SKU-001",
     *         "productName": "Nước ngọt Coca 500ml",
     *         "category": "Đồ uống",
     *         "currentStock": 5,
     *         "minStock": 50,
     *         "stockDeficit": 45,
     *         "cost": 5000.0,
     *         "mainUnit": "Thùng"
     *       }
     *     ],
     *     "expiringBatches": [  // Chỉ có nếu GROCERY
     *       {
     *         "productId": "...",
     *         "productCode": "SKU-002",
     *         "productName": "Kem khử mùi",
     *         "batchCode": "CP-20240101-001",
     *         "expiryDate": "2024-02-15T00:00:00",
     *         "daysRemaining": 12,
     *         "quantity": 100,
     *         "alertLevel": "HIGH"
     *       }
     *     ],
     *     "totalLowStockCount": 32,
     *     "totalExpiringBatchCount": 8
     *   },
     *   "message": "Alerts retrieved successfully",
     *   "status": "SUCCESS"
     * }
     */
    @GetMapping("/alerts")
    public ResponseEntity<?> getAlerts(
        @PathVariable String tenantId
    ) {
        try {
            log.info("GET /dashboard/alerts for tenantId: {}", tenantId);

            // Lấy industryType từ Tenant
            Tenant tenant = tenantService.getTenantEntityByTenantId(tenantId);
            String industryType = tenant != null ? tenant.getIndustryCode() : "ELECTRONICS";

            DashboardAlertDTO alerts = dashboardService.getAlerts(tenantId, industryType);

            Map<String, Object> response = new HashMap<>();
            response.put("data", alerts);
            response.put("message", "Alerts retrieved successfully");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting dashboard alerts: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", e.getMessage(),
                    "status", "ERROR"
                ));
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/dashboard/charts
     * 
     * Lấy dữ liệu biểu đồ cho Dashboard
     * 
     * Bao gồm:
     * 1. Biểu đồ cột: Nhập/Xuất 7 ngày gần nhất (Bar Chart)
     * 2. Biểu đồ tròn: Cơ cấu tồn kho theo danh mục (Pie Chart)
     * 
     * Response: 200 OK
     * {
     *   "data": {
     *     "sevenDayInOutChart": [
     *       {
     *         "date": "2024-01-10",
     *         "inboundQuantity": 250,
     *         "outboundQuantity": 180,
     *         "inboundValue": 12500000.0,
     *         "outboundValue": 9000000.0
     *       }
     *     ],
     *     "inventoryByCategory": [
     *       {
     *         "category": "Điện thoại",
     *         "value": 850000000.0,  // Giá trị tồn kho
     *         "quantity": 450,       // Số lượng
     *         "percentage": 65.38    // %
     *       }
     *     ]
     *   },
     *   "message": "Chart data retrieved successfully",
     *   "status": "SUCCESS"
     * }
     */
    @GetMapping("/charts")
    public ResponseEntity<?> getCharts(
        @PathVariable String tenantId
    ) {
        try {
            log.info("GET /dashboard/charts for tenantId: {}", tenantId);

            DashboardChartDTO charts = dashboardService.getCharts(tenantId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", charts);
            response.put("message", "Chart data retrieved successfully");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting dashboard charts: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", e.getMessage(),
                    "status", "ERROR"
                ));
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/dashboard
     * 
     * Endpoint tổng hợp: lấy tất cả dữ liệu Dashboard 1 lần
     * (Tối ưu hóa: thay vì gọi 3 endpoint riêng lẻ, client gọi 1 endpoint này)
     * 
     * Response: 200 OK
     * {
     *   "data": {
     *     "summary": { ... },
     *     "alerts": { ... },
     *     "charts": { ... }
     *   },
     *   "message": "Dashboard data retrieved successfully",
     *   "status": "SUCCESS"
     * }
     */
    @GetMapping
    public ResponseEntity<?> getDashboard(
        @PathVariable String tenantId
    ) {
        try {
            log.info("GET /dashboard (complete) for tenantId: {}", tenantId);

            // Lấy industryType từ Tenant
            Tenant tenant = tenantService.getTenantEntityByTenantId(tenantId);
            String industryType = tenant != null ? tenant.getIndustryCode() : "ELECTRONICS";

            // Fetch all data in parallel (Spring will handle it)
            DashboardSummaryDTO summary = dashboardService.getSummary(tenantId);
            DashboardAlertDTO alerts = dashboardService.getAlerts(tenantId, industryType);
            DashboardChartDTO charts = dashboardService.getCharts(tenantId);

            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("summary", summary);
            dashboardData.put("alerts", alerts);
            dashboardData.put("charts", charts);

            Map<String, Object> response = new HashMap<>();
            response.put("data", dashboardData);
            response.put("message", "Dashboard data retrieved successfully");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting complete dashboard: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", e.getMessage(),
                    "status", "ERROR"
                ));
        }
    }
}
