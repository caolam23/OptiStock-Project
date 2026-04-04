package com.optistock.backend.repository;

import com.optistock.backend.model.Location;
import com.optistock.backend.enums.LocationLevel;
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
    
    // ========== NEW METHODS FOR WAREHOUSE TOPOLOGY ==========
    
    /**
     * Lấy tất cả location theo tenantId + industryType (lọc theo ngành hàng)
     * Dùng cho API tree
     */
    List<Location> findByTenantIdAndIndustryType(String tenantId, String industryType);
    
    /**
     * Lấy location con theo parentId
     */
    List<Location> findByParentId(String parentId);
    
    /**
     * Lấy location con theo parentId + tenantId
     */
    List<Location> findByParentIdAndTenantId(String parentId, String tenantId);
    
    /**
     * Lấy tất cả node gốc (parentId = null) của một tenantId + industryType
     */
    List<Location> findByTenantIdAndIndustryTypeAndParentIdIsNull(String tenantId, String industryType);
    
    /**
     * Lấy location theo level + tenantId
     */
    List<Location> findByLevelAndTenantId(LocationLevel level, String tenantId);
    
    /**
     * Lấy location leaf nodes (BIN level) theo tenantId + industryType
     */
    List<Location> findByTenantIdAndIndustryTypeAndLevel(String tenantId, String industryType, LocationLevel level);
}