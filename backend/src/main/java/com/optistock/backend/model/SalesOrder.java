package com.optistock.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "sales_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrder {

    @Id
    private String id;

    @Indexed
    private String tenantId; // Mã Workspace

    private String orderCode;
    private String customerName;
    private String customerPhone;
    private Double totalAmount;
    private String status; // PENDING_APPROVAL, APPROVED, CANCELLED

    // Lưu vết người tạo/phụ trách đơn hàng
    private String createdBy;
    private String userId;
    private String createdByName;

    private List<SalesOrderItem> items = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
}