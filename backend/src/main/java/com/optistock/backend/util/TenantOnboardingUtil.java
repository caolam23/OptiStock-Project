package com.optistock.backend.util;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * TenantOnboardingUtil: Các utility methods hỗ trợ Tenant Onboarding
 */
public class TenantOnboardingUtil {

    private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    /**
     * Generate TenantId từ Company Name
     * VD: "Kho Gia Dụng Hùng Phát" -> "kho-gia-dung-hung-phat"
     */
    public static String generateTenantId(String companyName) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be empty");
        }

        return companyName.toLowerCase()
                .replaceAll("\\s+", "-") // Thay space bằng dash
                .replaceAll("[^a-z0-9-]", "") // Bỏ ký tự đặc biệt
                .replaceAll("-+", "-") // Replace multiple dashes with single
                .replaceAll("^-|-$", ""); // Bỏ dash ở đầu/cuối
    }

    /**
     * Generate Invitation Code
     * Format: INV-{12 random characters}
     * VD: INV-ABC123XYZ789
     */
    public static String generateInvitationCode() {
        return "INV-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    /**
     * Generate Location Code từ Location Name
     * VD: "Kệ A" -> "SHELF_A"
     */
    public static String generateLocationCode(String locationType, String name) {
        String prefix = "WAREHOUSE".equals(locationType) ? "WH" : "SHELF";
        String suffix = name.toUpperCase()
                .replaceAll("\\s+", "_")
                .replaceAll("[^A-Z0-9_]", "");
        return prefix + "_" + suffix;
    }

    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Validate phone number format (Vietnam)
     * Chấp nhận: 10-11 ký tự số
     */
    public static boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        return phoneNumber.replaceAll("[^0-9]", "").length() >= 10;
    }

    /**
     * Validate tax ID format (Vietnam)
     * TaxID thường có 10 ký tự số
     */
    public static boolean isValidTaxId(String taxId) {
        if (taxId == null || taxId.trim().isEmpty()) {
            return false;
        }
        return taxId.replaceAll("[^0-9]", "").length() == 10;
    }

    /**
     * Validate Product Code (SKU)
     * Format: Alphanumeric, 3-20 ký tự
     */
    public static boolean isValidProductCode(String productCode) {
        if (productCode == null) {
            return false;
        }
        return productCode.matches("[A-Z0-9-]{3,20}");
    }

    /**
     * Generate default Product Code từ Product Name
     * VD: "Chậu gốm 20cm" -> "CHAU-GOM-20CM"
     */
    public static String generateProductCode(String productName) {
        return productName.toUpperCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^A-Z0-9-]", "");
    }

    /**
     * Validate conversion factor
     */
    public static boolean isValidConversionFactor(Double factor) {
        return factor != null && factor > 0;
    }

    /**
     * Format invitation email subject
     */
    public static String getInvitationEmailSubject(String companyName) {
        return "📧 Lời mời tham gia " + companyName + " trên OptiStock";
    }

    /**
     * Build invitation link
     */
    public static String buildInvitationLink(String frontendUrl, String invitationCode) {
        return frontendUrl + "/accept-invitation?code=" + invitationCode;
    }

    /**
     * Check if role is valid
     */
    public static boolean isValidRole(String role) {
        return role != null && (
                role.equals("TENANT_ADMIN") ||
                role.equals("STAFF") ||
                role.equals("ACCOUNTANT") ||
                role.equals("MANAGER")
        );
    }

    /**
     * Check if location type is valid
     */
    public static boolean isValidLocationType(String locationType) {
        return locationType != null && (
                locationType.equals("WAREHOUSE") ||
                locationType.equals("SHELF")
        );
    }

    /**
     * Sanitize company name (bỏ ký tự đặc biệt, trim)
     */
    public static String sanitizeCompanyName(String companyName) {
        if (companyName == null) {
            return "";
        }
        return companyName.trim()
                .replaceAll("\\s+", " ") // Replace multiple spaces with single
                .substring(0, Math.min(100, companyName.length())); // Max 100 chars
    }
}
