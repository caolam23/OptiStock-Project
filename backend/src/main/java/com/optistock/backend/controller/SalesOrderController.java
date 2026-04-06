package com.optistock.backend.controller;

import com.optistock.backend.dto.ProductAvailabilityDTO;
import com.optistock.backend.model.SalesOrder;
import com.optistock.backend.service.SalesOrderService;
import com.optistock.backend.util.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sale")
public class SalesOrderController {

    @Autowired
    private SalesOrderService salesOrderService;

    // 1. Lấy danh sách đơn hàng
    @GetMapping("/orders")
    public ResponseEntity<List<SalesOrder>> getOrders(@RequestHeader("X-Workspace-Id") String tenantId) {
        return ResponseEntity.ok(salesOrderService.getOrders(tenantId));
    }

    // 2. Tạo đơn hàng mới
    @PostMapping("/orders")
    public ResponseEntity<SalesOrder> createOrder(
            @RequestHeader("X-Workspace-Id") String tenantId,
            @RequestBody SalesOrder order) {
        return ResponseEntity.ok(salesOrderService.createOrder(order, tenantId));
    }

    // Cập nhật lại thông tin đơn hàng (Dành cho Sale khi đơn bị từ chối)
    @PutMapping("/orders/{id}")
    public ResponseEntity<SalesOrder> updateOrderDetails(
            @RequestHeader("X-Workspace-Id") String tenantId,
            @RequestHeader(value = "X-Workspace-Role", defaultValue = "") String headerRole,
            @PathVariable String id,
            @RequestBody SalesOrder updatedOrder) {

        String userRole = WorkspaceContext.getCurrentWorkspaceRole();
        if (userRole == null || userRole.isBlank()) {
            userRole = headerRole;
        }

        return ResponseEntity.ok(salesOrderService.updateOrderDetails(id, updatedOrder, tenantId, userRole));
    }

    // Cập nhật trạng thái đơn hàng
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<SalesOrder> updateOrderStatus(
            @RequestHeader("X-Workspace-Id") String tenantId,
            @RequestHeader(value = "X-Workspace-Role", defaultValue = "") String headerRole,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String userRole = WorkspaceContext.getCurrentWorkspaceRole();

        // Fallback: Nếu Context chưa lấy được role (trả về null), ta dùng tạm giá trị từ Header
        if (userRole == null || userRole.isBlank()) {
            userRole = headerRole;
        }

        return ResponseEntity.ok(salesOrderService.updateOrderStatus(id, body.get("status"), tenantId, userRole));
    }

    // 3. API Check tồn kho sản phẩm (ATP)
    @GetMapping("/products/{productId}/availability")
    public ResponseEntity<?> checkProductAvailability(
            @RequestHeader("X-Workspace-Id") String tenantId, @PathVariable String productId) {
        return ResponseEntity.ok(salesOrderService.checkProductAvailability(tenantId, productId));
    }

    // 4. API Lấy toàn bộ Tồn kho khả dụng cho trang Available Stock
    @GetMapping("/products/availability")
    public ResponseEntity<List<ProductAvailabilityDTO>> getAllProductsAvailability(
            @RequestHeader("X-Workspace-Id") String tenantId) {
        return ResponseEntity.ok(salesOrderService.getAllProductsAvailability(tenantId));
    }
}