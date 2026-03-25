package com.optistock.backend.controller;

import com.optistock.backend.model.Customer;
import com.optistock.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // Lấy danh sách khách hàng thuộc kho (Tenant) hiện tại
    @GetMapping
    public ResponseEntity<List<Customer>> getCustomers(@RequestHeader("X-Workspace-Id") String tenantId) {
        return ResponseEntity.ok(customerService.getAllCustomers(tenantId));
    }

    // Tạo mới khách hàng vào kho (Tenant) hiện tại
    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @RequestHeader("X-Workspace-Id") String tenantId,
            @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.createCustomer(customer, tenantId));
    }

    // Cập nhật khách hàng
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@RequestHeader("X-Workspace-Id") String tenantId,
                                                   @PathVariable String id,
                                                   @RequestBody Customer customer,
                                                   @RequestHeader(value = "X-Workspace-Role", defaultValue = "") String userRole) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customer, tenantId, userRole));
    }

    // Xóa khách hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@RequestHeader("X-Workspace-Id") String tenantId, @PathVariable String id) {
        customerService.deleteCustomer(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}