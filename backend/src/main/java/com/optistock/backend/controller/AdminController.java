package com.optistock.backend.controller;

import com.optistock.backend.dto.TenantDTO;
import com.optistock.backend.enums.TenantStatus;
import com.optistock.backend.enums.UserRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.UserRepository;
import com.optistock.backend.security.annotation.RequireRole;
import com.optistock.backend.service.TenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private UserRepository userRepository;

    /**
     * SUPER ADMIN: Xem danh sách tất cả tenants
     */
    @GetMapping("/tenants")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền xem danh sách công ty")
    public ResponseEntity<?> getAllTenants() {
        try {
            List<TenantDTO> tenants = tenantService.getAllTenants();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tenants);
            response.put("total", tenants.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Xem chi tiết một tenant
     */
    @GetMapping("/tenants/{id}")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền xem chi tiết công ty")
    public ResponseEntity<?> getTenant(@PathVariable String id) {
        try {
            TenantDTO tenant = tenantService.getTenantById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tenant);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Khóa tenant (Lock)
     */
    @PostMapping("/tenants/{tenantId}/lock")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền khóa công ty")
    public ResponseEntity<?> lockTenant(@PathVariable String tenantId) {
        try {
            TenantDTO tenant = tenantService.updateTenantStatus(tenantId, TenantStatus.LOCKED);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Công ty đã bị khóa");
            response.put("data", tenant);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Mở khóa tenant (Unlock)
     */
    @PostMapping("/tenants/{tenantId}/unlock")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền mở khóa công ty")
    public ResponseEntity<?> unlockTenant(@PathVariable String tenantId) {
        try {
            TenantDTO tenant = tenantService.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Công ty đã được mở khóa");
            response.put("data", tenant);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Gia hạn dịch vụ cho tenant
     */
    @PostMapping("/tenants/{tenantId}/renew")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền gia hạn dịch vụ")
    public ResponseEntity<?> renewSubscription(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "30") int days) {
        try {
            TenantDTO tenant = tenantService.renewSubscription(tenantId, days);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Dịch vụ đã được gia hạn " + days + " ngày");
            response.put("data", tenant);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * TENANT ADMIN: Xem thông tin công ty của mình
     */
    @GetMapping("/my-tenant")
    public ResponseEntity<?> getMyTenant() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String tenantId = extractTenantIdFromAuth(auth);
            
            if (tenantId == null) {
                return createErrorResponse("Không tìm thấy thông tin công ty", HttpStatus.BAD_REQUEST);
            }
            
            TenantDTO tenant = tenantService.getTenantByTenantId(tenantId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tenant);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== USER MANAGEMENT ====================

    /**
     * SUPER ADMIN: Xem danh sách tất cả người dùng
     */
    @GetMapping("/users")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền xem danh sách người dùng")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("email", user.getEmail());
                userMap.put("fullName", user.getFullName());
                userMap.put("avatar", user.getAvatar());
                userMap.put("roles", user.getRoles());
                userMap.put("tenantId", user.getTenantId());
                userMap.put("isActive", user.isActive());
                userMap.put("provider", user.getProvider());
                userMap.put("createdAt", user.getCreatedAt());
                userMap.put("updatedAt", user.getUpdatedAt());
                return userMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userList);
            response.put("total", userList.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Vô hiệu hóa người dùng (Deactivate)
     */
    @PostMapping("/users/{userId}/deactivate")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền vô hiệu hóa người dùng")
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));
            
            user.setActive(false);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã vô hiệu hóa tài khoản: " + user.getEmail());
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Kích hoạt người dùng (Activate)
     */
    @PostMapping("/users/{userId}/activate")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền kích hoạt người dùng")
    public ResponseEntity<?> activateUser(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));
            
            user.setActive(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã kích hoạt tài khoản: " + user.getEmail());
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * SUPER ADMIN: Xóa người dùng
     */
    @DeleteMapping("/users/{userId}")
    @RequireRole(value = UserRole.SUPER_ADMIN, message = "Chỉ Super Admin mới có quyền xóa người dùng")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));
            
            // Không cho xóa admin user
            if (user.getRoles().contains(UserRole.SUPER_ADMIN.getCode())) {
                return createErrorResponse("Không thể xóa tài khoản Super Admin", HttpStatus.FORBIDDEN);
            }

            String email = user.getEmail();
            userRepository.deleteById(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa tài khoản: " + email);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== UTILITY METHODS ====================

    private String extractTenantIdFromAuth(Authentication auth) {
        // Implementation for extracting tenantId from authentication context
        // This will be implemented in JwtUtils integration
        return null;
    }

    private ResponseEntity<?> createErrorResponse(String message, HttpStatus status) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}
