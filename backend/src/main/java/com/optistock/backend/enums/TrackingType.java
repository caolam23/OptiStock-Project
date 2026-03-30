package com.optistock.backend.enums;

/**
 * TrackingType - Enum để phân loại cách quản lý kho sản phẩm Electronics
 * 
 * IMEI: Quản lý từng thiết bị riêng lẻ (IMEI, Serial Number)
 * BATCH: Quản lý theo lô hàng (Batch/Lot)
 * QUANTITY: Quản lý theo số lượng thông thường
 * SERVICE: Dịch vụ không quản lý kho
 */
public enum TrackingType {
    IMEI("Quản lý theo IMEI", "Thiết bị điện thoại, tablet"),
    BATCH("Quản lý theo Lô", "Phụ kiện, thiết bị không IMEI"),
    QUANTITY("Quản lý theo Số lượng", "Sản phẩm thông thường"),
    SERVICE("Dịch vụ", "Dịch vụ không quản lý kho");

    private final String displayName;
    private final String description;

    TrackingType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
