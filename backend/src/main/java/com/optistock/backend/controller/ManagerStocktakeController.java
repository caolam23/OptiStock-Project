package com.optistock.backend.controller;

import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.StocktakeTicket;
import com.optistock.backend.service.ManagerStocktakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ManagerStocktakeController — nền móng GET endpoints.
 * Base URL: /api/v1/manager/stocktakes
 * TODO: Thêm POST /, DELETE /{id} khi cần.
 */
@RestController
@RequestMapping("/api/v1/manager/stocktakes")
public class ManagerStocktakeController {

    @Autowired
    private ManagerStocktakeService managerStocktakeService;

    @GetMapping
    public ResponseEntity<?> getTickets(
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId) {
        try {
            List<StocktakeTicket> list = managerStocktakeService.getTickets(validated(tenantId));
            return ResponseEntity.ok(list);
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(
            @PathVariable String id,
            @RequestHeader(value = "X-Workspace-Id", required = false) String tenantId) {
        try {
            return ResponseEntity.ok(managerStocktakeService.getTicket(validated(tenantId), id));
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private String validated(String tenantId) {
        if (tenantId == null || tenantId.isBlank())
            throw new AuthException("Thiếu X-Workspace-Id header");
        return tenantId;
    }
}
