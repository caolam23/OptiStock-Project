package com.optistock.backend.controller;

import com.optistock.backend.dto.CreateVoucherRequest;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.service.ManagerVoucherService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ManagerVoucherController — nền móng GET endpoints.
 * Base URL: /api/v1/manager/vouchers
 * TODO: Thêm POST /, DELETE /{id} khi cần.
 */
@RestController
@RequestMapping("/api/v1/manager/vouchers")
public class ManagerVoucherController {

    @Autowired
    private ManagerVoucherService managerVoucherService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<?> getVouchers(
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId) {
        try {
            List<StockVoucher> list = managerVoucherService.getVouchers(validated(tenantId));
            return ResponseEntity.ok(list);
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucher(
            @PathVariable String id,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId) {
        try {
            return ResponseEntity.ok(managerVoucherService.getVoucher(validated(tenantId), id));
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/v1/manager/vouchers
     * Tạo phiếu nhập/xuất mới.
     */
    @PostMapping
    public ResponseEntity<?> createVoucher(
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateVoucherRequest req) {
        try {
            String userId = extractUserId(authHeader);
            StockVoucher created = managerVoucherService.createVoucher(validated(tenantId), userId, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi tạo phiếu: " + e.getMessage()));
        }
    }

    private String validated(String tenantId) {
        if (tenantId == null || tenantId.isBlank())
            throw new AuthException("Thiếu X-Workspace-Id header");
        return tenantId;
    }

    private String extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtils.getUserIdFromJwtToken(authHeader.substring(7));
        }
        return "unknown";
    }
}
