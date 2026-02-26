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
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        // Kiểm tra xem admin user đã tồn tại chưa
        boolean adminExists = userRepository.existsByEmail("admin@optistock.com");

        if (!adminExists) {
            // Tạo Super Admin user
            User adminUser = new User();
            adminUser.setEmail("admin@optistock.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setFullName("Super Admin");
            adminUser.setPhoneNumber("+84123456789");
            adminUser.setProvider(User.AuthProvider.LOCAL);
            adminUser.setActive(true);
            adminUser.getRoles().add(UserRole.SUPER_ADMIN.getCode());
            // SUPER_ADMIN không thuộc workspace nào — quản lý ở system level
            adminUser.setAvatar(null);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());

            userRepository.save(adminUser);
            System.out.println("✅ Super Admin user created successfully!");
            System.out.println("   Email: admin@optistock.com");
            System.out.println("   Password: admin123");
            System.out.println("   Role: SUPER_ADMIN");
        } else {
            System.out.println("✅ Super Admin user already exists.");
        }
    }
}
