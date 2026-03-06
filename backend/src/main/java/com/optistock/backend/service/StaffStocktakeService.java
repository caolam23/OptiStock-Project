package com.optistock.backend.service;

import com.optistock.backend.dto.StocktakeTicketDTO;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.StocktakeItem;
import com.optistock.backend.model.StocktakeTicket;
import com.optistock.backend.repository.StocktakeTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * StaffStocktakeService: Business logic cho chức năng kiểm kê của nhân viên.
 *
 * Luồng chính:
 * 1. getPendingTickets() → Danh sách phiếu kiểm kê chưa hoàn tất (PENDING +
 * IN_PROGRESS)
 * 2. getTicket() → Chi tiết phiếu (items ẨN systemQuantity)
 * 3. startTicket() → PENDING → IN_PROGRESS
 * 4. updateCount() → Staff nhập số lượng thực tế cho từng item
 * 5. submitTicket() → IN_PROGRESS → SUBMITTED + hệ thống tự tính chênh lệch
 */
@Service
public class StaffStocktakeService {

    @Autowired
    private StocktakeTicketRepository stocktakeTicketRepository;

    private static final List<String> ACTIVE_STATUSES = Arrays.asList("PENDING", "IN_PROGRESS");

    // ================================================================
    // 1. DASHBOARD — Danh sách phiếu kiểm kê chưa hoàn tất
    // ================================================================

    public List<StocktakeTicketDTO> getPendingTickets(String tenantId) {
        return stocktakeTicketRepository
                .findByTenantIdAndStatusIn(tenantId, ACTIVE_STATUSES)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ================================================================
    // 2. CHI TIẾT PHIẾU KIỂM KÊ
    // ================================================================

    public StocktakeTicketDTO getTicket(String tenantId, String ticketId) {
        StocktakeTicket ticket = getTicketEntity(tenantId, ticketId);
        return toDTO(ticket);
    }

    // ================================================================
    // 3. BẮT ĐẦU KIỂM KÊ
    // ================================================================

    public StocktakeTicketDTO startTicket(String tenantId, String ticketId, String staffUserId) {
        StocktakeTicket ticket = getTicketEntity(tenantId, ticketId);

        if (!"PENDING".equals(ticket.getStatus())) {
            throw new AuthException("Phiếu kiểm kê đang ở trạng thái '" + ticket.getStatus() + "', không thể bắt đầu");
        }

        ticket.setStatus("IN_PROGRESS");
        ticket.setAssignedTo(staffUserId);
        ticket.setStartedAt(LocalDateTime.now());

        return toDTO(stocktakeTicketRepository.save(ticket));
    }

    // ================================================================
    // 4. CẬP NHẬT SỐ LƯỢNG ĐẾM THỰC TẾ
    // ================================================================

    /**
     * Staff nhập số lượng đếm được cho 1 sản phẩm cụ thể.
     * Tự động lưu ngay (debounce ở phía frontend).
     *
     * @param productCode Mã sản phẩm cần cập nhật
     * @param actualCount Số lượng Staff đếm thực tế
     */
    public StocktakeTicketDTO updateCount(String tenantId, String ticketId, String productCode, int actualCount) {
        StocktakeTicket ticket = getTicketEntity(tenantId, ticketId);

        if (!"IN_PROGRESS".equals(ticket.getStatus())) {
            throw new AuthException("Phiếu chưa được bắt đầu. Hãy bấm 'Bắt đầu kiểm kê' trước.");
        }

        // Tìm item theo productCode
        StocktakeItem item = ticket.getItems().stream()
                .filter(i -> productCode.equals(i.getProductCode()))
                .findFirst()
                .orElseThrow(
                        () -> new AuthException("Sản phẩm '" + productCode + "' không có trong phiếu kiểm kê này"));

        if (actualCount < 0) {
            throw new AuthException("Số lượng không được âm");
        }

        item.setActualQuantity(actualCount);
        return toDTO(stocktakeTicketRepository.save(ticket));
    }

    // ================================================================
    // 5. GỬI BÁO CÁO KIỂM KÊ
    // ================================================================

    /**
     * Staff bấm "Gửi báo cáo kiểm kê".
     * Hệ thống tự động:
     * 1. Validate tất cả items đã được nhập số lượng
     * 2. Tính chênh lệch (actual vs system) — ẨN khỏi Staff
     * 3. Chuyển status → SUBMITTED
     * 4. Ghi submittedAt và submittedBy
     * Manager sẽ thấy kết quả chênh lệch trên trang Kiểm kê của Admin
     */
    public StocktakeTicketDTO submitTicket(String tenantId, String ticketId, String staffUserId) {
        StocktakeTicket ticket = getTicketEntity(tenantId, ticketId);

        if (!"IN_PROGRESS".equals(ticket.getStatus())) {
            throw new AuthException("Phiếu phải ở trạng thái 'Đang kiểm kê' mới có thể gửi báo cáo");
        }

        // Validate tất cả items đã được nhập
        if (!ticket.isAllCounted()) {
            int counted = ticket.getCountedItems();
            int total = ticket.getTotalItems();
            throw new AuthException(
                    "Còn " + (total - counted) + "/" + total + " sản phẩm chưa nhập số lượng. Vui lòng kiểm tra lại.");
        }

        // Hệ thống tự tính chênh lệch (ngầm, Staff không thấy)
        ticket.calculateAllDiscrepancies();

        int discrepancyCount = ticket.getDiscrepancyCount();

        // Cập nhật trạng thái
        ticket.setStatus("SUBMITTED");
        ticket.setSubmittedBy(staffUserId);
        ticket.setSubmittedAt(LocalDateTime.now());

        StocktakeTicket saved = stocktakeTicketRepository.save(ticket);

        // Log để Manager kiểm tra
        System.out.printf("📋 Phiếu kiểm kê %s đã gửi bởi %s | Chênh lệch: %d/%d items%n",
                ticket.getTicketCode(), staffUserId, discrepancyCount, ticket.getTotalItems());

        return toDTO(saved);
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private StocktakeTicket getTicketEntity(String tenantId, String ticketId) {
        return stocktakeTicketRepository
                .findByIdAndTenantId(ticketId, tenantId)
                .orElseThrow(() -> new AuthException("Phiếu kiểm kê không tồn tại hoặc không thuộc workspace này"));
    }

    /**
     * Convert StocktakeTicket → DTO, ẨN systemQuantity khỏi Staff.
     * Staff chỉ thấy: productCode, productName, locationCode, actualQuantity.
     */
    private StocktakeTicketDTO toDTO(StocktakeTicket ticket) {
        List<StocktakeTicketDTO.StocktakeItemStaffView> itemViews = ticket.getItems().stream()
                .map(item -> StocktakeTicketDTO.StocktakeItemStaffView.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productCode(item.getProductCode())
                        .locationCode(item.getLocationCode())
                        .actualQuantity(item.getActualQuantity())
                        .isCounted(item.isCounted())
                        .build())
                .collect(Collectors.toList());

        return StocktakeTicketDTO.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .title(ticket.getTitle())
                .status(ticket.getStatus())
                .locationCode(ticket.getLocationCode())
                .items(itemViews)
                .totalItems(ticket.getTotalItems())
                .countedItems(ticket.getCountedItems())
                .createdAt(ticket.getCreatedAt())
                .startedAt(ticket.getStartedAt())
                .submittedAt(ticket.getSubmittedAt())
                .build();
    }
}
