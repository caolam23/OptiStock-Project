package com.optistock.backend.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import com.optistock.backend.enums.LocationLevel;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Location: Kho/Kệ/Khu vực quản lý hàng hóa
 * Được tạo dựa trên template theo industryCode
 * 
 * Cấu trúc cây: ZONE (Khu vực) -> RACK (Dãy/Kệ) -> BIN (Tầng/Hộc)
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
    
    // ========== NEW FIELDS FOR WAREHOUSE TOPOLOGY ==========
    /**
     * Mã vị trí cha trong cây (null nếu là node gốc ZONE)
     */
    private String parentId;
    
    /**
     * Cấp độ vị trí: ZONE, RACK, BIN
     */
    private LocationLevel level;
    
    /**
     * Loại ngành hàng: ELECTRONICS hoặc GROCERY
     * Giúp phân tách dữ liệu giữa 2 ngành độc lập
     */
    private String industryType; // "ELECTRONICS" hoặc "GROCERY"
    
    /**
     * Cấu hình động: Lưu các thuộc tính đặc thù theo industryType
     * VD: GROCERY có {temperature: "5-10°C", humidity: "70-80%"}
     * VD: ELECTRONICS có {securityLevel: "HIGH", fireproof: true}
     */
    private Map<String, Object> properties;

    /**
     * ID sản phẩm được gán cho vị trí này
     * Để gắn vị trí với sản phẩm cụ thể
     */
    private String productId;
    
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}