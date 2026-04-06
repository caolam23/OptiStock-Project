package com.optistock.backend.service;

import com.optistock.backend.model.Debt;
import com.optistock.backend.model.FinancialReport;
import com.optistock.backend.model.Product;
import com.optistock.backend.repository.DebtRepository;
import com.optistock.backend.repository.FinancialReportRepository;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.dto.DashboardMetricsDTO;
import com.optistock.backend.exception.CreditLimitException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * FinanceService — Dịch vụ quản lý tài chính
 */
@Service
public class FinanceService {
    
    private static final Logger log = LoggerFactory.getLogger(FinanceService.class);
    
    @Autowired
    private DebtRepository debtRepository;
    
    @Autowired
    private FinancialReportRepository financialReportRepository;
    
    @Autowired
    private ProductRepository productRepository;

    // ==================== Dashboard ====================
    
    /**
     * Lấy các chỉ số tài chính cho dashboard
     * @param workspaceId ID workspace/tenant
     * @return DashboardMetricsDTO chứa tổng quan tài chính
     */
    public DashboardMetricsDTO getDashboardMetrics(String workspaceId) {
        validateWorkspace(workspaceId);
        
        // Tính tổng giá trị tồn kho (WAC)
        BigDecimal totalInventoryValue = calculateTotalInventoryValue(workspaceId);
        
        // Tính tổng nợ phải trả (PAYABLE)
        BigDecimal totalAccountsPayable = calculateTotalDebt(workspaceId, Debt.DebtType.PAYABLE);
        
        // Tính tổng nợ phải thu (RECEIVABLE)
        BigDecimal totalAccountsReceivable = calculateTotalDebt(workspaceId, Debt.DebtType.RECEIVABLE);
        
        // Lấy báo cáo ngày hôm nay
        FinancialReport report = financialReportRepository
                .findByTenantIdAndReportDateAndIsActiveTrue(workspaceId, LocalDate.now())
                .orElse(new FinancialReport());
        
        // Đếm công nợ quá hạn
        Integer overdueDebts = (int) debtRepository
                .countByTenantIdAndStatusAndIsActiveTrue(workspaceId, Debt.DebtStatus.OVERDUE);
        
        // Đếm công nợ đang hoạt động
        List<Debt> activeDebts = debtRepository
                .findByTenantIdAndStatusAndIsActiveTrue(workspaceId, Debt.DebtStatus.ACTIVE);
        Integer totalActiveDebts = activeDebts.size();
        
        return new DashboardMetricsDTO(
                totalInventoryValue,
                totalAccountsPayable,
                totalAccountsReceivable,
                report.getDailyRevenue(),
                report.getDailyProfit(),
                overdueDebts,
                totalActiveDebts
        );
    }

    // ==================== Debt Management ====================
    
    /**
     * Kiểm tra hạn mức tín dụng trước khi tạo đơn hàng
     * @param partnerId ID đối tác
     * @param newOrderValue Giá trị đơn hàng mới
     * @throws CreditLimitException nếu vượt hạn mức
     */
    public void checkCreditLimit(String workspaceId, String partnerId, BigDecimal newOrderValue) {
        validateWorkspace(workspaceId);
        
        if (partnerId == null || partnerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Partner ID không được để trống");
        }
        
        if (newOrderValue == null || newOrderValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị đơn hàng phải lớn hơn 0");
        }
        
        // Tìm công nợ hiện tại của đối tác (nợ phải trả)
        Optional<Debt> optionalDebt = debtRepository
                .findByTenantIdAndPartnerIdAndTypeAndIsActiveTrue(
                        workspaceId,
                        partnerId,
                        Debt.DebtType.PAYABLE
                );
        
        if (optionalDebt.isPresent()) {
            Debt debt = optionalDebt.get();
            BigDecimal projectedDebt = debt.getBalance().add(newOrderValue);
            
            if (projectedDebt.compareTo(debt.getCreditLimit()) > 0) {
                String errorMsg = String.format(
                        "Vượt hạn mức tín dụng. Dư nợ hiện tại: %s, Đơn hàng mới: %s, Hạn mức: %s",
                        debt.getBalance(),
                        newOrderValue,
                        debt.getCreditLimit()
                );
                throw new CreditLimitException(errorMsg);
            }
        }
    }

    /**
     * Tạo hoặc cập nhật công nợ
     */
    public Debt createOrUpdateDebt(String workspaceId, Debt debt) {
        validateWorkspace(workspaceId);
        debt.setTenantId(workspaceId);
        debt.updateBalance();
        return debtRepository.save(debt);
    }

    /**
     * Lấy tất cả công nợ của workspace
     */
    public List<Debt> getAllDebts(String workspaceId) {
        validateWorkspace(workspaceId);
        return debtRepository.findByTenantIdAndIsActiveTrue(workspaceId);
    }

    /**
     * Lấy công nợ theo loại (PAYABLE hoặc RECEIVABLE)
     */
    public List<Debt> getDebtsByType(String workspaceId, Debt.DebtType type) {
        validateWorkspace(workspaceId);
        return debtRepository.findByTenantIdAndTypeAndIsActiveTrue(workspaceId, type);
    }

    /**
     * Thanh toán công nợ
     */
    public Debt payDebt(String workspaceId, String debtId, BigDecimal paymentAmount) {
        validateWorkspace(workspaceId);
        
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền thanh toán phải lớn hơn 0");
        }
        
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new IllegalArgumentException("Công nợ không tồn tại"));
        
        if (!debt.getTenantId().equals(workspaceId)) {
            throw new IllegalArgumentException("Không có quyền thanh toán công nợ này");
        }
        
        BigDecimal newPaidAmount = debt.getPaidAmount().add(paymentAmount);
        if (newPaidAmount.compareTo(debt.getTotalDebt()) > 0) {
            newPaidAmount = debt.getTotalDebt();
        }
        
        debt.setPaidAmount(newPaidAmount);
        debt.updateBalance();
        
        return debtRepository.save(debt);
    }

    /**
     * Xóa công nợ (soft delete)
     */
    public void deleteDebt(String workspaceId, String debtId) {
        validateWorkspace(workspaceId);
        
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new IllegalArgumentException("Công nợ không tồn tại"));
        
        if (!debt.getTenantId().equals(workspaceId)) {
            throw new IllegalArgumentException("Không có quyền xóa công nợ này");
        }
        
        debt.setIsActive(false);
        debtRepository.save(debt);
    }

    // ==================== Financial Report ====================
    
    /**
     * Tạo hoặc cập nhật báo cáo tài chính cho ngày hôm nay
     */
    public FinancialReport generateOrUpdateDailyReport(String workspaceId) {
        validateWorkspace(workspaceId);
        
        LocalDate today = LocalDate.now();
        FinancialReport report = financialReportRepository
                .findByTenantIdAndReportDateAndIsActiveTrue(workspaceId, today)
                .orElse(new FinancialReport());
        
        report.setTenantId(workspaceId);
        report.setReportDate(today);
        report.setTotalInventoryValue(calculateTotalInventoryValue(workspaceId));
        report.setTotalAccountsPayable(calculateTotalDebt(workspaceId, Debt.DebtType.PAYABLE));
        report.setTotalAccountsReceivable(calculateTotalDebt(workspaceId, Debt.DebtType.RECEIVABLE));
        
        List<Product> products = productRepository.findByTenantIdAndIsActiveTrue(workspaceId);
        report.setTotalProducts(products.size());
        
        List<Debt> overdueDebts = debtRepository
                .findByTenantIdAndStatusAndIsActiveTrue(workspaceId, Debt.DebtStatus.OVERDUE);
        report.setOverdueDebts(overdueDebts.size());
        
        return financialReportRepository.save(report);
    }

    /**
     * Lấy báo cáo tài chính gần nhất
     */
    public FinancialReport getLatestReport(String workspaceId) {
        validateWorkspace(workspaceId);
        
        return financialReportRepository
                .findFirstByTenantIdAndIsActiveTrueOrderByReportDateDesc(workspaceId)
                .orElse(new FinancialReport());
    }

    // ==================== Helper Methods ====================
    
    /**
     * Tính tổng giá trị tồn kho (WAC - Weighted Average Cost)
     */
    private BigDecimal calculateTotalInventoryValue(String workspaceId) {
        List<Product> products = productRepository.findByTenantIdAndIsActiveTrue(workspaceId);
        
        return products.stream()
                .map(product -> {
                    BigDecimal cost = product.getCost() != null
                            ? BigDecimal.valueOf(product.getCost())
                            : BigDecimal.ZERO;
                    BigDecimal quantity = BigDecimal.valueOf(product.getCurrentStock() != null ? product.getCurrentStock() : 0);
                    return cost.multiply(quantity);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Tính tổng công nợ theo loại
     */
    private BigDecimal calculateTotalDebt(String workspaceId, Debt.DebtType type) {
        List<Debt> debts = debtRepository.findByTenantIdAndTypeAndIsActiveTrue(workspaceId, type);
        
        return debts.stream()
                .map(Debt::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Validate workspace ID
     */
    private void validateWorkspace(String workspaceId) {
        if (workspaceId == null || workspaceId.trim().isEmpty()) {
            throw new IllegalArgumentException("Workspace ID không được để trống");
        }
    }
}
