package com.optistock.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductAvailabilityDTO {
    private String productId;
    private String productCode;
    private String productName;
    private String category;
    private int availableToPromise;
    private double price;
    private double maxDiscountPercent;
    private double suggestedMinPrice;
}