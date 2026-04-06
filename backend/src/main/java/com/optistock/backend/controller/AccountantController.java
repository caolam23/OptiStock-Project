package com.optistock.backend.controller;

import com.optistock.backend.dto.AccountantDashboardDTO;
import com.optistock.backend.security.WorkspaceRoleValidator;
import com.optistock.backend.service.AccountantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * AccountantController - API cho Accountant Dashboard
 * 
 * Base path: /api/v1/workspaces/{workspaceId}/accountant
 * 
 * Quyền truy cập: Chỉ ACCOUNTANT, MANAGER hoặc OWNER role trong workspace
 */
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/accountant")
@RequiredArgsConstructor
@Slf4j
public class AccountantController {
    
    private final AccountantService accountantService;
    private final WorkspaceRoleValidator roleValidator;
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/accountant/dashboard-summary
     * 
     * Lấy tổng quan tài chính cho Accountant Dashboard
     * 
     * Quyền cần thiết: ACCOUNTANT, MANAGER, hoặc OWNER role trong workspace
     * 
     * @param workspaceId - Workspace ID
     * @return ResponseEntity chứa dashboard data
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @PathVariable String workspaceId) {
        
        log.info("API: Getting accountant dashboard summary - workspaceId={}", workspaceId);
        
        try {
            // 1. Kiểm tra quyền workspace: user phải có role ACCOUNTANT, MANAGER, hoặc OWNER
            if (!roleValidator.hasWorkspaceRole(workspaceId, "ACCOUNTANT", "MANAGER", "OWNER")) {
                log.warn("API: Access denied for workspace {} - insufficient role", workspaceId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "Bạn không có quyền truy cập tổng quan tài chính của workspace này",
                        "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                ));
            }
            
            // 2. Gọi service để lấy dữ liệu
            AccountantDashboardDTO dashboard = accountantService.getDashboardSummary(workspaceId);
            
            // 3. Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            response.put("data", dashboard);
            response.put("workspace_id", workspaceId);
            
            log.info("API: Dashboard summary retrieved successfully");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("API: Invalid argument - {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid request: " + e.getMessage(),
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
            ));
            
        } catch (Exception e) {
            log.error("API: Error getting accountant dashboard summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to retrieve dashboard: " + e.getMessage(),
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
            ));
        }
    }
    
    /**
     * GET /api/v1/workspaces/{workspaceId}/accountant/health
     * 
     * Kiểm tra xem Accountant API có hoạt động không
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health(
            @PathVariable String workspaceId) {
        
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "Accountant API is healthy",
                "workspace_id", workspaceId,
                "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        ));
    }
}
