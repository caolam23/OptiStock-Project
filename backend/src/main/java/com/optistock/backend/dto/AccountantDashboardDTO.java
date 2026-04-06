package com.optistock.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * AccountantDashboardDTO - DTO cho tổng quan tài chính của Accountant
 * Bao gồm thống kê tồn kho, hoạt động nhập/xuất 7 ngày gần nhất
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountantDashboardDTO {
    
    /**
     * Tổng số sản phẩm active trong workspace
     */
    @JsonProperty("total_products")
    private Integer totalProducts;
    
    /**
     * Tổng tồn kho (units) của tất cả sản phẩm
     */
    @JsonProperty("total_stock_quantity")
    private Integer totalStockQuantity;
    
    /**
     * Tổng số phiếu (voucher) được tạo hôm nay
     */
    @JsonProperty("today_vouchers_count")
    private Integer todayVouchersCount;
    
    /**
     * Tổng giá trị tồn kho hiện tại (đơn vị: VND)
     * = Tổng(stock_quantity × cost_price) của tất cả sản phẩm
     * Serialized as String to prevent precision issues
     */
    @JsonProperty("total_inventory_value")
    @JsonSerialize(using = ToStringSerializer.class)
    private BigDecimal totalInventoryValue;
    
    /**
     * Danh sách hoạt động nhập/xuất trong 7 ngày gần nhất
     * Dùng để vẽ biểu đồ
     */
    @JsonProperty("activity_data")
    private List<ActivityRecord> activityData;
    
    /**
     * Thời gian cập nhật dashboard (timestamp)
     */
    @JsonProperty("last_updated")
    private String lastUpdated;
    
    /**
     * Inner class: Bản ghi hoạt động nhập/xuất theo ngày
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityRecord {
        
        /**
         * Ngày (YYYY-MM-DD)
         */
        @JsonProperty("date")
        private String date;
        
        /**
         * Tổng giá trị nhập kho trong ngày (VND)
         * Serialized as String to prevent precision issues
         */
        @JsonProperty("import_value")
        @JsonSerialize(using = ToStringSerializer.class)
        private BigDecimal importValue;
        
        /**
         * Tổng giá trị xuất kho trong ngày (VND)
         * Serialized as String to prevent precision issues
         */
        @JsonProperty("export_value")
        @JsonSerialize(using = ToStringSerializer.class)
        private BigDecimal exportValue;
        
        /**
         * Số phiếu nhập
         */
        @JsonProperty("import_count")
        private Integer importCount;
        
        /**
         * Số phiếu xuất
         */
        @JsonProperty("export_count")
        private Integer exportCount;
    }
}
