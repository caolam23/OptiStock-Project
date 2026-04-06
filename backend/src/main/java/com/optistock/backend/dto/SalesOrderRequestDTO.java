package com.optistock.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SalesOrderRequestDTO {
    private String customerName;
    private String customerPhone;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private String productId;
        private int quantity;
        private BigDecimal unitPrice;
    }
}