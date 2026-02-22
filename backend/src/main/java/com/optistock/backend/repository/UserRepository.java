package com.optistock.backend.repository;

import com.optistock.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    /**
     * Tìm tất cả User thuộc 1 Tenant (dựa vào memberships.tenantId).
     * MongoDB Spring Data tự resolve "memberships" là subdocument array.
     */
    List<User> findByMembershipsTenantId(String tenantId);
}