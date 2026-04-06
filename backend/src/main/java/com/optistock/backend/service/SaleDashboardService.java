package com.optistock.backend.service;

import com.optistock.backend.dto.SaleDashboardStatsDTO;
import com.optistock.backend.model.SalesOrder;
import com.optistock.backend.repository.SalesOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleDashboardService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    public SaleDashboardStatsDTO getStats(String tenantId) {
        List<SalesOrder> orders = salesOrderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);

        double revenue = 0;
        int pending = 0;
        int cancelled = 0;

        for(SalesOrder o : orders) {
            if ("APPROVED".equals(o.getStatus())) {
                revenue += o.getTotalAmount();
            } else if ("PENDING_APPROVAL".equals(o.getStatus())) {
                pending++;
            } else if ("CANCELLED".equals(o.getStatus())) {
                cancelled++;
            }
        }

        return SaleDashboardStatsDTO.builder()
                .totalOrders(orders.size())
                .totalRevenue(revenue)
                .pendingOrders(pending)
                .cancelledOrders(cancelled)
                .build();
    }
}