package com.optistock.backend.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Location: Kho/Kệ/Khu vực quản lý hàng hóa
 * Được tạo dựa trên template theo industryCode
 */
@Document(collection = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    private String id;
    private String tenantId;
    private String name;
    
    // Đã thêm trường code để fix lỗi khởi động
    private String code; 
    
    private String type; // DISPLAY, STORAGE, REPAIR, STAGING, INSPECTION, etc.
    private Integer capacity;
    
    @Builder.Default
    private Integer currentCount = 0; // số lượng items hiện tại
    
    @Builder.Default
    private boolean isActive = true;
    
    private String description;
    
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}