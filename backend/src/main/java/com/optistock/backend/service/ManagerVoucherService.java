package com.optistock.backend.service;

import com.optistock.backend.dto.CreateVoucherRequest;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.StockVoucher;
import com.optistock.backend.model.VoucherItem;
import com.optistock.backend.repository.StockVoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ManagerVoucherService — nền móng cho role Manager.
 * TODO: Bạn implement createVoucher, updateVoucher, deleteVoucher ở đây.
 */
@Service
public class ManagerVoucherService {

    @Autowired
    private StockVoucherRepository stockVoucherRepository;

    /** Lấy tất cả phiếu nhập/xuất của workspace */
    public List<StockVoucher> getVouchers(String tenantId) {
        return stockVoucherRepository.findByTenantId(tenantId);
    }

    /** Lấy chi tiết 1 phiếu */
    public StockVoucher getVoucher(String tenantId, String voucherId) {
        return stockVoucherRepository
                .findByIdAndTenantId(voucherId, tenantId)
                .orElseThrow(() -> new AuthException("Phiếu không tìm thấy"));
    }

    // TODO: deleteVoucher(...)

    /**
     * Tạo phiếu nhập/xuất mới.
     * - Tự động sinh VoucherCode: PN-001, PX-055...
     * - Status mặc định: PENDING
     * - CreatedBy: userId của Manager
     */
    public StockVoucher createVoucher(String tenantId, String userId, CreateVoucherRequest req) {
        // Validate
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new AuthException("Phếu phải có ít nhất 1 sản phẩm");
        }
        if (req.getType() == null || (!req.getType().equals("INBOUND") && !req.getType().equals("OUTBOUND"))) {
            throw new AuthException("Loại phiếu phải là INBOUND hoặc OUTBOUND");
        }

        // Sinh mã phiếu: PN-001 (INBOUND) hoặc PX-001 (OUTBOUND)
        String prefix = "INBOUND".equals(req.getType()) ? "PN" : "PX";
        long count = stockVoucherRepository.findByTenantId(tenantId).stream()
                .filter(v -> v.getVoucherCode() != null && v.getVoucherCode().startsWith(prefix))
                .count();
        String voucherCode = String.format("%s-%03d", prefix, count + 1);

        // Build items
        List<VoucherItem> items = req.getItems().stream().map(itemReq -> {
            if (itemReq.getQuantityRequired() == null || itemReq.getQuantityRequired() <= 0) {
                throw new AuthException("Số lượng phải lớn hơn 0");
            }
            return VoucherItem.builder()
                    .productCode(itemReq.getProductCode())
                    .productName(itemReq.getProductName())
                    .productVariant(itemReq.getProductVariant())
                    .locationCode(itemReq.getLocationCode())
                    .quantityRequired(itemReq.getQuantityRequired())
                    .quantityActual(0)
                    .build();
        }).collect(Collectors.toList());

        // Build phiếu
        StockVoucher voucher = StockVoucher.builder()
                .tenantId(tenantId)
                .voucherCode(voucherCode)
                .type(req.getType())
                .title(req.getTitle())
                .priority(req.getPriority() != null ? req.getPriority() : "NORMAL")
                .destination(req.getDestination())
                .notes(req.getNotes())
                .items(items)
                .createdBy(userId)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return stockVoucherRepository.save(voucher);
    }
}
