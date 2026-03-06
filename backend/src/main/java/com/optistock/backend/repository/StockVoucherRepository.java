package com.optistock.backend.repository;

import com.optistock.backend.model.StockVoucher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho phiếu nhập/xuất kho.
 *
 * Queries chính:
 * - Dashboard Staff: lấy phiếu PENDING theo tenantId
 * - Chi tiết phiếu: lấy theo id
 * - Phiếu PROCESSING: lấy phiếu đang xử lý của staff cụ thể
 */
@Repository
public interface StockVoucherRepository extends MongoRepository<StockVoucher, String> {

    /** Lấy tất cả phiếu theo tenant + status (cho dashboard 3 cột) */
    List<StockVoucher> findByTenantIdAndStatus(String tenantId, String status);

    /**
     * Lấy phiếu theo tenant + type + status (VD: chỉ lấy phiếu INBOUND đang
     * PENDING)
     */
    List<StockVoucher> findByTenantIdAndTypeAndStatus(String tenantId, String type, String status);

    /** Lấy phiếu được giao cho staff cụ thể */
    List<StockVoucher> findByTenantIdAndAssignedTo(String tenantId, String assignedTo);

    /** Lấy phiếu theo tenant + status, sắp xếp theo createdAt */
    List<StockVoucher> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, String status);

    /** Lấy phiếu theo id + tenant (đảm bảo isolation) */
    Optional<StockVoucher> findByIdAndTenantId(String id, String tenantId);

    /** Đếm phiếu theo type + status (cho badge count) */
    long countByTenantIdAndTypeAndStatus(String tenantId, String type, String status);

    /**
     * Lấy phiếu theo tenant + type + nhiều status (VD: PENDING + PROCESSING cho
     * dashboard)
     */
    List<StockVoucher> findByTenantIdAndTypeAndStatusIn(String tenantId, String type, List<String> statuses);
}
