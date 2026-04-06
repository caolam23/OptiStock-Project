package com.optistock.backend.controller;

import com.optistock.backend.model.Debt;
import com.optistock.backend.model.FinancialReport;
import com.optistock.backend.service.FinanceService;
import com.optistock.backend.dto.DashboardMetricsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * FinanceController — API endpoints quản lý tài chính & công nợ
 */
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/finance")
@CrossOrigin(origins = "http://localhost:5173")
public class FinanceController {

    private static final Logger log = LoggerFactory.getLogger(FinanceController.class);

    @Autowired
    private FinanceService financeService;

    // ==================== Dashboard ====================

    /**
     * GET /api/v1/workspaces/{workspaceId}/finance/dashboard
     * Lấy các chỉ số tài chính cho dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable String workspaceId) {
        try {
            DashboardMetricsDTO metrics = financeService.getDashboardMetrics(workspaceId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", metrics);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting dashboard metrics: ", ex);
            return buildErrorResponse(ex);
        }
    }

    // ==================== Debt Management ====================

    /**
     * GET /api/v1/workspaces/{workspaceId}/finance/debts
     * Lấy danh sách tất cả công nợ
     */
    @GetMapping("/debts")
    public ResponseEntity<?> getAllDebts(@PathVariable String workspaceId) {
        try {
            List<Debt> debts = financeService.getAllDebts(workspaceId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", debts);
            response.put("total", debts.size());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting debts: ", ex);
            return buildErrorResponse(ex);
        }
    }

    /**
     * GET /api/v1/workspaces/{workspaceId}/finance/debts/type/{type}
     * Lấy công nợ theo loại (PAYABLE hoặc RECEIVABLE)
     */
    @GetMapping("/debts/type/{type}")
    public ResponseEntity<?> getDebtsByType(
            @PathVariable String workspaceId,
            @PathVariable String type
    ) {
        try {
            Debt.DebtType debtType = Debt.DebtType.valueOf(type.toUpperCase());
            List<Debt> debts = financeService.getDebtsByType(workspaceId, debtType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", debts);
            response.put("total", debts.size());
            response.put("type", type);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Loại công nợ không hợp lệ. Vui lòng dùng PAYABLE hoặc RECEIVABLE");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception ex) {
            log.error("Error getting debts by type: ", ex);
            return buildErrorResponse(ex);
        }
    }

    /**
     * POST /api/v1/workspaces/{workspaceId}/finance/debts
     * Tạo công nợ mới
     */
    @PostMapping("/debts")
    public ResponseEntity<?> createDebt(
            @PathVariable String workspaceId,
            @RequestBody Debt debt
    ) {
        try {
            if (debt.getPartnerId() == null || debt.getPartnerId().trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Partner ID không được để trống");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (debt.getTotalDebt() == null || debt.getTotalDebt().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Tổng tiền công nợ phải lớn hơn 0");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (debt.getCreditLimit() == null || debt.getCreditLimit().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Hạn mức tín dụng phải lớn hơn 0");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Debt createdDebt = financeService.createOrUpdateDebt(workspaceId, debt);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Công nợ được tạo thành công");
            response.put("data", createdDebt);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            log.error("Error creating debt: ", ex);
            return buildErrorResponse(ex);
        }
    }

    /**
     * PUT /api/v1/workspaces/{workspaceId}/finance/debts/{debtId}
     * Cập nhật công nợ
     */
    @PutMapping("/debts/{debtId}")
    public ResponseEntity<?> updateDebt(
            @PathVariable String workspaceId,
            @PathVariable String debtId,
            @RequestBody Debt debtUpdates
    ) {
        try {
            debtUpdates.setId(debtId);
            Debt updatedDebt = financeService.createOrUpdateDebt(workspaceId, debtUpdates);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Công nợ được cập nhật thành công");
            response.put("data", updatedDebt);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error updating debt: ", ex);
            return buildErrorResponse(ex);
        }
    }

    /**
     * POST /api/v1/workspaces/{workspaceId}/finance/debts/{debtId}/pay
     * Thanh toán một phần công nợ
     */
    @PostMapping("/debts/{debtId}/pay")
    public ResponseEntity<?> payDebt(
            @PathVariable String workspaceId,
            @PathVariable String debtId,
            @RequestParam BigDecimal amount
    ) {
        try {
            Debt paidDebt = financeService.payDebt(workspaceId, debtId, amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thanh toán công nợ thành công");
            response.put("data", paidDebt);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception ex) {
            log.error("Error paying debt: ", ex);
            return buildErrorResponse(ex);
        }
    }

    /**
     * DELETE /api/v1/workspaces/{workspaceId}/finance/debts/{debtId}
     * Xóa công nợ (soft delete)
     */
    @DeleteMapping("/debts/{debtId}")
    public ResponseEntity<?> deleteDebt(
            @PathVariable String workspaceId,
            @PathVariable String debtId
    ) {
        try {
            financeService.deleteDebt(workspaceId, debtId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Công nợ được xóa thành công");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception ex) {
            log.error("Error deleting debt: ", ex);
            return buildErrorResponse(ex);
        }
    }

    // ==================== Credit Limit Check ====================

    /**
     * POST /api/v1/workspaces/{workspaceId}/finance/check-credit-limit
     * Kiểm tra hạn mức tín dụng trước khi tạo đơn hàng
     * Request body: { "partnerId": "...", "orderValue": 10000 }
     */
    @PostMapping("/check-credit-limit")
    public ResponseEntity<?> checkCreditLimit(
            @PathVariable String workspaceId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            String partnerId = (String) request.get("partnerId");
            BigDecimal orderValue = new BigDecimal(request.get("orderValue").toString());
            
            financeService.checkCreditLimit(workspaceId, partnerId, orderValue);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đơn hàng nằm trong hạn mức tín dụng cho phép");
            return ResponseEntity.ok(response);
        } catch (com.optistock.backend.exception.CreditLimitException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("errorCode", ex.getErrorCode());
            response.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception ex) {
            log.error("Error checking credit limit: ", ex);
            return buildErrorResponse(ex);
        }
    }

    // ==================== Financial Report ====================

    /**
     * GET /api/v1/workspaces/{workspaceId}/finance/report/latest
     * Lấy báo cáo tài chính gần nhất
     */
    @GetMapping("/report/latest")
    public ResponseEntity<?> getLatestReport(@PathVariable String workspaceId) {
        try {
            FinancialReport report = financeService.getLatestReport(workspaceId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", report);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting latest report: ", ex);
            return buildErrorResponse(ex);
        }
    }

    /**
     * POST /api/v1/workspaces/{workspaceId}/finance/report/generate
     * Tạo hoặc cập nhật báo cáo tài chính cho ngày hôm nay
     */
    @PostMapping("/report/generate")
    public ResponseEntity<?> generateDailyReport(@PathVariable String workspaceId) {
        try {
            FinancialReport report = financeService.generateOrUpdateDailyReport(workspaceId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Báo cáo tài chính được tạo thành công");
            response.put("data", report);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            log.error("Error generating report: ", ex);
            return buildErrorResponse(ex);
        }
    }

    // ==================== Error Handling ====================
    
    private ResponseEntity<?> buildErrorResponse(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage() != null ? ex.getMessage() : "Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
