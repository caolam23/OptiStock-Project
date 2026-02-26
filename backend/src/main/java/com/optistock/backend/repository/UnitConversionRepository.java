package com.optistock.backend.repository;

import com.optistock.backend.model.UnitConversion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UnitConversionRepository extends MongoRepository<UnitConversion, String> {
    List<UnitConversion> findByTenantId(String tenantId);
    List<UnitConversion> findByProductId(String productId);
    List<UnitConversion> findByTenantIdAndProductId(String tenantId, String productId);
}
