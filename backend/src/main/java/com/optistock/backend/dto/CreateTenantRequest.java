package com.optistock.backend.dto;

public class CreateTenantRequest {
    private String companyName;
    private String businessType;
    private String phoneNumber;
    private String website;
    private String address;
    private String taxId;

    public CreateTenantRequest() {}

    public CreateTenantRequest(String companyName, String businessType) {
        this.companyName = companyName;
        this.businessType = businessType;
    }

    // Getters and Setters
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
}
