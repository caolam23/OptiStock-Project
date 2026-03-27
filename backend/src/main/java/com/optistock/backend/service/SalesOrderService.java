package com.optistock.backend.service;

import com.optistock.backend.dto.CommittedStockResult;
import com.optistock.backend.dto.ProductAvailabilityDTO;
import com.optistock.backend.dto.SaleDashboardStatsDTO;
import com.optistock.backend.model.Customer;
import com.optistock.backend.model.Product;
import com.optistock.backend.repository.CustomerRepository;
import com.optistock.backend.model.SalesOrder;
import com.optistock.backend.model.SalesOrderItem;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.model.VoucherItem;
import com.optistock.backend.repository.ProductRepository;
import com.optistock.backend.repository.SalesOrderRepository;
import com.optistock.backend.repository.StockVoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesOrderService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockVoucherRepository stockVoucherRepository;

    public List<SalesOrder> getOrders(String tenantId) {
        return salesOrderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public SalesOrder createOrder(SalesOrder order, String tenantId) {
        order.setTenantId(tenantId);
        // Tự động tạo mã đơn hàng ngẫu nhiên (VD: SO-16987...)
        order.setOrderCode("SO-" + System.currentTimeMillis());
        order.setStatus("PENDING_APPROVAL"); // Thay đổi trạng thái ban đầu là Chờ duyệt
        
        // Tính tổng tiền đơn hàng
        double total = 0;
        if (order.getItems() != null) {
            for (SalesOrderItem item : order.getItems()) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong hệ thống"));

                // KIỂM TRA TỒN KHO KHẢ DỤNG (ATP) TRƯỚC KHI TẠO ĐƠN
                int committedStock = salesOrderRepository.calculateCommittedStock(tenantId, product.getId())
                        .map(CommittedStockResult::getCommittedStock)
                        .orElse(0);
                int currentStock = product.getCurrentStock() != null ? product.getCurrentStock() : 0;
                int atp = currentStock - committedStock;

                if (atp < item.getQuantity()) {
                    throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' không đủ hàng khả dụng để lên đơn. Yêu cầu: " + item.getQuantity() + ", Khả dụng: " + Math.max(0, atp));
                }

                // KIỂM TRA ĐƠN GIÁ BÁN KHÔNG ĐƯỢC THẤP HƠN GIÁ SÀN (SUGGESTED MIN PRICE)
                double suggestedMinPrice = calculateSuggestedMinPrice(product);
                if (item.getUnitPrice() < suggestedMinPrice) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn giá của sản phẩm '" + product.getProductName() + "' thấp hơn mức giá sàn cho phép (" + String.format("%,.0f", suggestedMinPrice) + ").");
                }

                total += (item.getQuantity() * item.getUnitPrice());
            }
        }
        order.setTotalAmount(total);

        // Kiểm tra hạn mức công nợ Khách Hàng (chưa ghi nợ tại thời điểm tạo đơn)
        if (order.getCustomerName() != null) {
            List<Customer> customers = customerRepository.findByTenantId(tenantId);
            Customer matchedCustomer = customers.stream()
                    .filter(c -> order.getCustomerName().equals(c.getName()))
                    .findFirst()
                    .orElse(null);
            
            if (matchedCustomer != null) {
                if (matchedCustomer.getCreditLimit() > 0 && total > matchedCustomer.getCreditLimit()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khách hàng đã vượt hạn mức công nợ. Không thể tạo đơn!");
                }
                // Không tự động cập nhật totalDebt tại thời điểm tạo đơn, chỉ khi duyệt
            }
        }

        order.setCreatedAt(LocalDateTime.now());
        
        return salesOrderRepository.save(order);
    }

    public SalesOrder updateOrderStatus(String id, String status, String tenantId, String userRole) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Phân quyền bảo mật: Cho phép OWNER và MANAGER duyệt đơn
        boolean isApprovalAction = "PROCESSING".equals(status) || "REJECTED".equals(status);
        if (!"OWNER".equalsIgnoreCase(userRole) && !"MANAGER".equalsIgnoreCase(userRole) && isApprovalAction) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Từ chối truy cập: Chỉ Chủ kho (OWNER) hoặc Quản lý (MANAGER) mới có quyền duyệt đơn hàng.");
        }

        // Nếu bị TỪ CHỐI (REJECTED) hoặc HỦY (CANCELLED) -> Hoàn lại công nợ (chỉ khi đơn đã được duyệt/đang xử lý trước đó)
        if (("REJECTED".equals(status) || "CANCELLED".equals(status)) && !order.getStatus().equals(status)) {
            boolean hasCommittedDebt = "PROCESSING".equals(order.getStatus());
            if (hasCommittedDebt && order.getCustomerName() != null) {
                List<Customer> customers = customerRepository.findByTenantId(tenantId);
                Customer matchedCustomer = customers.stream()
                        .filter(c -> order.getCustomerName().equals(c.getName()))
                        .findFirst()
                        .orElse(null);
                
                if (matchedCustomer != null) {
                    // Trừ đi số tiền của đơn hàng đã hủy (nếu trước đó đã ghi công nợ)
                    double newDebt = (matchedCustomer.getTotalDebt() != 0.0 ? matchedCustomer.getTotalDebt() : 0) - (order.getTotalAmount() != 0.0 ? order.getTotalAmount() : 0);
                    matchedCustomer.setTotalDebt(Math.max(0, newDebt));
                    customerRepository.save(matchedCustomer);
                }
            }
            
            // TỰ ĐỘNG HỦY PHIẾU XUẤT KHO (StockVoucher)
            // Tìm các phiếu xuất kho đang PENDING hoặc PROCESSING của tenant này
            List<StockVoucher> activeVouchers = stockVoucherRepository.findByTenantIdAndTypeAndStatusIn(
                    tenantId, "OUTBOUND", Arrays.asList("PENDING", "PROCESSING"));
            
            String targetTitle = "Xuất hàng cho Đơn " + order.getOrderCode();
            for (StockVoucher voucher : activeVouchers) {
                if (targetTitle.equals(voucher.getTitle())) {
                    voucher.setStatus("CANCELLED");
                    voucher.setNotes(voucher.getNotes() + " (Hệ thống tự động hủy do đơn hàng gốc bị hủy).");
                    voucher.setUpdatedAt(LocalDateTime.now());
                    stockVoucherRepository.save(voucher);
                }
            }
        }

        // MANAGER DUYỆT ĐƠN -> ĐANG XỬ LÝ (PROCESSING) -> TẠO PHIẾU XUẤT KHO CHO STAFF
        if ("PROCESSING".equals(status) && !"PROCESSING".equals(order.getStatus())) {

            // Chỉ ghi công nợ khi đơn chính thức được duyệt (từ PENDING_APPROVAL -> PROCESSING)
            if (order.getCustomerName() != null) {
                List<Customer> customers = customerRepository.findByTenantId(tenantId);
                Customer matchedCustomer = customers.stream()
                        .filter(c -> order.getCustomerName().equals(c.getName()))
                        .findFirst()
                        .orElse(null);

                if (matchedCustomer != null) {
                    double currentDebt = matchedCustomer.getTotalDebt() != 0.0 ? matchedCustomer.getTotalDebt() : 0;
                    double orderAmount = order.getTotalAmount() != 0.0 ? order.getTotalAmount() : 0;
                    if (matchedCustomer.getCreditLimit() > 0 && (currentDebt + orderAmount > matchedCustomer.getCreditLimit())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khách hàng đã vượt hạn mức công nợ. Không thể duyệt đơn!");
                    }
                    matchedCustomer.setTotalDebt(currentDebt + orderAmount);
                    customerRepository.save(matchedCustomer);
                }
            }

            // TẠO PHIẾU XUẤT KHO (Dựa theo model StockVoucher)
            StockVoucher voucher = new StockVoucher();
            voucher.setTenantId(tenantId);
            voucher.setVoucherCode("PX-" + System.currentTimeMillis());
            voucher.setType("OUTBOUND"); // Loại: Xuất kho
            voucher.setStatus("PENDING"); // Trạng thái: Chờ Staff xử lý
            voucher.setTitle("Xuất hàng cho Đơn " + order.getOrderCode());
            voucher.setPriority("NORMAL"); // Mức độ ưu tiên mặc định
            voucher.setDestination("Khách hàng: " + order.getCustomerName()); // Nơi nhận
            voucher.setNotes("Hệ thống tự động sinh phiếu khi Manager duyệt đơn."); // Ghi chú

            List<VoucherItem> vItems = new ArrayList<>();
            if (order.getItems() != null) {
                for (SalesOrderItem item : order.getItems()) {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy sản phẩm với ID " + item.getProductId()));
                            
                    VoucherItem vi = new VoucherItem();
                    vi.setProductId(product.getId());
                    vi.setProductCode(product.getProductCode());
                    vi.setProductName(product.getProductName());
                    vi.setQuantityRequired(item.getQuantity()); // Số lượng yêu cầu nhặt
                    vi.setQuantityActual(0); // Bắt đầu ở kho là 0 (Chưa quét)
                    vItems.add(vi);
                }
            }
            voucher.setItems(vItems);
            stockVoucherRepository.save(voucher);
        }

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return salesOrderRepository.save(order);
    }

    // Cập nhật thông tin đơn hàng (dùng khi Sale muốn sửa lại đơn bị TỪ CHỐI)
    public SalesOrder updateOrderDetails(String id, SalesOrder updatedOrder, String tenantId, String userRole) {
        SalesOrder existingOrder = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!tenantId.equals(existingOrder.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập đơn hàng này");
        }

        // --- 🔒 BẢO MẬT BACKEND: Chặn SALE sửa đơn của người khác ---
        if ("SALE".equalsIgnoreCase(userRole)) {
            String requestUserId = updatedOrder.getUserId() != null ? updatedOrder.getUserId() : updatedOrder.getCreatedBy();
            String originalUserId = existingOrder.getUserId() != null ? existingOrder.getUserId() : existingOrder.getCreatedBy();
            
            if (requestUserId != null && originalUserId != null && !originalUserId.equals(requestUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Từ chối truy cập: Nhân viên bán hàng (SALE) chỉ có thể chỉnh sửa đơn hàng của chính mình.");
            }
        }

        if (!"REJECTED".equals(existingOrder.getStatus()) && !"PENDING_APPROVAL".equals(existingOrder.getStatus())) {
            throw new RuntimeException("Chỉ có thể chỉnh sửa đơn hàng khi bị từ chối hoặc đang chờ duyệt.");
        }

        double oldTotal = existingOrder.getTotalAmount() != 0.0 ? existingOrder.getTotalAmount() : 0.0;
        boolean isCurrentlyPending = "PENDING_APPROVAL".equals(existingOrder.getStatus());
        
        Customer matchedCustomer = null;
        if (existingOrder.getCustomerName() != null) {
            matchedCustomer = customerRepository.findByTenantId(tenantId).stream()
                    .filter(c -> existingOrder.getCustomerName().equals(c.getName()))
                    .findFirst().orElse(null);
        }

        // Nếu đơn đang chờ duyệt, không tác động công nợ tại bước chỉnh sửa (công nợ cập nhật khi duyệt)
        // Tính tổng tiền mới 
        double newTotal = 0;
        if (updatedOrder.getItems() != null) {
            for (SalesOrderItem item : updatedOrder.getItems()) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong hệ thống"));
                        
                // KIỂM TRA ĐƠN GIÁ BÁN KHÔNG ĐƯỢC THẤP HƠN GIÁ SÀN (SUGGESTED MIN PRICE)
                double suggestedMinPrice = calculateSuggestedMinPrice(product);
                if (item.getUnitPrice() < suggestedMinPrice) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn giá của sản phẩm '" + product.getProductName() + "' thấp hơn mức giá sàn cho phép (" + String.format("%,.0f", suggestedMinPrice) + ").");
                }

                newTotal += (item.getQuantity() * item.getUnitPrice());
            }
        }

        existingOrder.setItems(updatedOrder.getItems());
        existingOrder.setTotalAmount(newTotal);

        // Chuyển đơn về PENDING_APPROVAL (lúc này chưa cập nhật công nợ, chỉ kiểm tra hạn mức)
        existingOrder.setStatus("PENDING_APPROVAL");
        if (matchedCustomer != null) {
            if (matchedCustomer.getCreditLimit() > 0 && newTotal > matchedCustomer.getCreditLimit()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khách hàng đã vượt hạn mức công nợ. Không thể cập nhật đơn!");
            }
            // Không lưu totalDebt lúc đang chờ duyệt
        }

        existingOrder.setUpdatedAt(LocalDateTime.now());
        return salesOrderRepository.save(existingOrder);
    }

    // Hàm hỗ trợ cho SaleDashboardController sử dụng DTO
    // (Nếu bạn có file SalesOrderRequestDTO, hãy đảm bảo đã import nó ở đầu file nhé)
    public SalesOrder createSalesOrder(String tenantId, String userId, Object requestDTO) {
        SalesOrder order = new SalesOrder();
        
        // TODO: Bạn cần tự map (chuyển đổi) dữ liệu từ requestDTO sang đối tượng order ở đây.
        // Ví dụ: order.setCustomerName(((SalesOrderRequestDTO) requestDTO).getCustomerName());

        return createOrder(order, tenantId); // Gọi lại hàm lưu có sẵn ở trên
    }

    /**
     * API thực tế để kiểm tra tồn kho và giá
     * @param tenantId ID của kho
     * @param productId ID của sản phẩm
     * @return DTO chứa thông tin tồn kho và giá
     */
    public ProductAvailabilityDTO checkProductAvailability(String tenantId, String productId) {
        // 1. Tìm sản phẩm trong DB
        // Tìm theo ID trước, nếu không thấy thì thử tìm theo Mã SKU (productCode)
        Product product = productRepository.findById(productId)
                .filter(p -> tenantId.equals(p.getTenantId()))
                .orElseGet(() -> productRepository.findByTenantIdAndProductCode(tenantId, productId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với Mã/ID: " + productId)));

        // 2. Tính toán số lượng hàng đã được đặt (committed) trong các đơn hàng chờ xử lý
        // Dùng ID thật của DB (product.getId()) thay vì chuỗi người dùng nhập để tính toán chính xác
        int committedStock = salesOrderRepository.calculateCommittedStock(tenantId, product.getId())
                .map(CommittedStockResult::getCommittedStock)
                .orElse(0);

        // 3. Tính toán Tồn kho khả dụng (Available to Promise)
        int currentStock = product.getCurrentStock() != null ? product.getCurrentStock() : 0;
        int availableToPromise = currentStock - committedStock;

        // 4. Tính toán các mức giá
        double price = product.getPrice() != null ? product.getPrice() : 0.0;
        double maxDiscount = product.getMaxDiscountPercent() != null ? product.getMaxDiscountPercent() : 0.0;
        double suggestedMinPrice = calculateSuggestedMinPrice(product);

        // 5. Xây dựng và trả về DTO cho Frontend
        return ProductAvailabilityDTO.builder()
                .productId(product.getId())
                .productName(product.getProductName())
                .productCode(product.getProductCode())
                .category(product.getCategory())
                .availableToPromise(Math.max(0, availableToPromise)) // Đảm bảo ATP không âm
                .price(price)
                .maxDiscountPercent(maxDiscount)
                .suggestedMinPrice(suggestedMinPrice)
                .build();
    }

    /**
     * API lấy danh sách Tồn kho khả dụng của TẤT CẢ sản phẩm trong kho
     * Dành cho Sale tra cứu nhanh
     */
    public List<ProductAvailabilityDTO> getAllProductsAvailability(String tenantId) {
        return productRepository.findAll().stream()
                .filter(p -> tenantId.equals(p.getTenantId()))
                .map(product -> {
                    int committedStock = salesOrderRepository.calculateCommittedStock(tenantId, product.getId())
                            .map(CommittedStockResult::getCommittedStock)
                            .orElse(0);
                    int currentStock = product.getCurrentStock() != null ? product.getCurrentStock() : 0;
                    int availableToPromise = currentStock - committedStock;

                    double price = product.getPrice() != null ? product.getPrice() : 0.0;
                    double maxDiscount = product.getMaxDiscountPercent() != null ? product.getMaxDiscountPercent() : 0.0;
                    double suggestedMinPrice = calculateSuggestedMinPrice(product);

                    return ProductAvailabilityDTO.builder()
                            .productId(product.getId())
                            .productName(product.getProductName())
                            .productCode(product.getProductCode())
                            .category(product.getCategory())
                            .availableToPromise(Math.max(0, availableToPromise))
                            .price(price)
                            .maxDiscountPercent(maxDiscount)
                            .suggestedMinPrice(suggestedMinPrice)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private double calculateSuggestedMinPrice(Product product) {
        double price = product.getPrice() != null ? product.getPrice() : 0.0;
        double maxDiscount = product.getMaxDiscountPercent() != null ? product.getMaxDiscountPercent() : 0.0;
        return price * (1 - (maxDiscount / 100.0));
    }

    /**
     * Lấy thống kê cho trang Sale Dashboard
     * Chỉ tính doanh thu cho các đơn hàng ĐÃ ĐƯỢC DUYỆT (PROCESSING, COMPLETED)
     */
    public SaleDashboardStatsDTO getSaleDashboardStats(String tenantId) {
        List<SalesOrder> orders = salesOrderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        
        double totalRevenue = 0;
        int pendingOrders = 0;
        int cancelledOrders = 0;

        for (SalesOrder order : orders) {
            String status = order.getStatus();
            // Chỉ tính doanh thu khi đơn hàng đã được quản lý duyệt và đi vào luồng xử lý
            if ("PROCESSING".equals(status) || "COMPLETED".equals(status)) {
                totalRevenue += order.getTotalAmount(); 
            } else if ("PENDING_APPROVAL".equals(status)) {
                pendingOrders++;
            } else if ("REJECTED".equals(status) || "CANCELLED".equals(status)) {
                cancelledOrders++;
            }
        }

        return SaleDashboardStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(orders.size())
                .pendingOrders(pendingOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }
}