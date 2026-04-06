package com.optistock.backend.controller;

import com.optistock.backend.dto.SaleDashboardStatsDTO;
import com.optistock.backend.service.SalesOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sale")
public class SaleDashboardController {

    @Autowired
    private SalesOrderService salesOrderService;

    /**
     * API lấy thống kê tổng quan cho Sale Dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<SaleDashboardStatsDTO> getSaleDashboardStats(
            @RequestHeader(value = "X-Workspace-Id", required = true) String tenantId) {

        SaleDashboardStatsDTO stats = salesOrderService.getSaleDashboardStats(tenantId);
        return ResponseEntity.ok(stats);
    }
}
