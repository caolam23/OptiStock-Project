package com.optistock.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrderItem {
    private String productId;
    
    @Builder.Default
    private Integer quantity = 1;
    private Double unitPrice;
}