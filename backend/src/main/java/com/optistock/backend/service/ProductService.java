package com.optistock.backend.service;

import com.optistock.backend.dto.ProductDTO;
import com.optistock.backend.model.Product;
import com.optistock.backend.enums.TrackingType;
import com.optistock.backend.repository.ProductRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

/**
 * ProductService — Dịch vụ quản lý sản phẩm
 * Xử lý logic tạo sản phẩm thủ công và nhập hàng loạt từ file
 */
@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    /**
     * Tạo sản phẩm mới cho một tenant.
     * Validate: productCode không trống, không trùng lặp trong tenant, price > 0, maxStock > minStock
     *
     * @param tenantId ID của tenant
     * @param dto      Thông tin sản phẩm
     * @return Product được tạo
     * @throws IllegalArgumentException nếu validation thất bại
     */
    public Product createProduct(String tenantId, ProductDTO dto) {
        // ========== Validate dữ liệu ==========
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        if (dto.getProductCode() == null || dto.getProductCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã SKU (Product Code) không được để trống");
        }

        if (dto.getProductName() == null || dto.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }

        if (dto.getPrice() == null || dto.getPrice() <= 0) {
            throw new IllegalArgumentException("Giá bán phải lớn hơn 0");
        }

        // Kiểm tra maxStock > minStock (nếu có)
        if (dto.getMaxStock() != null && dto.getMinStock() != null &&
                dto.getMaxStock() <= dto.getMinStock()) {
            throw new IllegalArgumentException("Số lượng tối đa phải lớn hơn số lượng tối thiểu");
        }

        // Kiểm tra productCode không trùng lặp với sản phẩm còn active (bỏ qua sản phẩm đã xóa)
        if (productRepository.existsByTenantIdAndProductCodeAndIsActiveTrue(tenantId, dto.getProductCode())) {
            throw new IllegalArgumentException("Mã SKU '" + dto.getProductCode() + "' đã tồn tại trong workspace này");
        }

        // ========== Xây dựng Product entity ==========
        Product product = new Product();
        product.setTenantId(tenantId);
        product.setProductCode(dto.getProductCode().trim());
        product.setProductName(dto.getProductName().trim());
        product.setCategory(dto.getCategory() != null ? dto.getCategory().trim() : null);
        product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        product.setCondition(dto.getCondition() != null ? dto.getCondition().trim() : "New");
        product.setPrice(dto.getPrice());
        product.setCost(dto.getCost());
        product.setMainUnit(dto.getMainUnit() != null ? dto.getMainUnit().trim() : "Cái");
        product.setBrand(dto.getBrand() != null ? dto.getBrand().trim() : null);
        product.setTrackingType(dto.getTrackingType() != null ? dto.getTrackingType() : TrackingType.QUANTITY);
        product.setWarrantyMonths(dto.getWarrantyMonths());
        product.setSpecifications(dto.getSpecifications());
        product.setMinStock(dto.getMinStock() != null ? dto.getMinStock() : 0);
        product.setMaxStock(dto.getMaxStock() != null ? dto.getMaxStock() : 1000);
        product.setCurrentStock(dto.getCurrentStock() != null ? dto.getCurrentStock() : 0);
        product.setSupplier(dto.getSupplier() != null ? dto.getSupplier().trim() : null);
        product.setIndustryType(dto.getIndustryType() != null ? dto.getIndustryType() : "ELECTRONICS");  // 🔥 Set industryType
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // Lưu vào database
        return productRepository.save(product);
    }

    /**
     * 🔥 Overload method cho backward compatibility
     * Nhập hàng loạt sản phẩm từ file Excel/CSV (default industryType = null)
     *
     * @param tenantId ID của tenant
     * @param file     File Excel/CSV chứa dữ liệu sản phẩm
     * @return Map chứa: { success: boolean, imported: int, skipped: int, errors: List<ImportError> }
     */
    public Map<String, Object> bulkImport(String tenantId, MultipartFile file) {
        return bulkImport(tenantId, file, null);
    }

    /**
     * Nhập hàng loạt sản phẩm từ file Excel/CSV.
     *
     * Định dạng file:
     * - Dòng 1 (Header): productCode, productName, category, price, cost, mainUnit, minStock, maxStock, supplier
     * - Dòng 2+: Dữ liệu sản phẩm
     *
     * @param tenantId ID của tenant
     * @param file     File Excel/CSV chứa dữ liệu sản phẩm
     * @param industryType Loại ngành hàng (optional, ELECTRONICS hoặc GROCERY)
     * @return Map chứa: { success: boolean, imported: int, skipped: int, errors: List<ImportError> }
     */
    public Map<String, Object> bulkImport(String tenantId, MultipartFile file, String industryType) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        int imported = 0;
        int skipped = 0;

        try (InputStream is = file.getInputStream()) {
            // ========== Đọc file Excel ==========
            Workbook workbook = new XSSFWorkbook(is);
            Sheet sheet = workbook.getSheetAt(0);

            // Bỏ qua dòng header (dòng 0)
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);

                // Bỏ qua dòng trống
                if (row == null || row.getPhysicalNumberOfCells() == 0) {
                    continue;
                }

                try {
                    // ========== Parse dữ liệu từ Excel ==========
                    String productCode = getCellValue(row, 0);
                    String productName = getCellValue(row, 1);
                    String category = getCellValue(row, 2);
                    String priceStr = getCellValue(row, 3);
                    String costStr = getCellValue(row, 4);
                    String mainUnit = getCellValue(row, 5);
                    String minStockStr = getCellValue(row, 6);
                    String maxStockStr = getCellValue(row, 7);
                    String supplier = getCellValue(row, 8);

                    // Validate required fields
                    if (productCode == null || productCode.trim().isEmpty()) {
                        throw new IllegalArgumentException("Mã SKU không được để trống");
                    }
                    if (productName == null || productName.trim().isEmpty()) {
                        throw new IllegalArgumentException("Tên sản phẩm không được để trống");
                    }
                    if (priceStr == null || priceStr.trim().isEmpty()) {
                        throw new IllegalArgumentException("Giá bán không được để trống");
                    }

                    // Parse numeric values
                    Double price = parseDouble(priceStr, "Giá bán");
                    Double cost = costStr != null && !costStr.trim().isEmpty() ? parseDouble(costStr, "Giá vốn") : null;
                    Integer minStock = minStockStr != null && !minStockStr.trim().isEmpty() ? parseInt(minStockStr, "Số lượng tối thiểu") : 0;
                    Integer maxStock = maxStockStr != null && !maxStockStr.trim().isEmpty() ? parseInt(maxStockStr, "Số lượng tối đa") : 1000;

                    // ========== Map vào DTO ==========
                    ProductDTO dto = new ProductDTO();
                    dto.setProductCode(productCode.trim());
                    dto.setProductName(productName.trim());
                    dto.setCategory(category != null ? category.trim() : null);
                    dto.setPrice(price);
                    dto.setCost(cost);
                    dto.setMainUnit(mainUnit != null ? mainUnit.trim() : "Cái");
                    dto.setMinStock(minStock);
                    dto.setMaxStock(maxStock);
                    dto.setSupplier(supplier != null ? supplier.trim() : null);
                    dto.setIndustryType(industryType != null ? industryType : "ELECTRONICS");  // 🔥 Set industryType

                    // ========== Tạo sản phẩm ==========
                    createProduct(tenantId, dto);
                    imported++;

                } catch (IllegalArgumentException e) {
                    // Ghi lỗi nhưng tiếp tục với dòng tiếp theo
                    skipped++;
                    Map<String, Object> error = new HashMap<>();
                    error.put("row", rowIndex + 1); // Dòng thực tế (header là dòng 1)
                    error.put("error", e.getMessage());
                    errors.add(error);
                    log.warn("Lỗi import dòng {}: {}", rowIndex + 1, e.getMessage());

                } catch (Exception e) {
                    // Lỗi không mong đợi
                    skipped++;
                    Map<String, Object> error = new HashMap<>();
                    error.put("row", rowIndex + 1);
                    error.put("error", "Lỗi không mong đợi: " + e.getMessage());
                    errors.add(error);
                    log.error("Lỗi không mong đợi ở dòng {}", rowIndex + 1, e);
                }
            }

            workbook.close();

        } catch (Exception e) {
            log.error("Lỗi đọc file Excel", e);
            result.put("success", false);
            result.put("message", "Không thể đọc file: " + e.getMessage());
            result.put("imported", 0);
            result.put("skipped", 0);
            result.put("errors", List.of());
            return result;
        }

        // ========== Return kết quả ==========
        result.put("success", errors.isEmpty());
        result.put("imported", imported);
        result.put("skipped", skipped);
        result.put("errors", errors);

        return result;
    }

    /**
     * Lấy danh sách sản phẩm theo tenant ID
     *
     * @param tenantId ID của tenant
     * @return Danh sách sản phẩm
     */
    public List<Product> getProductsByTenantId(String tenantId) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        List<Product> products = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
        log.info("Lấy {} sản phẩm của tenant: {}", products.size(), tenantId);
        return products;
    }

    /**
     * ========== PAGINATION METHODS ==========
     * Lấy danh sách sản phẩm với phân trang
     *
     * @param tenantId ID của tenant
     * @param page Trang (0-indexed, mặc định 0)
     * @param size Kích thước trang (mặc định 10)
     * @param industryType Loại ngành hàng (optional, ELECTRONICS hoặc GROCERY)
     * @return Page<Product>
     */
    public Page<Product> getProductsWithPagination(String tenantId, int page, int size, String industryType) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        // Validate và set default values
        int p = Math.max(0, page);       // Đảm bảo page >= 0
        int s = Math.max(1, Math.min(size, 100)); // Đảm bảo 1 <= size <= 100

        Pageable pageable = PageRequest.of(p, s);
        Page<Product> products;
        
        // 🔥 FIX: Use smart backward-compatible logic
        if (industryType != null && !industryType.trim().isEmpty()) {
            String trimmedType = industryType.trim();
            // ELECTRONICS: include old products (backward compat)
            // GROCERY & others: strict match only
            if ("ELECTRONICS".equalsIgnoreCase(trimmedType)) {
                products = productRepository.findByTenantIdAndIndustryTypeWithBackwardCompat(tenantId, trimmedType, pageable);
            } else {
                products = productRepository.findByTenantIdAndIndustryTypeStrict(tenantId, trimmedType, pageable);
            }
            log.info("Lấy trang {} ({} items/page) của tenant: {} (industryType: {}), tổng: {} sản phẩm",
                    p, s, tenantId, trimmedType, products.getTotalElements());
        } else {
            products = productRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable);
            log.info("Lấy trang {} ({} items/page) của tenant: {}, tổng: {} sản phẩm",
                    p, s, tenantId, products.getTotalElements());
        }
        return products;
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa với phân trang
     *
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm
     * @param page Trang (0-indexed)
     * @param size Kích thước trang
     * @param industryType Loại ngành hàng (optional, ELECTRONICS hoặc GROCERY)
     * @return Page<Product>
     */
    public Page<Product> searchProductsWithPagination(String tenantId, String keyword, int page, int size, String industryType) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        if (keyword == null || keyword.trim().isEmpty()) {
            // Nếu keyword trống, trả về danh sách không filter
            return getProductsWithPagination(tenantId, page, size, industryType);
        }

        // Validate và set default values
        int p = Math.max(0, page);
        int s = Math.max(1, Math.min(size, 100));

        Pageable pageable = PageRequest.of(p, s);
        Page<Product> products;
        
        // 🔥 FIX: Use smart backward-compatible logic
        if (industryType != null && !industryType.trim().isEmpty()) {
            String trimmedType = industryType.trim();
            if ("ELECTRONICS".equalsIgnoreCase(trimmedType)) {
                products = productRepository.searchByTenantIdAndKeywordAndIndustryTypeWithBackwardCompat(
                        tenantId, keyword.trim(), trimmedType, pageable
                );
            } else {
                products = productRepository.searchByTenantIdAndKeywordAndIndustryTypeStrict(
                        tenantId, keyword.trim(), trimmedType, pageable
                );
            }
            log.info("Tìm kiếm '{}' trang {} của tenant: {} (industryType: {}), tìm thấy: {} sản phẩm",
                    keyword.trim(), p, tenantId, trimmedType, products.getTotalElements());
        } else {
            products = productRepository.searchByTenantIdAndKeywordWithPagination(
                    tenantId, keyword.trim(), pageable
            );
            log.info("Tìm kiếm '{}' trang {} của tenant: {}, tìm thấy: {} sản phẩm",
                    keyword.trim(), p, tenantId, products.getTotalElements());
        }
        return products;
    }

    /**
     * ========== ADVANCED FILTERING METHODS ==========
     * Tìm kiếm sản phẩm với các bộ lọc nâng cao (category, brand, stockStatus, industryType)
     * 
     * Hỗ trợ kết hợp các bộ lọc sau:
     * - category: Danh mục sản phẩm (optional)
     * - brand: Hãng sản phẩm (optional)
     * - stockStatus: Trạng thái tồn kho - OUT_OF_STOCK, LOW_STOCK, IN_STOCK, OVERSTOCK (optional)
     * - industryType: Loại ngành hàng - ELECTRONICS, GROCERY (optional)
     * 
     * @param tenantId ID của tenant
     * @param page Trang (0-indexed)
     * @param size Kích thước trang
     * @param category Danh mục sản phẩm (null để bỏ qua)
     * @param brand Hãng sản phẩm (null để bỏ qua)
     * @param stockStatus Trạng thái tồn kho (null để bỏ qua)
     * @param industryType Loại ngành hàng (null để bỏ qua)
     * @return Page<Product>
     */
    public Page<Product> searchProductsWithAdvancedFilters(String tenantId, int page, int size, 
                                                           String category, String brand, String stockStatus, String industryType) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        // Validate và set default values
        int p = Math.max(0, page);
        int s = Math.max(1, Math.min(size, 100));

        Pageable pageable = PageRequest.of(p, s);
        Page<Product> products;

        // ========== BUILD QUERY BASED ON FILTER COMBINATIONS ==========
        
        // 1. Cả category và brand được cung cấp
        if (isNotEmpty(category) && isNotEmpty(brand)) {
            if (isNotEmpty(industryType)) {
                // 🔥 FIX: Use smart backward-compatible logic
                String trimmedType = industryType.trim();
                if ("ELECTRONICS".equalsIgnoreCase(trimmedType)) {
                    products = productRepository.findByTenantIdAndCategoryAndBrandAndIndustryTypeWithBackwardCompat(
                            tenantId, category.trim(), brand.trim(), trimmedType, pageable
                    );
                } else {
                    products = productRepository.findByTenantIdAndCategoryAndBrandAndIndustryTypeStrict(
                            tenantId, category.trim(), brand.trim(), trimmedType, pageable
                    );
                }
                log.info("Lọc [category: {}, brand: {}, industryType: {}] trang {}: {} sản phẩm", 
                        category, brand, trimmedType, p, products.getTotalElements());
            } else {
                products = productRepository.findByTenantIdAndCategoryAndBrandWithRegex(
                        tenantId, category.trim(), brand.trim(), pageable
                );
                log.info("Lọc [category: {}, brand: {}, nil] trang {}: {} sản phẩm", 
                        category, brand, p, products.getTotalElements());
            }
        }
        // 2. Chỉ category
        else if (isNotEmpty(category)) {
            if (isNotEmpty(industryType)) {
                // 🔥 FIX: Use smart backward-compatible logic
                String trimmedType = industryType.trim();
                if ("ELECTRONICS".equalsIgnoreCase(trimmedType)) {
                    products = productRepository.findByTenantIdAndCategoryAndIndustryTypeWithBackwardCompat(
                            tenantId, category.trim(), trimmedType, pageable
                    );
                } else {
                    products = productRepository.findByTenantIdAndCategoryAndIndustryTypeStrict(
                            tenantId, category.trim(), trimmedType, pageable
                    );
                }
                log.info("Lọc [category: {}, industryType: {}] trang {}: {} sản phẩm", 
                        category, trimmedType, p, products.getTotalElements());
            } else {
                products = productRepository.findByTenantIdAndCategoryAndIsActiveTrue(
                        tenantId, category.trim(), pageable
                );
                log.info("Lọc [category: {}, nil] trang {}: {} sản phẩm", 
                        category, p, products.getTotalElements());
            }
        }
        // 3. Chỉ brand
        else if (isNotEmpty(brand)) {
            if (isNotEmpty(industryType)) {
                // 🔥 FIX: Use smart backward-compatible logic
                String trimmedType = industryType.trim();
                if ("ELECTRONICS".equalsIgnoreCase(trimmedType)) {
                    products = productRepository.findByTenantIdAndBrandAndIndustryTypeWithBackwardCompat(
                            tenantId, brand.trim(), trimmedType, pageable
                    );
                } else {
                    products = productRepository.findByTenantIdAndBrandAndIndustryTypeStrict(
                            tenantId, brand.trim(), trimmedType, pageable
                    );
                }
                log.info("Lọc [brand: {}, industryType: {}] trang {}: {} sản phẩm", 
                        brand, trimmedType, p, products.getTotalElements());
            } else {
                products = productRepository.findByTenantIdAndBrandAndIsActiveTrue(
                        tenantId, brand.trim(), pageable
                );
                log.info("Lọc [brand: {}] trang {}: {} sản phẩm", 
                        brand, p, products.getTotalElements());
            }
        }
        // 4. Chỉ industryType
        else if (isNotEmpty(industryType)) {
            // 🔥 FIX: Use smart backward-compatible logic
            String trimmedType = industryType.trim();
            if ("ELECTRONICS".equalsIgnoreCase(trimmedType)) {
                products = productRepository.findByTenantIdAndIndustryTypeWithBackwardCompat(
                        tenantId, trimmedType, pageable
                );
            } else {
                products = productRepository.findByTenantIdAndIndustryTypeStrict(
                        tenantId, trimmedType, pageable
                );
            }
            log.info("Lọc [industryType: {}] trang {}: {} sản phẩm", 
                    trimmedType, p, products.getTotalElements());
        }
        // 5. Không có category/brand/industryType, mặc định lấy tất cả
        else {
            products = productRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable);
            log.info("Lọc [nil, nil, nil] (không có bộ lọc) trang {}: {} sản phẩm", 
                    p, products.getTotalElements());
        }

        // ========== FILTER BY STOCK STATUS IN-MEMORY (nếu có) ==========
        if (isNotEmpty(stockStatus)) {
            String status = stockStatus.trim().toUpperCase();
            List<Product> filteredList = products.getContent().stream()
                    .filter(product -> matchesStockStatus(product, status))
                    .toList();
            
            // Tạo Page object từ filtered list
            int totalElements = (int) products.getTotalElements(); // Ghi chú: con số này không chính xác sau khi filter
            products = new org.springframework.data.domain.PageImpl<>(
                    filteredList,
                    pageable,
                    filteredList.size()
            );
            
            log.info("Áp dụng stockStatus filter [{}]: {} sản phẩm sau khi lọc", 
                    status, filteredList.size());
        }

        return products;
    }

    /**
     * Kiểm tra xem sản phẩm có khớp với trạng thái tồn kho hay không
     * 
     * @param product Sản phẩm cần kiểm tra
     * @param stockStatus Trạng thái tồn kho: OUT_OF_STOCK, LOW_STOCK, IN_STOCK, OVERSTOCK
     * @return true nếu khớp, false nếu không
     */
    private boolean matchesStockStatus(Product product, String stockStatus) {
        if (product.getCurrentStock() == null) {
            return false;
        }

        int current = product.getCurrentStock();
        int min = product.getMinStock() != null ? product.getMinStock() : 0;
        int max = product.getMaxStock() != null ? product.getMaxStock() : 1000;

        switch (stockStatus) {
            case "OUT_OF_STOCK":
                // Tồn kho = 0
                return current == 0;
            case "LOW_STOCK":
                // 0 < tồn kho <= tối thiểu
                return current > 0 && current <= min;
            case "IN_STOCK":
                // Tối thiểu < tồn kho < tối đa
                return current > min && current < max;
            case "OVERSTOCK":
                // Tồn kho >= tối đa
                return current >= max;
            default:
                return false;
        }
    }

    /**
     * Helper method kiểm tra string không rỗng và không null
     */
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa với phân trang

    /**
     * Cập nhật sản phẩm
     * Validate: price > 0, maxStock > minStock, productId hợp lệ
     *
     * @param tenantId ID của tenant
     * @param productId ID của sản phẩm cần cập nhật
     * @param dto Thông tin sản phẩm cần cập nhật
     * @return Product được cập nhật
     * @throws IllegalArgumentException nếu validation thất bại hoặc sản phẩm không tồn tại
     */
    public Product updateProduct(String tenantId, String productId, ProductDTO dto) {
        // ========== Validate dữ liệu ==========
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        if (productId == null || productId.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID không được để trống");
        }

        if (dto.getProductName() == null || dto.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }

        if (dto.getPrice() == null || dto.getPrice() <= 0) {
            throw new IllegalArgumentException("Giá bán phải lớn hơn 0");
        }

        // Kiểm tra maxStock > minStock (nếu có)
        if (dto.getMaxStock() != null && dto.getMinStock() != null &&
                dto.getMaxStock() <= dto.getMinStock()) {
            throw new IllegalArgumentException("Số lượng tối đa phải lớn hơn số lượng tối thiểu");
        }

        // ========== Tìm sản phẩm ==========
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        // Kiểm tra sản phẩm thuộc về tenant này
        if (!tenantId.equals(product.getTenantId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa sản phẩm này");
        }

        // ========== Cập nhật Product entity ==========
        product.setProductName(dto.getProductName().trim());
        product.setCategory(dto.getCategory() != null ? dto.getCategory().trim() : null);
        product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        product.setCondition(dto.getCondition() != null ? dto.getCondition().trim() : product.getCondition());
        product.setPrice(dto.getPrice());
        product.setCost(dto.getCost());
        product.setMainUnit(dto.getMainUnit() != null ? dto.getMainUnit().trim() : "Cái");
        product.setTrackingType(dto.getTrackingType() != null ? dto.getTrackingType() : product.getTrackingType());
        product.setMinStock(dto.getMinStock() != null ? dto.getMinStock() : 0);
        product.setMaxStock(dto.getMaxStock() != null ? dto.getMaxStock() : 1000);
        product.setCurrentStock(dto.getCurrentStock() != null ? dto.getCurrentStock() : product.getCurrentStock());
        product.setSupplier(dto.getSupplier() != null ? dto.getSupplier().trim() : null);
        product.setWarrantyMonths(dto.getWarrantyMonths() != null ? dto.getWarrantyMonths() : product.getWarrantyMonths());
        product.setSpecifications(dto.getSpecifications() != null ? dto.getSpecifications() : product.getSpecifications());
        product.setIndustryType(dto.getIndustryType() != null ? dto.getIndustryType() : product.getIndustryType());  // 🔥 Set industryType
        product.setUpdatedAt(LocalDateTime.now());

        // Lưu vào database
        return productRepository.save(product);
    }

    /**
     * Xóa sản phẩm (soft delete - set isActive = false)
     *
     * @param tenantId ID của tenant
     * @param productId ID của sản phẩm cần xóa
     * @throws IllegalArgumentException nếu sản phẩm không tồn tại
     */
    public void deleteProduct(String tenantId, String productId) {
        // ========== Validate dữ liệu ==========
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        if (productId == null || productId.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID không được để trống");
        }

        // ========== Tìm sản phẩm ==========
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        // Kiểm tra sản phẩm thuộc về tenant này
        if (!tenantId.equals(product.getTenantId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa sản phẩm này");
        }

        // ========== Soft delete (set isActive = false) ==========
        product.setActive(false);
        product.setUpdatedAt(LocalDateTime.now());

        productRepository.save(product);
        log.info("Sản phẩm xóa thành công: {} ({})", product.getProductCode(), productId);
    }

    /**
     * Lấy giá trị từ cell và convert sang String
     */
    private String getCellValue(Row row, int cellIndex) {
        try {
            var cell = row.getCell(cellIndex);
            if (cell == null) {
                return null;
            }
            return cell.getStringCellValue();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Parse Double từ String
     */
    private Double parseDouble(String value, String fieldName) {
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + " phải là số: " + value);
        }
    }

    /**
     * Parse Integer từ String
     */
    private Integer parseInt(String value, String fieldName) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(fieldName + " phải là số nguyên: " + value);
        }
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa (tên hoặc mã SKU)
     * Hỗ trợ auto-suggest với giới hạn số lượng kết quả
     *
     * @param tenantId ID của tenant
     * @param keyword Từ khóa tìm kiếm (tên sản phẩm hoặc mã SKU)
     * @param limit Số lượng kết quả tối đa (nullable, nếu null trả về tất cả)
     * @return Danh sách sản phẩm khớp, được sắp xếp tiên ưu (đối với mã SKU sẽ xếp trước)
     * @throws IllegalArgumentException nếu keyword rỗng
     */
    public List<Product> searchProducts(String tenantId, String keyword, Integer limit) {
        // ========== Validate dữ liệu ==========
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID không được để trống");
        }

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("Từ khóa tìm kiếm không được để trống");
        }

        String searchKeyword = keyword.trim();

        // ========== Tìm kiếm ==========
        List<Product> results = productRepository.searchByTenantIdAndKeyword(tenantId, searchKeyword);

        // ========== Sắp xếp: Ưu tiên khớp mã SKU, sau đó khớp tên ==========
        results.sort((p1, p2) -> {
            boolean p1CodeMatch = p1.getProductCode().toLowerCase().startsWith(searchKeyword.toLowerCase());
            boolean p2CodeMatch = p2.getProductCode().toLowerCase().startsWith(searchKeyword.toLowerCase());

            if (p1CodeMatch && !p2CodeMatch) {
                return -1; // p1 trước
            } else if (!p1CodeMatch && p2CodeMatch) {
                return 1;  // p2 trước
            }
            return 0; // giữ nguyên vị trí
        });

        // ========== Giới hạn kết quả nếu có ==========
        if (limit != null && limit > 0) {
            return results.size() > limit ? results.subList(0, limit) : results;
        }

        log.info("Tìm kiếm {} sản phẩm cho tenant {} với keyword: {} ({})", 
                 results.size(), tenantId, searchKeyword, 
                 limit != null ? limit + " limit" : "no limit");

        return results;
    }

    /**
     * Tạo file template Excel để import sản phẩm
     * 
     * @return byte array của file Excel template
     * @throws Exception nếu có lỗi tạo file
     */
    public byte[] generateTemplateFile() throws Exception {
        // ========== Tạo workbook ==========
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sản phẩm");

        // ========== Tạo header row ==========
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "Mã SKU",
            "Tên sản phẩm",
            "Danh mục",
            "Giá bán",
            "Giá vốn",
            "Đơn vị",
            "Tồn kho tối thiểu",
            "Tồn kho tối đa",
            "Nhà cung cấp"
        };

        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            // Style header: bold, background color
            var style = workbook.createCellStyle();
            style.setFillForegroundColor((short) 0x1F4E78); // Dark blue color
            style.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            var font = workbook.createFont();
            font.setBold(true);
            font.setColor((short) 0xFFFFFF); // White color
            style.setFont(font);
            style.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
            headerRow.getCell(i).setCellStyle(style);
        }

        // ========== Tạo dòng dữ liệu mẫu ==========
        Object[][] exampleData = {
            { "SKU-001", "Điện thoại", "Điện tử", "10000000", "6000000", "Cái", "5", "50", "Samsung" },
            { "SKU-002", "Nước ngọt", "Đồ uống", "15000", "8000", "Chai", "20", "100", "CocaCola" },
            { "SKU-003", "Gạo", "Lương thực", "20000", "15000", "kg", "10", "200", "ABC" }
        };

        for (int rowIndex = 0; rowIndex < exampleData.length; rowIndex++) {
            Row row = sheet.createRow(rowIndex + 1);
            Object[] rowData = exampleData[rowIndex];

            for (int colIndex = 0; colIndex < rowData.length; colIndex++) {
                row.createCell(colIndex).setCellValue(rowData[colIndex].toString());
            }
        }

        // ========== Auto-fit columns ==========
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // ========== Convert workbook to byte array ==========
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }
}
