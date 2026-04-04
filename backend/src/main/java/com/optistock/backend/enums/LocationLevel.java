package com.optistock.backend.enums;

/**
 * LocationLevel - Cấp độ vị trí trong kho
 * ZONE -> RACK -> BIN (cây 3 tầng)
 */
public enum LocationLevel {
    ZONE("Khu vực"),
    RACK("Dãy/Kệ"),
    BIN("Tầng/Hộc");

    private final String displayName;

    LocationLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
