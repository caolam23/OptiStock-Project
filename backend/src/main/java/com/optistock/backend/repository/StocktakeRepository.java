package com.optistock.backend.repository;

import com.optistock.backend.model.StocktakeTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * StocktakeRepository: Truy vấn phiếu kiểm kê
 * 
 * Hỗ trợ lọc theo:
 * - tenantId (multi-tenant)
 * - status (PENDING, COUNTING, REVIEWING, COMPLETED, CANCELLED)
 * - industryType (ELECTRONICS, GROCERY)
 */
@Repository
public interface StocktakeRepository extends MongoRepository<StocktakeTicket, String> {

    /**
     * Lấy danh sách phiếu theo tenant + status
     */
    List<StocktakeTicket> findByTenantIdAndStatus(String tenantId, String status);

    /**
     * Lấy danh sách phiếu theo tenant + industryType + status
     */
    List<StocktakeTicket> findByTenantIdAndIndustryTypeAndStatus(String tenantId, String industryType, String status);

    /**
     * Lấy danh sách phiếu theo tenant + industryType
     */
    List<StocktakeTicket> findByTenantIdAndIndustryType(String tenantId, String industryType);

    /**
     * Lấy phiếu theo ID + tenant (đảm bảo isolation)
     */
    Optional<StocktakeTicket> findByIdAndTenantId(String id, String tenantId);

    /**
     * Lấy phiếu theo ticketCode + tenant
     */
    Optional<StocktakeTicket> findByTenantIdAndTicketCode(String tenantId, String ticketCode);

    /**
     * Lấy danh sách phiếu giao cho nhân viên
     */
    List<StocktakeTicket> findByTenantIdAndAssignedTo(String tenantId, String assignedToId);

    /**
     * Lấy danh sách phiếu theo tenant, sắp xếp theo ngày tạo mới nhất
     */
    List<StocktakeTicket> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    /**
     * Đếm phiếu theo tenant + status
     */
    long countByTenantIdAndStatus(String tenantId, String status);

    /**
     * Đếm phiếu theo tenant + industryType + status
     */
    long countByTenantIdAndIndustryTypeAndStatus(String tenantId, String industryType, String status);
}
