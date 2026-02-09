package com.optistock.backend.dto;

import java.util.Set;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Set<String> roles;
    private String message;

    // Constructors
    public AuthResponse() {
    }

    public AuthResponse(String token, String email, String fullName, Set<String> roles) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    public AuthResponse(String token, String email, String fullName, String phoneNumber, Set<String> roles) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
    }

    // Getters & Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
