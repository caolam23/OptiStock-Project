package com.optistock.backend.repository;

import com.optistock.backend.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends MongoRepository<Location, String> {
    List<Location> findByTenantId(String tenantId);
    
    Optional<Location> findByTenantIdAndCode(String tenantId, String code);
    
    // Đã sửa tên hàm từ LocationType thành Type để khớp với tên biến trong Model
    List<Location> findByTenantIdAndType(String tenantId, String type);
    
    boolean existsByTenantIdAndCode(String tenantId, String code);
}