package com.optistock.backend.repository;

import com.optistock.backend.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findByTenantId(String tenantId);
    Optional<Tenant> findByOwnerEmail(String ownerEmail);
    boolean existsByTenantId(String tenantId);
    
    // Find all tenants where user is a member
    // Query searches in the members.userId array
    @Query("{ 'members.userId': ?0 }")
    List<Tenant> findAllByMembersUserId(String userId);
}
