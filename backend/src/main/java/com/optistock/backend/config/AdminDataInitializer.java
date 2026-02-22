package com.optistock.backend.config;

import com.optistock.backend.enums.UserRole;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeSuperAdmin();
        migrateTenantAdminToManager();
    }

    /**
     * Migration: đổi tất cả TENANT_ADMIN → MANAGER cho user cũ trong DB.
     * TENANT_ADMIN đã bị xóa, gộp vào MANAGER (chủ kho + quản lý kho).
     */
    private void migrateTenantAdminToManager() {
        java.util.List<User> allUsers = userRepository.findAll();
        int migratedCount = 0;

        for (User user : allUsers) {
            boolean changed = false;
            for (var membership : user.getMemberships()) {
                if ("TENANT_ADMIN".equals(membership.getRole())) {
                    membership.setRole(UserRole.MANAGER.getCode());
                    changed = true;
                }
            }
            if (changed) {
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                migratedCount++;
            }
        }

        if (migratedCount > 0) {
            System.out.println("✅ Migrated " + migratedCount + " user(s): TENANT_ADMIN → MANAGER");
        }
    }

    private void initializeSuperAdmin() {
        User adminUser = userRepository.findByEmail("admin@optistock.com").orElse(null);

        if (adminUser == null) {
            // Tạo mới
            adminUser = new User(
                    "admin@optistock.com",
                    passwordEncoder.encode("admin123"),
                    "Super Admin",
                    "+84123456789");
            adminUser.setProvider(User.AuthProvider.LOCAL);
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());

            adminUser.addOrUpdateMembership("SYSTEM", UserRole.SUPER_ADMIN.getCode());
            userRepository.save(adminUser);
            System.out.println("✅ Super Admin created: admin@optistock.com / admin123");
        } else {
            // User cũ đã tồn tại — đảm bảo có SUPER_ADMIN membership (xử lý format cũ)
            boolean hasSuperAdmin = adminUser.getMemberships().stream()
                    .anyMatch(m -> UserRole.SUPER_ADMIN.getCode().equals(m.getRole()));

            if (!hasSuperAdmin) {
                adminUser.addOrUpdateMembership("SYSTEM", UserRole.SUPER_ADMIN.getCode());
                adminUser.setUpdatedAt(LocalDateTime.now());
                userRepository.save(adminUser);
                System.out.println("✅ Super Admin membership updated for existing user.");
            } else {
                System.out.println("✅ Super Admin already exists and is up to date.");
            }
        }
    }
}
