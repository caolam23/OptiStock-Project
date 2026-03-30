package com.optistock.backend.enums;

/**
 * ActivationStatus - Enum trạng thái kích hoạt của thiết bị
 * 
 * NOT_ACTIVATED: Chưa kích hoạt
 * ACTIVATED: Đã kích hoạt
 * DEACTIVATED: Đã hủy kích hoạt
 */
public enum ActivationStatus {
    NOT_ACTIVATED("Chưa kích hoạt", "Thiết bị mới, chưa được kích hoạt"),
    ACTIVATED("Đã kích hoạt", "Thiết bị đã được kích hoạt"),
    DEACTIVATED("Đã hủy", "Thiết bị đã bị hủy kích hoạt");

    private final String displayName;
    private final String description;

    ActivationStatus(String displayName, String description) {
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
