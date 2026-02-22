package com.optistock.backend.controller;

import com.optistock.backend.dto.AssignRoleRequest;
import com.optistock.backend.dto.InviteUserRequest;
import com.optistock.backend.dto.TenantDTO;
import com.optistock.backend.enums.TenantStatus;
import com.optistock.backend.enums.UserRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.TenantRepository;
import com.optistock.backend.repository.UserRepository;
import com.optistock.backend.security.annotation.RequireRole;
import com.optistock.backend.service.AuthService;
import com.optistock.backend.service.TenantService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =====================================================================
    // SUPER_ADMIN ONLY — prefix: /api/admin/system
    // =====================================================================

    /** SUPER_ADMIN: Xem tất cả tenants trong hệ thống */
    @GetMapping("/system/tenants")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> getAllTenants() {
        try {
            List<TenantDTO> tenants = tenantService.getAllTenants();
            return ok(Map.of("data", tenants, "total", tenants.size()));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** SUPER_ADMIN: Xem chi tiết 1 tenant */
    @GetMapping("/system/tenants/{id}")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> getTenant(@PathVariable String id) {
        try {
            return ok(Map.of("data", tenantService.getTenantById(id)));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /** SUPER_ADMIN: Khóa tenant */
    @PostMapping("/system/tenants/{tenantId}/lock")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> lockTenant(@PathVariable String tenantId) {
        try {
            TenantDTO tenant = tenantService.updateTenantStatus(tenantId, TenantStatus.LOCKED);
            return ok(Map.of("message", "Kho đã bị khóa", "data", tenant));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** SUPER_ADMIN: Mở khóa tenant */
    @PostMapping("/system/tenants/{tenantId}/unlock")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> unlockTenant(@PathVariable String tenantId) {
        try {
            TenantDTO tenant = tenantService.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
            return ok(Map.of("message", "Kho đã được mở khóa", "data", tenant));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** SUPER_ADMIN: Gia hạn subscription */
    @PostMapping("/system/tenants/{tenantId}/renew")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> renewSubscription(@PathVariable String tenantId,
            @RequestParam(defaultValue = "30") int days) {
        try {
            TenantDTO tenant = tenantService.renewSubscription(tenantId, days);
            return ok(Map.of("message", "Gia hạn " + days + " ngày thành công", "data", tenant));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** SUPER_ADMIN: Xem tất cả users trong hệ thống */
    @GetMapping("/system/users")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Map<String, Object>> users = userRepository.findAll().stream()
                    .map(this::toUserMap).collect(Collectors.toList());
            return ok(Map.of("data", users, "total", users.size()));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** SUPER_ADMIN: Vô hiệu hóa user */
    @PostMapping("/system/users/{userId}/deactivate")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));
            user.setActive(false);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return ok(Map.of("message", "Đã vô hiệu hóa: " + user.getEmail()));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /** SUPER_ADMIN: Kích hoạt user */
    @PostMapping("/system/users/{userId}/activate")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> activateUser(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));
            user.setActive(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return ok(Map.of("message", "Đã kích hoạt: " + user.getEmail()));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /** SUPER_ADMIN: Xóa user khỏi hệ thống */
    @DeleteMapping("/system/users/{userId}")
    @RequireRole(value = UserRole.SUPER_ADMIN)
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));
            // Không cho xóa SUPER_ADMIN
            boolean isSuperAdmin = user.getMemberships().isEmpty() &&
                    userRepository.findByEmail("admin@optistock.com")
                            .map(u -> u.getId().equals(userId)).orElse(false);
            if (isSuperAdmin) {
                return error("Không thể xóa tài khoản Super Admin", HttpStatus.FORBIDDEN);
            }
            userRepository.deleteById(userId);
            return ok(Map.of("message", "Đã xóa tài khoản: " + user.getEmail()));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // =====================================================================
    // MANAGER — prefix: /api/admin/tenant
    // Yêu cầu header: X-Tenant-Id: <tenantId>
    // =====================================================================

    /** MANAGER: Xem thông tin kho của mình */
    @GetMapping("/tenant/info")
    public ResponseEntity<?> getMyTenant(@RequestHeader("X-Tenant-Id") String tenantId) {
        try {
            TenantDTO tenant = tenantService.getTenantByTenantId(tenantId);
            return ok(Map.of("data", tenant));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /** MANAGER: Xem danh sách member trong kho */
    @GetMapping("/tenant/users")
    public ResponseEntity<?> getTenantUsers(@RequestHeader("X-Tenant-Id") String tenantId) {
        try {
            List<User> members = userRepository.findByMembershipsTenantId(tenantId);
            List<Map<String, Object>> result = members.stream().map(u -> {
                Map<String, Object> m = toUserMap(u);
                // Thêm role trong tenant này
                m.put("roleInTenant", u.getRoleInTenant(tenantId));
                return m;
            }).collect(Collectors.toList());
            return ok(Map.of("data", result, "total", result.size()));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * MANAGER ONLY: Mời thành viên vào kho.
     * - Nếu email đã tồn tại → thêm membership.
     * - Nếu chưa tồn tại → tạo tài khoản mới + thêm membership.
     */
    @PostMapping("/tenant/users/invite")
    @RequireRole(value = UserRole.MANAGER)
    public ResponseEntity<?> inviteUser(@RequestHeader("X-Tenant-Id") String tenantId,
            @RequestBody InviteUserRequest request) {
        try {
            // Validate role
            String role = request.getRole();
            if (role == null || role.isEmpty()) {
                return error("Vui lòng chỉ định role cho thành viên", HttpStatus.BAD_REQUEST);
            }
            // Không cho invite SUPER_ADMIN
            if (UserRole.SUPER_ADMIN.getCode().equals(role)) {
                return error("Không thể gán role SUPER_ADMIN trong kho", HttpStatus.FORBIDDEN);
            }

            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            if (user == null) {
                // Tạo tài khoản mới
                if (request.getPassword() == null || request.getPassword().length() < 6) {
                    return error("Mật khẩu phải có ít nhất 6 ký tự", HttpStatus.BAD_REQUEST);
                }
                user = new User(
                        request.getEmail(),
                        passwordEncoder.encode(request.getPassword()),
                        request.getFullName() != null ? request.getFullName() : request.getEmail(),
                        request.getPhoneNumber());
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
            }

            // Thêm hoặc cập nhật membership
            user.addOrUpdateMembership(tenantId, role);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            return ok(Map.of(
                    "message", "Đã thêm " + request.getEmail() + " vào kho với role: " + role,
                    "data", toUserMap(user)));
        } catch (Exception e) {
            return error(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** MANAGER ONLY: Đổi role của member trong kho */
    @PatchMapping("/tenant/users/{userId}/role")
    @RequireRole(value = UserRole.MANAGER)
    public ResponseEntity<?> assignRole(@RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable String userId,
            @RequestBody AssignRoleRequest request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));

            if (!user.isMemberOf(tenantId)) {
                return error("Người dùng này không phải thành viên của kho", HttpStatus.BAD_REQUEST);
            }

            String role = request.getRole();
            if (UserRole.SUPER_ADMIN.getCode().equals(role)) {
                return error("Không thể gán role SUPER_ADMIN", HttpStatus.FORBIDDEN);
            }

            user.addOrUpdateMembership(tenantId, role);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            return ok(Map.of("message", "Đã cập nhật role thành: " + role));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /** MANAGER ONLY: Xóa member khỏi kho */
    @DeleteMapping("/tenant/users/{userId}")
    @RequireRole(value = UserRole.MANAGER)
    public ResponseEntity<?> removeMember(@RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable String userId) {
        try {
            // Không cho tự xóa mình
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentEmail = auth.getName();
            User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
            if (currentUser != null && currentUser.getId().equals(userId)) {
                return error("Không thể tự xóa mình khỏi kho", HttpStatus.BAD_REQUEST);
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AuthException("Không tìm thấy người dùng"));

            if (!user.isMemberOf(tenantId)) {
                return error("Người dùng này không phải thành viên của kho", HttpStatus.BAD_REQUEST);
            }

            user.removeMembership(tenantId);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            return ok(Map.of("message", "Đã xóa " + user.getEmail() + " khỏi kho"));
        } catch (AuthException e) {
            return error(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // =====================================================================
    // UTILITY
    // =====================================================================

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("fullName", user.getFullName());
        map.put("avatar", user.getAvatar());
        // Enrich memberships with tenantName (companyName) for display
        List<Map<String, Object>> enrichedMemberships = user.getMemberships().stream().map(m -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("tenantId", m.getTenantId());
            entry.put("role", m.getRole());
            entry.put("joinedAt", m.getJoinedAt());
            String tenantName = tenantRepository.findByTenantId(m.getTenantId())
                    .map(t -> t.getCompanyName())
                    .orElse(m.getTenantId()); // fallback to slug if not found
            entry.put("tenantName", tenantName);
            return entry;
        }).collect(Collectors.toList());
        map.put("memberships", enrichedMemberships);
        map.put("isActive", user.isActive());
        map.put("provider", user.getProvider());
        map.put("createdAt", user.getCreatedAt());
        return map;
    }

    private ResponseEntity<?> ok(Map<String, ?> data) {
        Map<String, Object> resp = new HashMap<>(data);
        resp.put("success", true);
        return ResponseEntity.ok(resp);
    }

    private ResponseEntity<?> error(String message, HttpStatus status) {
        return ResponseEntity.status(status)
                .body(Map.of("success", false, "message", message));
    }
}
