package com.optistock.backend.dto;

import lombok.*;

/**
 * CreateStocktakeRequest: DTO để tạo phiếu kiểm kê
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStocktakeRequest {
    private String title;              // Tiêu đề phiếu
    private String industryType;       // ELECTRONICS hoặc GROCERY
    private String locationId;         // ID khu vực kiểm kê
    private String locationName;       // Tên khu vực
    private String assignedTo;         // ID nhân viên phụ trách
    private String assignedToName;     // Tên nhân viên (Denormalized)
}
