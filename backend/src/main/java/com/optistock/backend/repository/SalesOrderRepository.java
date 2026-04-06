package com.optistock.backend.repository;

import com.optistock.backend.dto.CommittedStockResult;
import com.optistock.backend.model.SalesOrder;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository extends MongoRepository<SalesOrder, String> {

    List<SalesOrder> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    Optional<SalesOrder> findByTenantIdAndOrderCode(String tenantId, String orderCode);

    /**
     * Tính tổng số lượng của một sản phẩm đang nằm trong các đơn hàng chờ xử lý.
     * Các trạng thái này được coi là "đã giữ hàng" (committed).
     *
     * @param tenantId  ID của workspace
     * @param productId ID của sản phẩm cần kiểm tra
     * @return Optional chứa kết quả tính toán
     */
    @Aggregation(pipeline = {
            "{ $match: { 'tenantId': ?0, 'status': { $in: ['PENDING_APPROVAL', 'PROCESSING'] } } }",
            "{ $unwind: '$items' }",
            "{ $match: { 'items.productId': ?1 } }",
            "{ $group: { '_id': '$items.productId', 'committedStock': { $sum: '$items.quantity' } } }",
            // Project để đổi tên _id -> productId cho khớp với DTO
            "{ $project: { 'productId': '$_id', 'committedStock': 1, '_id': 0 } }"
    })
    Optional<CommittedStockResult> calculateCommittedStock(String tenantId, String productId);
}