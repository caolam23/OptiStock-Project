package com.optistock.backend.repository;

import com.optistock.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByTenantId(String tenantId);
    Optional<Product> findByTenantIdAndProductCode(String tenantId, String productCode);
    List<Product> findByTenantIdAndCategory(String tenantId, String category);
    boolean existsByTenantIdAndProductCode(String tenantId, String productCode);
}
