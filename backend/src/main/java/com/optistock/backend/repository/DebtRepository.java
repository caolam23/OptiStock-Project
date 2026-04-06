package com.optistock.backend.repository;

import com.optistock.backend.model.Debt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * DebtRepository — CRUD operations cho Debt
 */
@Repository
public interface DebtRepository extends MongoRepository<Debt, String> {
    
    /**
     * Tìm các công nợ của một workspace
     */
    List<Debt> findByTenantIdAndIsActiveTrue(String tenantId);
    
    /**
     * Tìm công nợ của một đối tác trong workspace
     */
    Optional<Debt> findByTenantIdAndPartnerIdAndTypeAndIsActiveTrue(
            String tenantId,
            String partnerId,
            Debt.DebtType type
    );
    
    /**
     * Tìm các công nợ theo trạng thái
     */
    List<Debt> findByTenantIdAndStatusAndIsActiveTrue(String tenantId, Debt.DebtStatus status);
    
    /**
     * Tìm các công nợ quá hạn thay đổi từ một ngày
     */
    List<Debt> findByTenantIdAndStatusAndUpdatedAtBeforeAndIsActiveTrue(
            String tenantId,
            Debt.DebtStatus status,
            LocalDateTime updatedAt
    );
    
    /**
     * Tìm công nợ của một loại (PAYABLE hoặc RECEIVABLE)
     */
    List<Debt> findByTenantIdAndTypeAndIsActiveTrue(String tenantId, Debt.DebtType type);
    
    /**
     * Đếm số công nợ quá hạn
     */
    long countByTenantIdAndStatusAndIsActiveTrue(String tenantId, Debt.DebtStatus status);
}
