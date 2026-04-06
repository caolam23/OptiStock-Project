package com.optistock.backend.service;

import com.optistock.backend.dto.StockVoucherDTO;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.Product;
import com.optistock.backend.model.SalesOrder;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.model.VoucherItem;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.repository.SalesOrderRepository;
import com.optistock.backend.repository.StockVoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * StaffVoucherService: Business logic cho chức năng nhập/xuất kho của nhân
 * viên.
 *
 * Luồng chính:
 * 1. getDashboard() → Dashboard 3 cột: list INBOUND + OUTBOUND pending
 * 2. getVoucher() → Chi tiết 1 phiếu để xử lý
 * 3. startVoucher() → PENDING → PROCESSING (ghi thời gian bắt đầu)
 * 4. scanBarcode() → Tăng quantityActual khi Staff quét mã
 * 5. updateItem() → Nhập số lượng thủ công (lười quét)
 * 6. completeVoucher()→ PROCESSING → COMPLETED + cập nhật tồn kho + chuẩn bị
 * audit
 */
@Service
public class StaffVoucherService {

    @Autowired
    private StockVoucherRepository stockVoucherRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    // ================================================================
    // 1. DASHBOARD — Lấy tất cả phiếu chờ theo tenant
    // ================================================================

    private static final List<String> ACTIVE_STATUSES = Arrays.asList("PENDING", "PROCESSING");

    /**
     * Lấy danh sách phiếu INBOUND chưa hoàn tất (PENDING + PROCESSING).
     */
    public List<StockVoucherDTO> getPendingInbound(String tenantId) {
        return stockVoucherRepository
                .findByTenantIdAndTypeAndStatusIn(tenantId, "INBOUND", ACTIVE_STATUSES)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách phiếu OUTBOUND chưa hoàn tất (PENDING + PROCESSING).
     */
    public List<StockVoucherDTO> getPendingOutbound(String tenantId) {
        return stockVoucherRepository
                .findByTenantIdAndTypeAndStatusIn(tenantId, "OUTBOUND", ACTIVE_STATUSES)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ================================================================
    // 2. CHI TIẾT PHIẾU
    // ================================================================

    /**
     * Lấy chi tiết 1 phiếu nhập/xuất.
     * Validate thuộc đúng tenant (tránh truy cập chéo workspace).
     */
    public StockVoucherDTO getVoucher(String tenantId, String voucherId) {
        StockVoucher voucher = stockVoucherRepository
                .findByIdAndTenantId(voucherId, tenantId)
                .orElseThrow(() -> new AuthException("Phiếu không tồn tại hoặc bạn không có quyền xem"));
        return toDTO(voucher);
    }

    // ================================================================
    // 3. BẮT ĐẦU XỬ LÝ PHIẾU
    // ================================================================

    /**
     * Chuyển phiếu từ PENDING → PROCESSING.
     * Ghi thời gian bắt đầu và userId của Staff.
     */
    public StockVoucherDTO startVoucher(String tenantId, String voucherId, String staffUserId) {
        StockVoucher voucher = getVoucherEntity(tenantId, voucherId);

        if (!"PENDING".equals(voucher.getStatus())) {
            throw new AuthException("Phiếu đang ở trạng thái '" + voucher.getStatus() + "', không thể bắt đầu");
        }

        voucher.setStatus("PROCESSING");
        voucher.setProcessedBy(staffUserId);
        voucher.setStartedAt(LocalDateTime.now());

        return toDTO(stockVoucherRepository.save(voucher));
    }

    // ================================================================
    // 4. QUÉT MÃ BARCODE → Tăng số lượng thực tế
    // ================================================================

    /**
     * Xử lý khi Staff quét barcode.
     * Tìm item trong phiếu theo productCode → tăng quantityActual.
     *
     * @param barcode  Mã barcode/SKU Staff vừa quét
     * @param quantity Số lượng (mặc định = 1, hoặc Staff nhập nhiều)
     * @return StockVoucherDTO cập nhật (dùng để refresh UI)
     */
    public StockVoucherDTO scanBarcode(String tenantId, String voucherId, String barcode, int quantity) {
        StockVoucher voucher = getVoucherEntity(tenantId, voucherId);

        if (!"PROCESSING".equals(voucher.getStatus())) {
            throw new AuthException("Phiếu chưa được bắt đầu. Hãy bấm 'Bắt đầu xử lý' trước.");
        }

        if (quantity <= 0) {
            throw new AuthException("Số lượng quét phải lớn hơn 0");
        }

        // Tìm item khớp barcode trong phiếu
        VoucherItem item = voucher.findItemByProductCode(barcode);
        if (item == null) {
            throw new AuthException("Mã '" + barcode + "' không thuộc phiếu này. Kiểm tra lại mã vạch.");
        }

        // Tăng số lượng — chặn cứng nếu đã đủ
        boolean success = item.incrementActual(quantity);
        if (!success) {
            throw new AuthException(
                    "'" + item.getProductName() + "' đã đủ số lượng (" +
                            item.getQuantityActual() + "/" + item.getQuantityRequired() +
                            "). Không thể quét thêm.");
        }
        voucher.setUpdatedAt(LocalDateTime.now());

        return toDTO(stockVoucherRepository.save(voucher));
    }

    // ================================================================
    // 5. CẬP NHẬT SỐ LƯỢNG THỦ CÔNG (không quét mã)
    // ================================================================

    /**
     * Staff nhập thủ công số lượng cho 1 item (thay vì quét nhiều lần).
     *
     * @param productCode Mã sản phẩm cần cập nhật
     * @param quantity    Số lượng thực tế nhập tay
     */
    public StockVoucherDTO updateItemManually(String tenantId, String voucherId, String productCode, int quantity) {
        StockVoucher voucher = getVoucherEntity(tenantId, voucherId);

        if (!"PROCESSING".equals(voucher.getStatus())) {
            throw new AuthException("Phiếu chưa được bắt đầu. Không thể cập nhật số lượng.");
        }

        if (quantity < 0) {
            throw new AuthException("Số lượng không được âm");
        }

        VoucherItem item = voucher.findItemByProductCode(productCode);
        if (item == null) {
            throw new AuthException("Sản phẩm '" + productCode + "' không tìm thấy trong phiếu");
        }

        item.setActualManually(quantity);
        voucher.setUpdatedAt(LocalDateTime.now());

        return toDTO(stockVoucherRepository.save(voucher));
    }

    // ================================================================
    // 6. HOÀN TẤT PHIẾU → Cập nhật tồn kho
    // ================================================================

    /**
     * Staff bấm "Hoàn tất Phiếu".
     * Hệ thống tự động:
     * 1. Validate tất cả items đã completed
     * 2. Cập nhật Product.currentStock (+ nhập, - xuất)
     * 3. Chuyển status → COMPLETED
     * 4. Ghi completedAt
     */
    public StockVoucherDTO completeVoucher(String tenantId, String voucherId, String staffUserId) {
        StockVoucher voucher = getVoucherEntity(tenantId, voucherId);

        if (!"PROCESSING".equals(voucher.getStatus())) {
            throw new AuthException("Phiếu phải ở trạng thái 'Đang xử lý' mới có thể hoàn tất");
        }

        if (!voucher.isAllItemsCompleted()) {
            int completed = voucher.getCompletedItems();
            int total = voucher.getTotalItems();
            throw new AuthException(
                    "Còn " + (total - completed) + "/" + total + " mặt hàng chưa hoàn tất. Vui lòng quét đủ số lượng.");
        }

        // ── Cập nhật tồn kho cho từng item ──────────────────────────
        // ── Cập nhật tồn kho và Giá vốn cho từng item ────────────────
        // Kế toán cần số liệu này cho báo cáo WAC và COGS (V.2)
        for (VoucherItem item : voucher.getItems()) {
            
            
            
            updateProductFinancials(tenantId, item.getProductCode(), item.getQuantityActual(), voucher.getType());
        }
        // Ở thực tế, item trong phiếu nhập nên mang theo 'unitPrice' từ NCC

        // ── Cập nhật trạng thái phiếu ────────────────────────────────
        voucher.setStatus("COMPLETED");
        voucher.setProcessedBy(staffUserId);
        voucher.setCompletedAt(LocalDateTime.now());
        voucher.setUpdatedAt(LocalDateTime.now());

        StockVoucher saved = stockVoucherRepository.save(voucher);

        System.out.printf("✅ Phiếu %s hoàn tất bởi %s lúc %s%n",
        voucher.getVoucherCode(),
                staffUserId,
                voucher.getCompletedAt());

                // ── ĐỒNG BỘ TRẠNG THÁI ĐƠN HÀNG (Nếu là phiếu xuất của đơn hàng) ──
        if ("OUTBOUND".equals(voucher.getType()) && voucher.getTitle() != null && voucher.getTitle().startsWith("Xuất hàng cho Đơn ")) {
            String orderCode = voucher.getTitle().replace("Xuất hàng cho Đơn ", "").trim();
            salesOrderRepository.findByTenantIdAndOrderCode(tenantId, orderCode).ifPresent(order -> {
                order.setStatus("COMPLETED");
                order.setUpdatedAt(LocalDateTime.now());
                salesOrderRepository.save(order);
            });
        }
        
        // Ghi log chi tiết phục vụ Audit Log (I.3) cho Kế toán
        System.out.printf("📋 AUDIT: Phiếu %s (%s) hoàn tất bởi %s. Trạng thái tài chính: Đã cập nhật giá vốn.%n",
                voucher.getType(),
                voucher.getVoucherCode(),
                staffUserId);

        return toDTO(saved);
    }

    // ================================================================
    // 7. HỦY PHIẾU KHO (Dành cho Manager và Owner)
    // ================================================================

    /**
     * Hủy phiếu nhập/xuất kho khi lỡ tạo nhầm.
     * CHỈ MANAGER HOẶC OWNER mới có quyền thực hiện.
     * Không thể hủy phiếu đã COMPLETED.
     */
    public StockVoucherDTO cancelVoucher(String tenantId, String voucherId, String userId, String userRole) {
        // Kiểm tra phân quyền: Cho phép OWNER và MANAGER
        if (!"MANAGER".equalsIgnoreCase(userRole) && !"OWNER".equalsIgnoreCase(userRole)) {
            throw new AuthException("Từ chối truy cập: Chỉ Quản lý (MANAGER) hoặc Chủ kho (OWNER) mới có quyền hủy phiếu kho.");
        }

        StockVoucher voucher = getVoucherEntity(tenantId, voucherId);

        if ("COMPLETED".equals(voucher.getStatus())) {
            throw new AuthException("Không thể hủy phiếu kho đã hoàn tất thực tế (COMPLETED).");
        }

        voucher.setStatus("CANCELLED");
        // Ghi nhận ID của người đã thực hiện lệnh hủy
        voucher.setProcessedBy(userId); 
        voucher.setUpdatedAt(LocalDateTime.now());

        return toDTO(stockVoucherRepository.save(voucher));
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    /**
     * Cập nhật Product.currentStock sau khi hoàn tất phiếu.
     * Cập nhật Tồn kho và Giá vốn (WAC) sau khi hoàn tất phiếu.
     * INBOUND: +quantity (nhập vào kho)
     * OUTBOUND / TRANSFER: -quantity (lấy ra khỏi kho)
     */
    private void updateProductStock(String tenantId, String productCode, int quantity, String voucherType) {}

    private void updateProductFinancials(String tenantId, String productCode, int quantity, String voucherType) {
        Optional<Product> productOpt = productRepository.findByTenantIdAndProductCode(tenantId, productCode);
        if (productOpt.isEmpty()) {
            System.err.println("⚠️ Không tìm thấy sản phẩm: " + productCode + " — bỏ qua cập nhật tồn kho");
            return;
        }

        Product product = productOpt.get();
        int currentStock = product.getCurrentStock() != null ? product.getCurrentStock() : 0;
        double currentCost = product.getCost() != null ? product.getCost() : 0.0;

        if ("INBOUND".equals(voucherType)) {
            // Giả sử giá nhập mới lấy từ Product.cost hiện tại (hoặc từ VoucherItem.unitPrice nếu có)
            // Công thức Bình quân gia quyền (Weighted Average Cost)
            // New Cost = (Old Val + New Val) / (Old Qty + New Qty)
            double newInboundPrice = product.getCost(); // Mock: thực tế lấy từ phiếu nhập
            if (currentStock + quantity > 0) {
                double newCost = ((currentStock * currentCost) + (quantity * newInboundPrice)) / (currentStock + quantity);
                product.setCost(newCost);
            }
            product.setCurrentStock(currentStock + quantity);
        } else {
            // OUTBOUND hoặc TRANSFER
            // OUTBOUND: Không tính lại giá vốn, nhưng Kế toán sẽ dùng giá vốn hiện tại để tính COGS
            // COGS = currentCost * quantity
            int newStock = currentStock - quantity;
            if (newStock < 0) {
                throw new AuthException(
                        "Tồn kho không đủ cho SP '" + productCode +
                                "': hiện có " + currentStock + ", cần xuất " + quantity);
            }
            product.setCurrentStock(newStock);
        }

        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    /**
     * Lấy StockVoucher entity (throw nếu không tồn tại hoặc sai tenant).
     */
    private StockVoucher getVoucherEntity(String tenantId, String voucherId) {
        return stockVoucherRepository
                .findByIdAndTenantId(voucherId, tenantId)
                .orElseThrow(() -> new AuthException("Phiếu không tồn tại hoặc không thuộc workspace này"));
    }

    /**
     * Chuyển StockVoucher model → StockVoucherDTO cho frontend.
     */
    private StockVoucherDTO toDTO(StockVoucher voucher) {
        return StockVoucherDTO.builder()
                .id(voucher.getId())
                .voucherCode(voucher.getVoucherCode())
                .type(voucher.getType())
                .status(voucher.getStatus())
                .title(voucher.getTitle())
                .priority(voucher.getPriority())
                .destination(voucher.getDestination())
                .notes(voucher.getNotes())
                .items(voucher.getItems())
                .totalItems(voucher.getTotalItems())
                .completedItems(voucher.getCompletedItems())
                .totalQuantityRequired(voucher.getTotalQuantityRequired())
                .createdBy(voucher.getCreatedBy())
                .createdAt(voucher.getCreatedAt())
                .startedAt(voucher.getStartedAt())
                .completedAt(voucher.getCompletedAt())
                .build();
    }
}
