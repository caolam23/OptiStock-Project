package com.optistock.backend.service;

import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.StocktakeTicket;
import com.optistock.backend.repository.StocktakeTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ManagerStocktakeService — nền móng cho role Manager.
 * TODO: Bạn implement createTicket, deleteTicket ở đây.
 */
@Service
public class ManagerStocktakeService {

    @Autowired
    private StocktakeTicketRepository stocktakeTicketRepository;

    /** Lấy tất cả phiếu kiểm kê của workspace (kể cả SUBMITTED) */
    public List<StocktakeTicket> getTickets(String tenantId) {
        return stocktakeTicketRepository.findByTenantId(tenantId);
    }

    /** Lấy chi tiết phiếu kiểm kê (Manager thấy cả systemQuantity) */
    public StocktakeTicket getTicket(String tenantId, String ticketId) {
        return stocktakeTicketRepository
                .findByIdAndTenantId(ticketId, tenantId)
                .orElseThrow(() -> new AuthException("Phiếu kiểm kê không tìm thấy"));
    }

    // TODO: createTicket(...)
    // TODO: deleteTicket(...)
}
