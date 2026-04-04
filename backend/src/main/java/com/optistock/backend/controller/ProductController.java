package com.optistock.backend.controller;

import com.optistock.backend.dto.ProductDTO;
import com.optistock.backend.model.Product;
import com.optistock.backend.model.Tenant;
import com.optistock.backend.service.ProductService;
import com.optistock.backend.service.TenantService;
import com.optistock.backend.config.ProductCategoryConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

/**
 * ProductController — API endpoints quản lý sản phẩm
 * Hỗ trợ tạo sản phẩm thủ công và nhập hàng loạt từ file Excel
 */
@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private TenantService tenantService;

    /**
     * GET /api/v1/workspaces/{tenantId}/products
     * Lấy danh sách sản phẩm của workspace với phân trang và bộ lọc nâng cao
     * 
     * Query parameters:
     *  - search (optional): Từ khóa tìm kiếm (tìm theo tên hoặc mã SKU, ignore case)
     *  - category (optional): Lọc theo danh mục sản phẩm
     *  - brand (optional): Lọc theo hãng sản phẩm
     *  - stockStatus (optional): Lọc theo trạng thái tồn kho (OUT_OF_STOCK, LOW_STOCK, IN_STOCK, OVERSTOCK)
     *  - page (optional, default: 0): Trang (0-indexed)
     *  - size (optional, default: 10): Kích thước trang (1-100)
     *
     * Response: 200 OK
     * {
     *   "data": [
     *     {
     *       "id": "65f8e...",
     *       "tenantId": "tenant_id",
     *       "productCode": "SKU-001",
     *       "productName": "Nước ngọt Coca",
     *       "category": "Đồ uống",
     *       "brand": "Coca-Cola",
     *       "price": 15000,
     *       "cost": 10000,
     *       "mainUnit": "Chai",
     *       "minStock": 10,
     *       "maxStock": 500,
     *       "currentStock": 100,
     *       "supplier": "Công ty ABC",
     *       "active": true,
     *       "createdAt": "2026-03-13T...",
     *       "updatedAt": "2026-03-13T..."
     *     }
     *   ],
     *   "totalElements": 125,
     *   "totalPages": 13,
     *   "currentPage": 0,
     *   "pageSize": 10
     * }
     */
    @GetMapping
    public ResponseEntity<?> getProducts(
            @PathVariable String tenantId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "stockStatus", required = false) String stockStatus,
            @RequestParam(value = "industryType", required = false) String industryType,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "limit", required = false) Integer limit) {
        try {
            log.info("Lấy danh sách sản phẩm cho tenant: {} (search: {}, category: {}, brand: {}, stockStatus: {}, industryType: {}, page: {}, size: {}, limit: {})", 
                    tenantId, search, category, brand, stockStatus, industryType, page, size, limit);

            // ========== Validate đầu vào ==========
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            Page<Product> productPage;

            // ========== LOGIC: Nếu có cả limit (legacy support) thì dùng logic cũ ==========
            if (limit != null && limit > 0) {
                log.info("Sử dụng legacy mode với limit: {}, industryType: {}", limit, industryType);
                java.util.List<Product> products;
                if (search != null && !search.trim().isEmpty()) {
                    products = productService.searchProducts(tenantId, search, limit);
                    log.info("Tìm kiếm thành công {} sản phẩm", products.size());
                } else {
                    products = productService.getProductsByTenantId(tenantId);
                    // 🔥 Filter by industryType if provided
                    if (industryType != null && !industryType.trim().isEmpty()) {
                        products = products.stream()
                            .filter(p -> industryType.equals(p.getIndustryType()))
                            .collect(java.util.stream.Collectors.toList());
                        log.info("Lọc theo industryType '{}': {} sản phẩm", industryType, products.size());
                    }
                    if (limit != null && limit > 0 && products.size() > limit) {
                        products = products.subList(0, limit);
                    }
                    log.info("Lấy thành công {} sản phẩm", products.size());
                }
                return ResponseEntity.ok(products);
            }

            // ========== NEW: ADVANCED FILTERING SUPPORT ==========
            // Ưu tiên: Nếu có category/brand/stockStatus, dùng advanced filter
            // Nếu chỉ có search, dùng keyword search
            // Nếu không có gì, lấy tất cả
            
            if (hasAdvancedFilters(category, brand, stockStatus)) {
                // Sử dụng advanced filter (category, brand, stockStatus)
                productPage = productService.searchProductsWithAdvancedFilters(
                        tenantId, page, size, category, brand, stockStatus, industryType
                );
                log.info("Sử dụng advanced filters [category: {}, brand: {}, stockStatus: {}, industryType: {}], trang {}: {} sản phẩm", 
                        category, brand, stockStatus, industryType, page, productPage.getNumberOfElements());
            }
            else if (search != null && !search.trim().isEmpty()) {
                // Sử dụng keyword search
                productPage = productService.searchProductsWithPagination(tenantId, search, page, size, industryType);
                log.info("Tìm kiếm '{}' trang {} (industryType: {}): {} sản phẩm", search, page, industryType, productPage.getNumberOfElements());
            } 
            else {
                // Không có bộ lọc, lấy tất cả
                productPage = productService.getProductsWithPagination(tenantId, page, size, industryType);
                log.info("Lấy trang {} (industryType: {}): {} sản phẩm", page, industryType, productPage.getNumberOfElements());
            }

            // ========== BUILD RESPONSE ==========
            Map<String, Object> response = new HashMap<>();
            response.put("data", productPage.getContent());
            response.put("totalElements", productPage.getTotalElements());
            response.put("totalPages", productPage.getTotalPages());
            response.put("currentPage", productPage.getNumber());
            response.put("pageSize", productPage.getSize());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});

        } catch (Exception e) {
            log.error("Lỗi lấy danh sách sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }

    /**
     * Helper method: Kiểm tra có advanced filter nào được cung cấp không
     */
    private boolean hasAdvancedFilters(String category, String brand, String stockStatus) {
        return (category != null && !category.trim().isEmpty()) ||
               (brand != null && !brand.trim().isEmpty()) ||
               (stockStatus != null && !stockStatus.trim().isEmpty());
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/products/categories
     * Lấy danh sách danh mục & đơn vị sản phẩm theo ngành hàng của workspace
     *
     * Response: 200 OK
     * {
     *   "categories": ["Đồ uống", "Thực phẩm", ...],
     *   "units": ["Chai", "Thùng", ...],
     *   "defaultUnit": "Chai",
     *   "defaultCategory": "Đồ uống"
     * }
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getProductCategories(@PathVariable String tenantId) {
        try {
            log.info("Lấy danh mục sản phẩm cho tenant: {}", tenantId);

            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            // Lấy Tenant để biết industryCode
            Tenant tenant = tenantService.getTenantEntityByTenantId(tenantId);
            if (tenant == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Workspace không tồn tại");
                }});
            }

            String industryCode = tenant.getIndustryCode();

            // Lấy dữ liệu từ ProductCategoryConfig
            List<String> categories = ProductCategoryConfig.getCategoriesByIndustry(industryCode);
            List<String> units = ProductCategoryConfig.getUnitsByIndustry(industryCode);
            String defaultUnit = ProductCategoryConfig.getDefaultUnitByIndustry(industryCode);
            String defaultCategory = ProductCategoryConfig.getDefaultCategoryByIndustry(industryCode);

            log.info("Tìm thấy {} danh mục và {} đơn vị cho industry: {}", 
                    categories.size(), units.size(), industryCode);

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("categories", categories);
                put("units", units);
                put("defaultUnit", defaultUnit);
                put("defaultCategory", defaultCategory);
                put("industryCode", industryCode);
            }});

        } catch (Exception e) {
            log.error("Lỗi lấy danh mục sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/products/units
     * Lấy danh sách đơn vị sản phẩm theo ngành hàng (alternative endpoint)
     */
    @GetMapping("/units")
    public ResponseEntity<?> getProductUnits(@PathVariable String tenantId) {
        try {
            Tenant tenant = tenantService.getTenantEntityByTenantId(tenantId);
            if (tenant == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Workspace không tồn tại");
                }});
            }

            String industryCode = tenant.getIndustryCode();
            List<String> units = ProductCategoryConfig.getUnitsByIndustry(industryCode);

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("units", units);
                put("defaultUnit", ProductCategoryConfig.getDefaultUnitByIndustry(industryCode));
            }});

        } catch (Exception e) {
            log.error("Lỗi lấy danh sách đơn vị", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }

    /**
     * POST /api/v1/workspaces/{tenantId}/products
     * Tạo sản phẩm mới thủ công
     * Tạo sản phẩm mới thủ công
     *
     * Request body:
     * {
     *   "productCode": "SKU-001",
     *   "productName": "Nước ngọt Coca",
     *   "category": "Đồ uống",
     *   "price": 15000,
     *   "cost": 10000,
     *   "mainUnit": "Chai",
     *   "minStock": 10,
     *   "maxStock": 500,
     *   "supplier": "Công ty ABC"
     * }
     *
     * Response: 201 Created
     * {
     *   "id": "65f8e...",
     *   "tenantId": "tenant_id",
     *   "productCode": "SKU-001",
     *   "productName": "Nước ngọt Coca",
     *   ...
     * }
     */
    @PostMapping
    public ResponseEntity<?> createProduct(
            @PathVariable String tenantId,
            @RequestBody ProductDTO dto) {
        try {
            log.info("Tạo sản phẩm mới cho tenant: {}, code: {}", tenantId, dto.getProductCode());

            // ========== Validate đầu vào ==========
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            // ========== Tạo sản phẩm via Service ==========
            Product createdProduct = productService.createProduct(tenantId, dto);

            log.info("Sản phẩm được tạo thành công: {}", createdProduct.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("id", createdProduct.getId());
                put("productCode", createdProduct.getProductCode());
                put("productName", createdProduct.getProductName());
                put("message", "Tạo sản phẩm thành công");
            }});

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});

        } catch (Exception e) {
            log.error("Lỗi tạo sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }

    /**
     * POST /api/v1/workspaces/{tenantId}/products/bulk-import
     * Nhập hàng loạt sản phẩm từ file Excel/CSV
     *
     * Request: multipart/form-data
     * - Parameter: file (Excel file)
     *
     * Response: 200 OK nếu toàn bộ thành công, 207 Multi-Status nếu có lỗi một phần
     * {
     *   "success": true/false,
     *   "imported": 10,
     *   "skipped": 2,
     *   "errors": [
     *     { "row": 5, "error": "Giá bán phải là số" },
     *     { "row": 8, "error": "Mã SKU đã tồn tại" }
     *   ]
     * }
     */
    @PostMapping("/bulk-import")
    public ResponseEntity<?> bulkImportProducts(
            @PathVariable String tenantId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "industryType", required = false) String industryType) {
        try {
            log.info("Bắt đầu nhập hàng loạt sản phẩm cho tenant: {} (industryType: {})", tenantId, industryType);

            // ========== Validate file ==========
            if (file == null || file.isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "File không được để trống");
                }});
            }

            // Kiểm tra định dạng file (xlsx, xls, csv)
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || (!originalFilename.endsWith(".xlsx") &&
                    !originalFilename.endsWith(".xls") &&
                    !originalFilename.endsWith(".csv"))) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "File phải là Excel (.xlsx, .xls) hoặc CSV");
                }});
            }

            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            // ========== Xử lý nhập file ==========
            Map<String, Object> importResult = productService.bulkImport(tenantId, file, industryType);

            log.info("Hoàn thành nhập file: {} sản phẩm thành công, {} bỏ qua",
                    importResult.get("imported"), importResult.get("skipped"));

            // Determine HTTP status:
            // - 200 OK nếu toàn bộ thành công (không có lỗi)
            // - 207 Multi-Status nếu có lỗi một phần
            HttpStatus status = (Boolean) importResult.get("success") ? HttpStatus.OK : HttpStatus.MULTI_STATUS;

            return ResponseEntity.status(status).body(importResult);

        } catch (Exception e) {
            log.error("Lỗi nhập file sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
                put("imported", 0);
                put("skipped", 0);
                put("errors", java.util.List.of());
            }});
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/products/template
     * Tải file template để nhập sản phẩm
     * 
     * Response: File Excel template với dữ liệu mẫu
     */
    @GetMapping("/template")
    public ResponseEntity<?> downloadTemplate(
            @PathVariable String tenantId) {
        try {
            log.info("Tải template sản phẩm cho tenant: {}", tenantId);

            // ========== Validate tenantId ==========
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            // ========== Tạo file template ==========
            byte[] templateBytes = productService.generateTemplateFile();

            // ========== Return file đã tạo ==========
            return ResponseEntity
                    .ok()
                    .header("Content-Disposition", "attachment; filename=product-template.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(templateBytes);

        } catch (Exception e) {
            log.error("Lỗi tải template", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }

    /**
     * PUT /api/v1/workspaces/{tenantId}/products/{productId}
     * Cập nhật sản phẩm
     *
     * Request body:
     * {
     *   "productName": "Nước ngọt Coca Cola",
     *   "category": "Đồ uống",
     *   "price": 18000,
     *   "cost": 12000,
     *   "mainUnit": "Chai",
     *   "minStock": 10,
     *   "maxStock": 500,
     *   "currentStock": 150,
     *   "supplier": "Công ty ABC"
     * }
     *
     * Response: 200 OK
     * {
     *   "success": true,
     *   "id": "65f8e...",
     *   "productCode": "SKU-001",
     *   "productName": "Nước ngọt Coca Cola",
     *   "message": "Cập nhật sản phẩm thành công"
     * }
     */
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable String tenantId,
            @PathVariable String productId,
            @RequestBody ProductDTO dto) {
        try {
            log.info("Cập nhật sản phẩm: {}", productId);

            // ========== Validate đầu vào ==========
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            if (productId == null || productId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Product ID không được để trống");
                }});
            }

            // ========== Cập nhật sản phẩm via Service ==========
            Product updatedProduct = productService.updateProduct(tenantId, productId, dto);

            log.info("Sản phẩm cập nhật thành công: {}", updatedProduct.getId());

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("id", updatedProduct.getId());
                put("productCode", updatedProduct.getProductCode());
                put("productName", updatedProduct.getProductName());
                put("message", "Cập nhật sản phẩm thành công");
            }});

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});

        } catch (Exception e) {
            log.error("Lỗi cập nhật sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }

    /**
     * DELETE /api/v1/workspaces/{tenantId}/products/{productId}
     * Xóa sản phẩm (soft delete)
     *
     * Response: 200 OK
     * {
     *   "success": true,
     *   "id": "65f8e...",
     *   "productCode": "SKU-001",
     *   "productName": "Nước ngọt Coca",
     *   "message": "Xóa sản phẩm thành công"
     * }
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable String tenantId,
            @PathVariable String productId) {
        try {
            log.info("Xóa sản phẩm: {}", productId);

            // ========== Validate đầu vào ==========
            if (tenantId == null || tenantId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Tenant ID không được để trống");
                }});
            }

            if (productId == null || productId.trim().isEmpty()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "Product ID không được để trống");
                }});
            }

            // ========== Xóa sản phẩm via Service ==========
            productService.deleteProduct(tenantId, productId);

            log.info("Sản phẩm xóa thành công: {}", productId);

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("id", productId);
                put("message", "Xóa sản phẩm thành công");
            }});

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});

        } catch (Exception e) {
            log.error("Lỗi xóa sản phẩm", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Lỗi máy chủ: " + e.getMessage());
            }});
        }
    }
}
