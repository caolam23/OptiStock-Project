package com.optistock.backend.repository;

import com.optistock.backend.model.StocktakeTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho phiếu kiểm kê.
 *
 * Queries chính:
 * - Dashboard Staff: lấy phiếu PENDING
 * - Chi tiết phiếu: lấy theo id
 * - Manager: lấy phiếu SUBMITTED để duyệt
 */
@Repository
public interface StocktakeTicketRepository extends MongoRepository<StocktakeTicket, String> {

    /** Lấy tất cả phiếu theo tenant + status */
    List<StocktakeTicket> findByTenantIdAndStatus(String tenantId, String status);

    /** Lấy phiếu theo tenant + status, sắp xếp theo createdAt */
    List<StocktakeTicket> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, String status);

    /** Lấy phiếu được giao cho staff cụ thể */
    List<StocktakeTicket> findByTenantIdAndAssignedTo(String tenantId, String assignedTo);

    /** Lấy phiếu theo id + tenant (đảm bảo isolation) */
    Optional<StocktakeTicket> findByIdAndTenantId(String id, String tenantId);

    /** Đếm phiếu theo status (cho badge count) */
    long countByTenantIdAndStatus(String tenantId, String status);

    /** Lấy tất cả phiếu theo tenant (cho seeder cleanup) */
    List<StocktakeTicket> findByTenantId(String tenantId);

    /**
     * Lấy phiếu theo tenant + nhiều status (PENDING + IN_PROGRESS cho dashboard)
     */
    List<StocktakeTicket> findByTenantIdAndStatusIn(String tenantId, List<String> statuses);
}
