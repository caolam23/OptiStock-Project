package com.optistock.backend.repository;

import com.optistock.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByTenantId(String tenantId);
    List<Product> findByTenantIdAndIsActiveTrue(String tenantId);
    
    // ========== PAGINATION METHODS ==========
    /**
     * Lấy danh sách sản phẩm với phân trang
     * @param tenantId ID của tenant
     * @param pageable Thông tin phân trang (page, size, sort)
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndIsActiveTrue(String tenantId, Pageable pageable);
    
    /**
     * Tìm kiếm sản phẩm theo từ khóa với phân trang
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, $or: [ { 'productName': { $regex: ?1, $options: 'i' } }, { 'productCode': { $regex: ?1, $options: 'i' } } ] }")
    Page<Product> searchByTenantIdAndKeywordWithPagination(String tenantId, String keyword, Pageable pageable);
    
    // ========== EXISTING METHODS (for backward compatibility) ==========
    Optional<Product> findByTenantIdAndProductCode(String tenantId, String productCode);
    List<Product> findByTenantIdAndCategory(String tenantId, String category);
    boolean existsByTenantIdAndProductCode(String tenantId, String productCode);
    // Check trùng SKU chỉ với sản phẩm còn active (không check sản phẩm đã xóa)
    boolean existsByTenantIdAndProductCodeAndIsActiveTrue(String tenantId, String productCode);
    
    /**
     * Tìm kiếm sản phẩm theo từ khóa (tên hoặc mã SKU) - LEGACY METHOD
     * Tìm kiếm không phân biệt chữ hoa/thường (regex ignore case)
     * 
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm
     * @return Danh sách sản phẩm khớp
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, $or: [ { 'productName': { $regex: ?1, $options: 'i' } }, { 'productCode': { $regex: ?1, $options: 'i' } } ] }")
    List<Product> searchByTenantIdAndKeyword(String tenantId, String keyword);
    
    // ========== FILTERING METHODS (for category, brand, stock status) ==========
    
    /**
     * Lấy sản phẩm theo danh mục với phân trang
     * 
     * @param tenantId ID của tenant
     * @param category Tên danh mục
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndCategoryAndIsActiveTrue(String tenantId, String category, Pageable pageable);
    
    /**
     * Lấy sản phẩm theo danh mục và hãng với phân trang
     * 
     * @param tenantId ID của tenant
     * @param category Tên danh mục
     * @param brand Hãng sản phẩm
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndCategoryAndBrandAndIsActiveTrue(String tenantId, String category, String brand, Pageable pageable);
    
    /**
     * Lấy sản phẩm theo hãng với phân trang
     * 
     * @param tenantId ID của tenant
     * @param brand Hãng sản phẩm
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndBrandAndIsActiveTrue(String tenantId, String brand, Pageable pageable);
    
    /**
     * Lấy sản phẩm hết hàng (currentStock = 0) với phân trang
     * 
     * @param tenantId ID của tenant
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'currentStock': 0 }")
    Page<Product> findOutOfStockProducts(String tenantId, Pageable pageable);
    
    /**
     * Lấy sản phẩm tồn kho thấp (0 < currentStock <= minStock) với phân trang
     * 
     * @param tenantId ID của tenant
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'currentStock': { $gt: 0 }, $expr: { $lte: ['$currentStock', '$minStock'] } }")
    Page<Product> findLowStockProducts(String tenantId, Pageable pageable);
    
    /**
     * Lấy sản phẩm vượt tồn kho (currentStock >= maxStock) với phân trang
     * 
     * @param tenantId ID của tenant
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, $expr: { $gte: ['$currentStock', '$maxStock'] } }")
    Page<Product> findOverstockProducts(String tenantId, Pageable pageable);
    
    /**
     * Lấy sản phẩm có tồn kho bình thường (minStock < currentStock < maxStock) với phân trang
     * 
     * @param tenantId ID của tenant
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, $expr: { $and: [ { $gt: ['$currentStock', '$minStock'] }, { $lt: ['$currentStock', '$maxStock'] } ] } }")
    Page<Product> findInStockProducts(String tenantId, Pageable pageable);
    
    /**
     * Lấy sản phẩm theo danh mục, hãng và trạng thái tồn kho với phân trang
     * 
     * @param tenantId ID của tenant
     * @param category Tên danh mục (có thể null để bỏ qua lọc)
     * @param brand Hãng sản phẩm (có thể null để bỏ qua lọc)
     * @param stockStatus Trạng thái tồn kho: OUT_OF_STOCK, LOW_STOCK, IN_STOCK, OVERSTOCK (có thể null)
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'category': { $regex: ?1, $options: 'i' }, 'brand': { $regex: ?2, $options: 'i' } }")
    Page<Product> findByTenantIdAndCategoryAndBrandWithRegex(String tenantId, String category, String brand, Pageable pageable);

    // ========== NEW: INDUSTRY TYPE FILTERING METHODS ==========

    /**
     * Lấy sản phẩm theo tenantId, industryType, isActive (List - không phân trang)
     * Sử dụng bởi ReportService để lấy tất cả sản phẩm cho báo cáo
     * 
     * @param tenantId ID của tenant
     * @param industryType Loại ngành hàng (ELECTRONICS, GROCERY)
     * @param isActive Trạng thái active
     * @return List<Product>
     */
    List<Product> findByTenantIdAndIndustryTypeAndIsActive(String tenantId, String industryType, boolean isActive);

    /**
     * Lấy sản phẩm theo tenantId, industryType (giải pháp cho vấn đề lọc ngành hàng)
     * @param tenantId ID của tenant
     * @param industryType Loại ngành hàng (ELECTRONICS, GROCERY)
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndIsActiveTrueAndIndustryType(String tenantId, String industryType, Pageable pageable);

    /**
     * Tìm kiếm sản phẩm theo từ khóa và industryType
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm
     * @param industryType Loại ngành hàng (ELECTRONICS, GROCERY)
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'industryType': ?2, $or: [ { 'productName': { $regex: ?1, $options: 'i' } }, { 'productCode': { $regex: ?1, $options: 'i' } } ] }")
    Page<Product> searchByTenantIdAndKeywordAndIndustryTypeWithPagination(String tenantId, String keyword, String industryType, Pageable pageable);

    /**
     * Lấy sản phẩm theo kategori và industryType
     * @param tenantId ID của tenant
     * @param category Danh mục sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndCategoryAndIndustryTypeAndIsActiveTrue(String tenantId, String category, String industryType, Pageable pageable);

    /**
     * Lấy sản phẩm theo brand và industryType
     * @param tenantId ID của tenant
     * @param brand Hãng sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndBrandAndIndustryTypeAndIsActiveTrue(String tenantId, String brand, String industryType, Pageable pageable);

    /**
     * Lấy sản phẩm theo danh mục, hãng và industryType
     * @param tenantId ID của tenant
     * @param category Tên danh mục
     * @param brand Hãng sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'industryType': ?3, 'category': { $regex: ?1, $options: 'i' }, 'brand': { $regex: ?2, $options: 'i' } }")
    Page<Product> findByTenantIdAndCategoryAndBrandAndIndustryTypeWithRegex(String tenantId, String category, String brand, String industryType, Pageable pageable);

    /**
     * Lấy sản phẩm theo industryType của tenant
     * @param tenantId ID của tenant
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    Page<Product> findByTenantIdAndIndustryTypeAndIsActiveTrue(String tenantId, String industryType, Pageable pageable);

    // ========== BACKWARD COMPATIBLE METHODS (include products without industryType field) ==========
    
    /**
     * 🔥 Lấy sản phẩm theo industryType HOẶC không có industryType (chỉ cho ELECTRONICS)
     * Điều này đơi khi giải quyết vấn đề: sản phẩm cũ không có industryType field sẽ vẫn được hiển thị
     * LOGIC:
     * - Nếu industryType = ELECTRONICS: match products nhưng industryType = ELECTRONICS HOẶC không có industryType
     * - Nếu industryType = GROCERY: match CHÍNH XÁC industryType = GROCERY (không lấy old products)
     * @param tenantId ID của tenant
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, $or: [{ 'industryType': ?1 }, { 'industryType': { $exists: false } }, { 'industryType': null }] }")
    Page<Product> findByTenantIdAndIndustryTypeWithBackwardCompat(String tenantId, String industryType, Pageable pageable);

    /**
     * 🔥 Lấy sản phẩm CHÍNH XÁC theo industryType (chỉ cho GROCERY và các industry khác)
     * Không lấy old products (vì chúng default là ELECTRONICS)
     * @param tenantId ID của tenant
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'industryType': ?1 }")
    Page<Product> findByTenantIdAndIndustryTypeStrict(String tenantId, String industryType, Pageable pageable);

    /**
     * 🔥 Tìm kiếm sản phẩm theo từ khóa và industryType HOẶC không có industryType
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, $or: [{ 'industryType': ?2 }, { 'industryType': { $exists: false } }, { 'industryType': null }], $or: [ { 'productName': { $regex: ?1, $options: 'i' } }, { 'productCode': { $regex: ?1, $options: 'i' } } ] }")
    Page<Product> searchByTenantIdAndKeywordAndIndustryTypeWithBackwardCompat(String tenantId, String keyword, String industryType, Pageable pageable);

    /**
     * 🔥 Tìm kiếm sản phẩm theo từ khóa và industryType CHÍNH XÁC
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'industryType': ?2, $or: [ { 'productName': { $regex: ?1, $options: 'i' } }, { 'productCode': { $regex: ?1, $options: 'i' } } ] }")
    Page<Product> searchByTenantIdAndKeywordAndIndustryTypeStrict(String tenantId, String keyword, String industryType, Pageable pageable);

    // ========== DASHBOARD QUERIES (New) ==========

    /**
     * Đếm số sản phẩm có tồn kho > minValue (dùng cho tính SKU hoạt động)
     * @param tenantId ID của tenant
     * @param minStock Giá trị so sánh
     * @param isActive Trạng thái sản phẩm
     * @return Số sản phẩm khớp
     */
    long countByTenantIdAndCurrentStockGreaterThanAndIsActive(String tenantId, Integer minStock, boolean isActive);

    /**
     * Đếm số sản phẩm có tồn kho <= maxValue (dùng cho tính sản phẩm hết hàng)
     * @param tenantId ID của tenant
     * @param maxStock Giá trị so sánh
     * @param isActive Trạng thái sản phẩm
     * @return Số sản phẩm khớp
     */
    long countByTenantIdAndCurrentStockLessThanEqualAndIsActive(String tenantId, Integer maxStock, boolean isActive);

    /**
     * 🔥 Lấy sản phẩm theo kategori và industryType HOẶC không có industryType
     * @param tenantId ID của tenant
     * @param category Danh mục sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'category': ?1, $or: [{ 'industryType': ?2 }, { 'industryType': { $exists: false } }, { 'industryType': null }] }")
    Page<Product> findByTenantIdAndCategoryAndIndustryTypeWithBackwardCompat(String tenantId, String category, String industryType, Pageable pageable);

    /**
     * 🔥 Lấy sản phẩm theo kategori và industryType CHÍNH XÁC
     * @param tenantId ID của tenant
     * @param category Danh mục sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'category': ?1, 'industryType': ?2 }")
    Page<Product> findByTenantIdAndCategoryAndIndustryTypeStrict(String tenantId, String category, String industryType, Pageable pageable);

    /**
     * 🔥 Lấy sản phẩm theo brand và industryType HOẶC không có industryType
     * @param tenantId ID của tenant
     * @param brand Hãng sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'brand': ?1, $or: [{ 'industryType': ?2 }, { 'industryType': { $exists: false } }, { 'industryType': null }] }")
    Page<Product> findByTenantIdAndBrandAndIndustryTypeWithBackwardCompat(String tenantId, String brand, String industryType, Pageable pageable);

    /**
     * 🔥 Lấy sản phẩm theo brand và industryType CHÍNH XÁC
     * @param tenantId ID của tenant
     * @param brand Hãng sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'brand': ?1, 'industryType': ?2 }")
    Page<Product> findByTenantIdAndBrandAndIndustryTypeStrict(String tenantId, String brand, String industryType, Pageable pageable);

    /**
     * 🔥 Lấy sản phẩm theo danh mục, hãng và industryType HOẶC không có industryType
     * @param tenantId ID của tenant
     * @param category Tên danh mục
     * @param brand Hãng sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'category': { $regex: ?1, $options: 'i' }, 'brand': { $regex: ?2, $options: 'i' }, $or: [{ 'industryType': ?3 }, { 'industryType': { $exists: false } }, { 'industryType': null }] }")
    Page<Product> findByTenantIdAndCategoryAndBrandAndIndustryTypeWithBackwardCompat(String tenantId, String category, String brand, String industryType, Pageable pageable);

    /**
     * 🔥 Lấy sản phẩm theo danh mục, hãng và industryType CHÍNH XÁC
     * @param tenantId ID của tenant
     * @param category Tên danh mục
     * @param brand Hãng sản phẩm
     * @param industryType Loại ngành hàng
     * @param pageable Thông tin phân trang
     * @return Page<Product>
     */
    @Query("{ 'tenantId': ?0, 'isActive': true, 'category': { $regex: ?1, $options: 'i' }, 'brand': { $regex: ?2, $options: 'i' }, 'industryType': ?3 }")
    Page<Product> findByTenantIdAndCategoryAndBrandAndIndustryTypeStrict(String tenantId, String category, String brand, String industryType, Pageable pageable);
}
