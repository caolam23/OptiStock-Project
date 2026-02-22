package com.optistock.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * User model — hỗ trợ SaaS Multi-tenant.
 * 1 User có thể tham gia nhiều Tenant (Kho) với vai trò khác nhau
 * thông qua List<TenantMembership>.
 */
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;

    /**
     * Danh sách kho mà user tham gia + role trong từng kho.
     * Thay thế cho tenantId (String) + roles (Set<String>) cũ.
     * VD: [{tenantId: "kho-a", role: "MANAGER"}, {tenantId: "kho-b", role:
     * "STAFF"}]
     */
    private List<TenantMembership> memberships = new ArrayList<>();

    private AuthProvider provider;
    private String googleId;
    private String avatar;
    private boolean isActive = true;

    // OTP fields cho reset password
    private String resetOtp;
    private LocalDateTime resetOtpExpiry;

    // Timestamp
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    // ===================== Constructors =====================

    public User() {
    }

    public User(String email, String password, String fullName, String phoneNumber) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.provider = AuthProvider.LOCAL;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ===================== Membership Helpers =====================

    /**
     * Lấy role của user trong 1 tenant cụ thể.
     * 
     * @return role string (VD: "MANAGER") hoặc null nếu không phải member
     */
    public String getRoleInTenant(String tenantId) {
        return memberships.stream()
                .filter(m -> m.getTenantId().equals(tenantId))
                .map(TenantMembership::getRole)
                .findFirst()
                .orElse(null);
    }

    /**
     * Kiểm tra user có phải member của tenant không.
     */
    public boolean isMemberOf(String tenantId) {
        return memberships.stream()
                .anyMatch(m -> m.getTenantId().equals(tenantId));
    }

    /**
     * Thêm user vào 1 tenant với role cụ thể.
     * Nếu đã là member thì cập nhật role.
     */
    public void addOrUpdateMembership(String tenantId, String role) {
        Optional<TenantMembership> existing = memberships.stream()
                .filter(m -> m.getTenantId().equals(tenantId))
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setRole(role);
        } else {
            memberships.add(new TenantMembership(tenantId, role));
        }
    }

    /**
     * Xóa user khỏi 1 tenant.
     */
    public void removeMembership(String tenantId) {
        memberships.removeIf(m -> m.getTenantId().equals(tenantId));
    }

    // ===================== Getters & Setters =====================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public List<TenantMembership> getMemberships() {
        // Defensive null check — MongoDB user cũ không có field này sẽ return null
        if (memberships == null)
            memberships = new ArrayList<>();
        return memberships;
    }

    public void setMemberships(List<TenantMembership> memberships) {
        this.memberships = memberships;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getResetOtp() {
        return resetOtp;
    }

    public void setResetOtp(String resetOtp) {
        this.resetOtp = resetOtp;
    }

    public LocalDateTime getResetOtpExpiry() {
        return resetOtpExpiry;
    }

    public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) {
        this.resetOtpExpiry = resetOtpExpiry;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}