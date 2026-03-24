package com.optistock.backend.dto;

import lombok.Data;

@Data
public class CommittedStockResult {
    private String productId;
    private int committedStock;
}