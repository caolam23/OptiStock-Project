package com.optistock.backend.repository;

import com.optistock.backend.model.TenantSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantSettingsRepository extends MongoRepository<TenantSettings, String> {
    Optional<TenantSettings> findByTenantId(String tenantId);
}
