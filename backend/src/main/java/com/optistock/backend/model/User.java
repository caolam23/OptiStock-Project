package com.optistock.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    
    private Set<String> roles = new HashSet<>();
    private AuthProvider provider;
    private String googleId;
    private String avatar;
    
    // OTP fields cho reset password
    private String resetOtp;
    private LocalDateTime resetOtpExpiry;
    
    // Timestamp
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    // Constructors
    public User() {
    }

    public User(String id, String email, String password, String fullName, String phoneNumber, Set<String> roles, AuthProvider provider, String googleId, String avatar) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
        this.provider = provider;
        this.googleId = googleId;
        this.avatar = avatar;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public String getGoogleId() {
        return googleId;
    }

    public String getAvatar() {
        return avatar;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
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