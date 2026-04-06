package com.optistock.backend.controller;

import com.optistock.backend.dto.CreateStocktakeRequest;
import com.optistock.backend.model.StocktakeTicket;
import com.optistock.backend.service.StocktakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * StocktakeController: API endpoints cho module Kiểm kê kho
 * 
 * Hỗ trợ 2 ngành hàng: ELECTRONICS và GROCERY
 * 
 * Base URL: /api/v1/workspaces/{tenantId}/stocktakes
 */
@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/stocktakes")
@CrossOrigin(origins = "http://localhost:5173")
public class StocktakeController {

    private static final Logger log = LoggerFactory.getLogger(StocktakeController.class);

    @Autowired
    private StocktakeService stocktakeService;

    // ==================== GET ENDPOINTS ====================

    /**
     * GET /api/v1/workspaces/{tenantId}/stocktakes
     * 
     * Lấy danh sách phiếu kiểm kê theo ngành hàng
     * 
     * Query params:
     * - industryType: "ELECTRONICS" hoặc "GROCERY"
     * - status: "PENDING", "COUNTING", "REVIEWING", "COMPLETED"
     */
    @GetMapping
    public ResponseEntity<?> getStocktakes(
        @PathVariable String tenantId,
        @RequestParam(required = false) String industryType,
        @RequestParam(required = false) String status
    ) {
        try {
            log.info("GET /stocktakes - tenantId: {}, industryType: {}, status: {}", 
                tenantId, industryType, status);

            List<StocktakeTicket> tickets;

            if (industryType != null) {
                tickets = stocktakeService.getStocktakesByIndustry(tenantId, industryType);
            } else if (status != null) {
                tickets = stocktakeService.getStocktakesByStatus(tenantId, status);
            } else {
                // TODO: Implement getAllByTenant method
                tickets = List.of();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("data", tickets);
            response.put("total", tickets.size());
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Lỗi lấy danh sách phiếu:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/stocktakes/{ticketId}
     * 
     * Lấy chi tiết phiếu kiểm kê
     */
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getStocktakeDetail(
        @PathVariable String tenantId,
        @PathVariable String ticketId
    ) {
        try {
            log.info("GET /stocktakes/{} - tenantId: {}", ticketId, tenantId);

            StocktakeTicket ticket = stocktakeService.getStocktakeById(tenantId, ticketId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", ticket);
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Lỗi lấy chi tiết phiếu:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    // ==================== POST ENDPOINTS ====================

    /**
     * POST /api/v1/workspaces/{tenantId}/stocktakes
     * 
     * Tạo phiếu kiểm kê mới
     * 
     * Request body:
     * {
     *   "title": "Kiểm kê kho A4",
     *   "industryType": "ELECTRONICS",
     *   "locationId": "location-001",
     *   "locationName": "Kho A - Tầng 1",
     *   "assignedTo": "staff-001"
     * }
     */
    @PostMapping
    public ResponseEntity<?> createStocktake(
        @PathVariable String tenantId,
        @RequestBody CreateStocktakeRequest req
    ) {
        try {
            log.info("POST /stocktakes - Tạo phiếu: {}", req.getTitle());

            StocktakeTicket ticket = stocktakeService.createStocktake(tenantId, req);

            Map<String, Object> response = new HashMap<>();
            response.put("data", ticket);
            response.put("message", "Tạo phiếu kiểm kê thành công");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Lỗi tạo phiếu:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    // ==================== PUT ENDPOINTS ====================

    /**
     * PUT /api/v1/workspaces/{tenantId}/stocktakes/{ticketId}/items/{itemProductId}
     * 
     * Cập nhật số lượng thực tế của một sản phẩm
     * 
     * Request body:
     * {
     *   "actualQty": 45
     * }
     */
    @PutMapping("/{ticketId}/items/{itemProductId}")
    public ResponseEntity<?> updateItemCount(
        @PathVariable String tenantId,
        @PathVariable String ticketId,
        @PathVariable String itemProductId,
        @RequestBody Map<String, Integer> req
    ) {
        try {
            Integer actualQty = req.get("actualQty");
            log.info("PUT /stocktakes/{}/items/{} - Cập nhật số đếm: {}", 
                ticketId, itemProductId, actualQty);

            StocktakeTicket updated = stocktakeService.updateItemCount(
                tenantId, ticketId, itemProductId, actualQty
            );

            Map<String, Object> response = new HashMap<>();
            response.put("data", updated);
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Lỗi cập nhật số lượng:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    /**
     * PUT /api/v1/workspaces/{tenantId}/stocktakes/{ticketId}/submit
     * 
     * Gửi phiếu duyệt (COUNTING → REVIEWING)
     */
    @PutMapping("/{ticketId}/submit")
    public ResponseEntity<?> submitStocktake(
        @PathVariable String tenantId,
        @PathVariable String ticketId
    ) {
        try {
            log.info("PUT /stocktakes/{}/submit", ticketId);

            StocktakeTicket updated = stocktakeService.submitStocktake(tenantId, ticketId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", updated);
            response.put("message", "Gửi duyệt phiếu thành công");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Lỗi gửi duyệt:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }

    /**
     * PUT /api/v1/workspaces/{tenantId}/stocktakes/{ticketId}/approve
     * 
     * Duyệt phiếu (REVIEWING → COMPLETED)
     */
    @PutMapping("/{ticketId}/approve")
    public ResponseEntity<?> approveStocktake(
        @PathVariable String tenantId,
        @PathVariable String ticketId
    ) {
        try {
            log.info("PUT /stocktakes/{}/approve", ticketId);

            StocktakeTicket updated = stocktakeService.approveStocktake(tenantId, ticketId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", updated);
            response.put("message", "Duyệt phiếu thành công");
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Lỗi duyệt phiếu:", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "status", "ERROR"));
        }
    }
}
