package com.optistock.backend.repository;

import com.optistock.backend.model.FinancialReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * FinancialReportRepository — CRUD operations cho FinancialReport
 */
@Repository
public interface FinancialReportRepository extends MongoRepository<FinancialReport, String> {
    
    /**
     * Tìm báo cáo tài chính của ngày hôm nay
     */
    Optional<FinancialReport> findByTenantIdAndReportDateAndIsActiveTrue(String tenantId, LocalDate reportDate);
    
    /**
     * Tìm báo cáo gần nhất của một workspace
     */
    Optional<FinancialReport> findFirstByTenantIdAndIsActiveTrueOrderByReportDateDesc(String tenantId);
    
    /**
     * Tìm tất cả báo cáo trong khoảng ngày
     */
    List<FinancialReport> findByTenantIdAndReportDateBetweenAndIsActiveTrueOrderByReportDateDesc(
            String tenantId,
            LocalDate startDate,
            LocalDate endDate
    );
}
