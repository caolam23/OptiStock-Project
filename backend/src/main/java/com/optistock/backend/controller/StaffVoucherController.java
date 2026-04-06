package com.optistock.backend.controller;

import com.optistock.backend.dto.StockVoucherDTO;
import com.optistock.backend.enums.WorkspaceRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.security.annotation.RequireWorkspaceRole;
import com.optistock.backend.service.StaffVoucherService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * StaffVoucherController: API cho chức năng nhập/xuất kho của nhân viên.
 *
 * Base URL: /api/v1/staff/vouchers
 *
 * Endpoints:
 * GET /pending/inbound → Danh sách phiếu nhập chờ
 * GET /pending/outbound → Danh sách phiếu xuất chờ
 * GET /{voucherId} → Chi tiết 1 phiếu
 * PUT /{voucherId}/start → Bắt đầu xử lý
 * PUT /{voucherId}/scan → Quét barcode (tăng quantityActual)
 * PUT /{voucherId}/update-item → Nhập số lượng thủ công
 * PUT /{voucherId}/complete → Hoàn tất phiếu
 *
 * Header: X-Workspace-Id (tenantId) — bắt buộc
 */
@RestController
@RequestMapping("/api/v1/staff/vouchers")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffVoucherController {

    @Autowired
    private StaffVoucherService staffVoucherService;

    @Autowired
    private JwtUtils jwtUtils;

    // ──────────────────────────────────────────────
    // GET /pending/inbound — Danh sách phiếu nhập chờ
    // ──────────────────────────────────────────────
     @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể xem danh sách phiếu nhập")
    @GetMapping("/pending/inbound")
    public ResponseEntity<?> getPendingInbound(
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            List<StockVoucherDTO> vouchers = staffVoucherService.getPendingInbound(resolvedTenantId);
            return ResponseEntity.ok(vouchers);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tải danh sách phiếu nhập: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // GET /pending/outbound — Danh sách phiếu xuất chờ
    // ──────────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể xem danh sách phiếu xuất")
    @GetMapping("/pending/outbound")
    public ResponseEntity<?> getPendingOutbound(
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            List<StockVoucherDTO> vouchers = staffVoucherService.getPendingOutbound(resolvedTenantId);
            return ResponseEntity.ok(vouchers);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tải danh sách phiếu xuất: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // GET /{voucherId} — Chi tiết phiếu
    // ──────────────────────────────────────────────
     @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể xem chi tiết phiếu")
    @GetMapping("/{voucherId}")
    public ResponseEntity<?> getVoucher(
            @PathVariable String voucherId,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            StockVoucherDTO dto = staffVoucherService.getVoucher(resolvedTenantId, voucherId);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tải chi tiết phiếu: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // PUT /{voucherId}/start — Bắt đầu xử lý phiếu
    // ──────────────────────────────────────────────
      @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể bắt đầu xử lý phiếu")
    @PutMapping("/{voucherId}/start")
    public ResponseEntity<?> startVoucher(
            @PathVariable String voucherId,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            String staffId = getUserId(authHeader);
            StockVoucherDTO dto = staffVoucherService.startVoucher(resolvedTenantId, voucherId, staffId);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi bắt đầu phiếu: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // PUT /{voucherId}/scan — Quét barcode
    // Body: { "barcode": "89300012", "quantity": 1 }
    // ──────────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể quét barcode")
    @PutMapping("/{voucherId}/scan")
    public ResponseEntity<?> scanBarcode(
            @PathVariable String voucherId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            String barcode = body.get("barcode") != null ? body.get("barcode").toString().trim() : null;
            int quantity = 1;
            if (body.containsKey("quantity") && body.get("quantity") instanceof Number) {
                quantity = ((Number) body.get("quantity")).intValue();
            }

            System.out.println("🔍 Scan barcode: '" + barcode + "' (length=" + (barcode != null ? barcode.length() : 0)
                    + ") quantity=" + quantity);

            if (barcode == null || barcode.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã barcode không được để trống"));
            }

            StockVoucherDTO dto = staffVoucherService.scanBarcode(resolvedTenantId, voucherId, barcode, quantity);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi xử lý barcode: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // PUT /{voucherId}/update-item — Nhập số lượng thủ công
    // Body: { "productCode": "89300012", "quantity": 10 }
    // ──────────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể cập nhật số lượng thủ công")
    @PutMapping("/{voucherId}/update-item")
    public ResponseEntity<?> updateItemManually(
            @PathVariable String voucherId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            String productCode = body.get("productCode") != null ? body.get("productCode").toString().trim() : null;
            int quantity = 0;
            if (body.containsKey("quantity") && body.get("quantity") instanceof Number) {
                quantity = ((Number) body.get("quantity")).intValue();
            }

            if (productCode == null || productCode.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã sản phẩm không được để trống"));
            }

            StockVoucherDTO dto = staffVoucherService.updateItemManually(resolvedTenantId, voucherId, productCode,
                    quantity);
            return ResponseEntity.ok(dto);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi cập nhật số lượng: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // PUT /{voucherId}/complete — Hoàn tất phiếu
    // ──────────────────────────────────────────────
    @RequireWorkspaceRole(value = { WorkspaceRole.STAFF, WorkspaceRole.MANAGER,
            WorkspaceRole.OWNER }, message = "Chỉ Nhân viên kho, Quản lý hoặc Chủ kho mới có thể hoàn tất phiếu")
    @PutMapping("/{voucherId}/complete")
    public ResponseEntity<?> completeVoucher(
            @PathVariable String voucherId,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String resolvedTenantId = resolveAndValidateTenant(tenantId, authHeader);
            String staffId = getUserId(authHeader);
            StockVoucherDTO dto = staffVoucherService.completeVoucher(resolvedTenantId, voucherId, staffId);
            return ResponseEntity.ok(Map.of(
                    "message", "Phiếu " + dto.getVoucherCode() + " đã hoàn tất!",
                    "voucher", dto));
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi hoàn tất phiếu: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────

    private String resolveAndValidateTenant(String tenantId, String authHeader) {
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
