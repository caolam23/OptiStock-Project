package com.optistock.backend.controller;

import com.optistock.backend.dto.StocktakeTicketDTO;
import com.optistock.backend.enums.WorkspaceRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.security.annotation.RequireWorkspaceRole;
import com.optistock.backend.service.StaffStocktakeService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * StaffStocktakeController: API cho chức năng kiểm kê của nhân viên.
 *
 * Base URL: /api/v1/staff/stocktakes
 *
 * Endpoints:
 * GET /pending → Danh sách phiếu kiểm kê chờ (dashboard cột 3)
 * GET /{ticketId} → Chi tiết phiếu (items ẨN systemQuantity)
 * PUT /{ticketId}/start → Bắt đầu kiểm kê
 * PUT /{ticketId}/count → Nhập số lượng thực tế cho 1 item
 * PUT /{ticketId}/submit → Gửi báo cáo kiểm kê
 *
 * Header: X-Workspace-Id (tenantId) — bắt buộc
 */
@RestController
@RequestMapping("/api/v1/staff/stocktakes")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffStocktakeController {

    @Autowired
    private StaffStocktakeService staffStocktakeService;

    @Autowired
    private JwtUtils jwtUtils;

    // ──────────────────────────────────────────
    // GET /pending — Danh sách phiếu kiểm kê chờ
    // ──────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể xem danh sách phiếu kiểm kê")
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingTickets(
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = validateTenant(tenantId);
            List<StocktakeTicketDTO> tickets = staffStocktakeService.getPendingTickets(resolvedTenantId);
            return ResponseEntity.ok(tickets);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tải danh sách phiếu kiểm kê: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────
    // GET /{ticketId} — Chi tiết phiếu kiểm kê
    // ──────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể xem chi tiết phiếu kiểm kê")
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = validateTenant(tenantId);
            StocktakeTicketDTO dto = staffStocktakeService.getTicket(resolvedTenantId, ticketId);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tải chi tiết phiếu: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────
    // PUT /{ticketId}/start — Bắt đầu kiểm kê
    // ──────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể bắt đầu kiểm kê")
    @PutMapping("/{ticketId}/start")
    public ResponseEntity<?> startTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = validateTenant(tenantId);
            String staffId = getUserId(authHeader);
            StocktakeTicketDTO dto = staffStocktakeService.startTicket(resolvedTenantId, ticketId, staffId);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi bắt đầu kiểm kê: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────
    // PUT /{ticketId}/count — Nhập số lượng thực tế
    // Body: { "productCode": "SP-001", "actualCount": 15 }
    // ──────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể nhập số lượng kiểm kê")
    @PutMapping("/{ticketId}/count")
    public ResponseEntity<?> updateCount(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = validateTenant(tenantId);
            String productCode = (String) body.get("productCode");
            int actualCount = (int) body.get("actualCount");

            if (productCode == null || productCode.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu productCode"));
            }

            StocktakeTicketDTO dto = staffStocktakeService.updateCount(resolvedTenantId, ticketId, productCode,
                    actualCount);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi cập nhật số lượng: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────
    // PUT /{ticketId}/submit — Gửi báo cáo kiểm kê
    // ──────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể gửi báo cáo kiểm kê")
    @PutMapping("/{ticketId}/submit")
    public ResponseEntity<?> submitTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = validateTenant(tenantId);
            String staffId = getUserId(authHeader);
            StocktakeTicketDTO dto = staffStocktakeService.submitTicket(resolvedTenantId, ticketId, staffId);
            return ResponseEntity.ok(Map.of(
                    "message", "Báo cáo kiểm kê " + dto.getTicketCode() + " đã được gửi thành công!",
                    "ticket", dto));
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi gửi báo cáo: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────

    private String validateTenant(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new AuthException("Thiếu X-Workspace-Id header. Vui lòng chọn kho làm việc.");
        }
        return tenantId;
    }

    private String getUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                return jwtUtils.getUserIdFromJwtToken(authHeader.substring(7));
            } catch (Exception ignored) {
            }
        }
        return "unknown";
    }
}
