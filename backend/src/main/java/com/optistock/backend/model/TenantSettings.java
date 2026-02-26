package com.optistock.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * TenantSettings: Cấu hình linh hoạt theo industryCode
 * Ví dụ: Electronics có thể require serial tracking
 *        FMCG có thể require expiry date
 */
@Document(collection = "tenant_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantSettings {
    @Id
    private String id;
    private String tenantId;

    // Industry-specific flags
    private boolean requireSerialTracking;
    private boolean requireExpiryDate;
    private boolean enableBom;
    private boolean enableLotTracking;
    private boolean requireBatchExpiry;
    
    // Advanced settings (flexible map cho các industry khác nhau)
    private Map<String, Object> customSettings;
    
    // Tracking settings
    private boolean enableInventoryTracking;
    private boolean enableStockAdjustment;
    private boolean enableAutoReorder;
    private Integer reorderThreshold;
    
    // Inventory management
    private boolean enableMultipleUnitConversion;
    private boolean enablePriceAdjustment;
    private boolean enableCostTracking;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @org.springframework.data.annotation.Transient
    public String getSettingsSummary() {
        StringBuilder sb = new StringBuilder();
        if (requireSerialTracking) sb.append("Serial Tracking, ");
        if (requireExpiryDate) sb.append("Expiry Date, ");
        if (enableBom) sb.append("BOM, ");
        if (enableLotTracking) sb.append("Lot Tracking, ");
        return sb.toString();
    }
}
