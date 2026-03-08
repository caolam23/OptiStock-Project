package com.optistock.backend.dto;

import java.util.List;

/**
 * CreateVoucherRequest — DTO cho POST /api/v1/manager/vouchers
 *
 * Manager điền form này để tạo phiếu nhập/xuất kho.
 */
public class CreateVoucherRequest {

    /** INBOUND (nhập) hoặc OUTBOUND (xuất) */
    private String type;

    /** Tiêu đề phiếu: "Nhập hàng từ NCC Tuấn", "Xuất Cửa hàng Q1" */
    private String title;

    /** LOW | NORMAL | HIGH */
    private String priority;

    /** Nơi nhận — chỉ dùng cho OUTBOUND: "Cửa hàng Quận 1" */
    private String destination;

    /** Ghi chú tự do */
    private String notes;

    /** Danh sách sản phẩm trong phiếu */
    private List<VoucherItemRequest> items;

    // ── Getters & Setters ──────────────────────────────────────

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<VoucherItemRequest> getItems() {
        return items;
    }

    public void setItems(List<VoucherItemRequest> items) {
        this.items = items;
    }

    // ── Nested DTO: 1 dòng sản phẩm ──────────────────────────

    public static class VoucherItemRequest {
        private String productCode; // Barcode/SKU
        private String productName; // Tên SP (denormalized)
        private String productVariant; // Màu, size (tuỳ chọn)
        private String locationCode; // Vị trí kệ: "Shelf A-01"
        private Integer quantityRequired;

        public String getProductCode() {
            return productCode;
        }

        public void setProductCode(String productCode) {
            this.productCode = productCode;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getProductVariant() {
            return productVariant;
        }

        public void setProductVariant(String productVariant) {
            this.productVariant = productVariant;
        }

        public String getLocationCode() {
            return locationCode;
        }

        public void setLocationCode(String locationCode) {
            this.locationCode = locationCode;
        }

        public Integer getQuantityRequired() {
            return quantityRequired;
        }

        public void setQuantityRequired(Integer quantityRequired) {
            this.quantityRequired = quantityRequired;
        }
    }
}
