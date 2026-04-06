package com.optistock.backend.service;

import com.optistock.backend.dto.CreateStocktakeRequest;
import com.optistock.backend.model.Product;
import com.optistock.backend.model.StocktakeItem;
import com.optistock.backend.model.StocktakeTicket;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.repository.StocktakeRepository;
import com.optistock.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * StocktakeService: Quản lý logic phiếu kiểm kê
 * 
 * Hỗ trợ 2 ngành hàng ELECTRONICS + GROCERY với snapshot tồn kho
 */
@Service
public class StocktakeService {

    private static final Logger log = LoggerFactory.getLogger(StocktakeService.class);

    @Autowired
    private StocktakeRepository stocktakeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== PUBLIC METHODS ====================

    /**
     * Lấy danh sách phiếu kiểm kê theo ngành hàng
     */
    public List<StocktakeTicket> getStocktakesByIndustry(String tenantId, String industryType) {
        return stocktakeRepository.findByTenantIdAndIndustryType(tenantId, industryType);
    }

    /**
     * Lấy danh sách phiếu theo status
     */
    public List<StocktakeTicket> getStocktakesByStatus(String tenantId, String status) {
        return stocktakeRepository.findByTenantIdAndStatus(tenantId, status);
    }

    /**
     * Lấy phiếu theo ID
     */
    public StocktakeTicket getStocktakeById(String tenantId, String ticketId) {
        return stocktakeRepository.findByIdAndTenantId(ticketId, tenantId)
            .orElseThrow(() -> new RuntimeException("Phiếu kiểm kê không tồn tại"));
    }

    /**
     * TẠO PHIẾU KIỂM KÊ
     * 
     * Logic:
     * 1. Snapshot tồn kho hiện tại → expectedQty
     * 2. Xử lý khác nhau dựa trên industryType:
     *    - ELECTRONICS: Lấy expectedImeis từ sản phẩm
     *    - GROCERY: Lấy batch + expiryDate
     * 3. Khởi tạo actualQty = null (chưa đếm)
     */
    public StocktakeTicket createStocktake(String tenantId, CreateStocktakeRequest req) {
        try {
            // A. Tạo mã phiếu duy nhất
            String ticketCode = generateTicketCode(tenantId);

            // B. Lấy danh sách sản phẩm trong khu vực (Location)
            // TODO: Implement location-based filtering if needed
            // Tạm dùng tất cả sản phẩm của tenant + industryType
            List<Product> products = productRepository.findByTenantIdAndIndustryTypeAndIsActive(
                tenantId, 
                req.getIndustryType(), 
                true
            );

            if (products.isEmpty()) {
                throw new RuntimeException("Không có sản phẩm nào trong khu vực này");
            }

            // C. Tạo danh sách Item từ snapshot tồn kho hiện tại
            List<StocktakeItem> items = products.stream()
                .map(product -> createStocktakeItem(product, req.getIndustryType()))
                .collect(Collectors.toList());

            // D. Tạo phiếu kiểm kê
            StocktakeTicket ticket = StocktakeTicket.builder()
                .tenantId(tenantId)
                .ticketCode(ticketCode)
                .title(req.getTitle())
                .status("PENDING")
                .industryType(req.getIndustryType())
                .locationId(req.getLocationId())
                .locationName(req.getLocationName())
                .assignedTo(req.getAssignedTo())
                .assignedToName(req.getAssignedToName()) // 🔥 Add assigned staff name
                .items(items)
                .createdAt(LocalDateTime.now())
                .build();

            // E. Lưu vào DB
            StocktakeTicket saved = stocktakeRepository.save(ticket);
            log.info("✅ Tạo phiếu kiểm kê thành công: {}", saved.getTicketCode());

            return saved;

        } catch (Exception e) {
            log.error("❌ Lỗi tạo phiếu kiểm kê:", e);
            throw new RuntimeException("Lỗi tạo phiếu kiểm kê: " + e.getMessage());
        }
    }

    /**
     * CẬP NHẬT SỐ LƯỢNG THỰC TẾ
     * 
     * Nhân viên nhập số đếm được → service tính discrepancy
     */
    public StocktakeTicket updateItemCount(String tenantId, String ticketId, String itemProductId, Integer actualQty) {
        StocktakeTicket ticket = getStocktakeById(tenantId, ticketId);

        if (!ticket.isEditable()) {
            throw new RuntimeException("Phiếu không ở trạng thái chỉnh sửa được");
        }

        // Tìm item trong ticket
        StocktakeItem item = ticket.getItems().stream()
            .filter(i -> i.getProductId().equals(itemProductId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong phiếu"));

        // Cập nhật số lượng thực tế + tính chênh lệch
        item.setActualQty(actualQty);
        item.calculateDiscrepancy();

        // Lưu lại
        StocktakeTicket updated = stocktakeRepository.save(ticket);
        log.info("✅ Cập nhật số lượng đếm sản phẩm: {}", itemProductId);

        return updated;
    }

    /**
     * HOÀN THÀNH PHIẾU KIỂM KÊ
     * 
     * Chuyển status từ COUNTING → REVIEWING
     */
    public StocktakeTicket submitStocktake(String tenantId, String ticketId) {
        StocktakeTicket ticket = getStocktakeById(tenantId, ticketId);

        if (!"COUNTING".equals(ticket.getStatus())) {
            throw new RuntimeException("Chỉ có thể gửi duyệt phiếu đang kiểm kê");
        }

        ticket.setStatus("REVIEWING");
        ticket.setSubmittedAt(LocalDateTime.now());

        StocktakeTicket updated = stocktakeRepository.save(ticket);
        log.info("✅ Gửi phiếu duyệt: {}", ticket.getTicketCode());

        return updated;
    }

    /**
     * DUYỆT PHIẾU KIỂM KÊ (Manager)
     * 
     * Chuyển status từ REVIEWING → COMPLETED
     */
    public StocktakeTicket approveStocktake(String tenantId, String ticketId) {
        StocktakeTicket ticket = getStocktakeById(tenantId, ticketId);

        if (!"REVIEWING".equals(ticket.getStatus())) {
            throw new RuntimeException("Chỉ có thể duyệt phiếu chờ duyệt");
        }

        ticket.setStatus("COMPLETED");
        ticket.setCompletedAt(LocalDateTime.now());

        StocktakeTicket updated = stocktakeRepository.save(ticket);
        log.info("✅ Duyệt phiếu kiểm kê: {}", ticket.getTicketCode());

        return updated;
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Tạo mã phiếu duy nhất định dạng: ST-20240401-001
     */
    private String generateTicketCode(String tenantId) {
        String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = stocktakeRepository.countByTenantIdAndStatus(tenantId, "PENDING");
        return String.format("ST-%s-%03d", datePrefix, count + 1);
    }

    /**
     * Tạo StocktakeItem từ Product
     * 
     * Xử lý riêng dựa trên industryType:
     * - ELECTRONICS: Snapshot expectedImeis
     * - GROCERY: Snapshot batch + expiryDate
     */
    private StocktakeItem createStocktakeItem(Product product, String industryType) {
        StocktakeItem item = StocktakeItem.builder()
            .productId(product.getId())
            .productCode(product.getProductCode())
            .productName(product.getProductName())
            .category(product.getCategory())
            .expectedQty(product.getCurrentStock() != null ? product.getCurrentStock() : 0)
            .actualQty(null)  // Chưa đếm
            .build();

        // Xử lý theo ngành hàng
        if ("ELECTRONICS".equalsIgnoreCase(industryType)) {
            // Snapshot IMEI từ sản phẩm
            // item.setExpectedImeis(product.getImeiList()); // TODO: depend on Product model
            item.setExpectedImeis(List.of());  // Placeholder
            item.setActualImeis(List.of());

        } else if ("GROCERY".equalsIgnoreCase(industryType)) {
            // Snapshot batch info từ sản phẩm
            // Nếu product có batch field, lấy thông tin
            // item.setBatchCode(product.getBatchCode()); // TODO: depend on Product model
            // item.setExpiryDate(product.getExpiryDate());
        }

        return item;
    }
}
