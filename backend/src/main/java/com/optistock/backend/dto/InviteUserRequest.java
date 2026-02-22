package com.optistock.backend.dto;

/**
 * Request body để MANAGER mời thành viên mới vào kho.
 * Nếu email đã có tài khoản → thêm vào memberships.
 * Nếu chưa có → tạo tài khoản mới + thêm vào memberships.
 */
public class InviteUserRequest {
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role; // Role trong kho: MANAGER / STAFF / ACCOUNTANT / SALE
    private String password; // Mật khẩu tạm (nếu tạo tài khoản mới)

    public InviteUserRequest() {
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
