package com.optistock.backend.service;

import com.optistock.backend.model.Customer;
import com.optistock.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers(String tenantId) {
        return customerRepository.findByTenantId(tenantId);
    }

    public Customer createCustomer(Customer customer, String tenantId) {
        customer.setTenantId(tenantId);
        
        if (customer.getCreatedAt() == null) {
            customer.setCreatedAt(LocalDateTime.now());
        }
        customer.setUpdatedAt(LocalDateTime.now());
        
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(String id, Customer updatedCustomer, String tenantId, String userRole) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        if (!existing.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Không có quyền chỉnh sửa");
        }
        
        // Debug log để kiểm tra dữ liệu nhận được từ Controller có bị null không
        System.out.println("Dữ liệu gửi lên Update: Tên=" + updatedCustomer.getName() 
                + ", SĐT=" + updatedCustomer.getPhone());

        // Cập nhật an toàn (Partial Update): Chỉ ghi đè khi có dữ liệu mới truyền lên
        if (updatedCustomer.getName() != null && !updatedCustomer.getName().isBlank()) {
            existing.setName(updatedCustomer.getName());
        }
        
        // Bỏ isBlank() để cho phép Frontend truyền chuỗi rỗng ("") nếu muốn xóa SĐT/Email
        if (updatedCustomer.getPhone() != null) {
            existing.setPhone(updatedCustomer.getPhone());
        }
        if (updatedCustomer.getEmail() != null) {
            existing.setEmail(updatedCustomer.getEmail());
        }
        
        // Bổ sung thêm trường Địa chỉ (đang có ở Frontend)
        if (updatedCustomer.getAddress() != null) {
            existing.setAddress(updatedCustomer.getAddress());
        }
        
        // Phân quyền: Kiểm tra nếu có sự thay đổi hạn mức công nợ
        if (updatedCustomer.getCreditLimit() != existing.getCreditLimit()) {
            boolean canUpdateCreditLimit = "OWNER".equalsIgnoreCase(userRole) || 
                                           "MANAGER".equalsIgnoreCase(userRole) || 
                                           "ACCOUNTANT".equalsIgnoreCase(userRole);
            if (!canUpdateCreditLimit) {
                throw new RuntimeException("Từ chối truy cập: Nhân viên bán hàng (SALE) không được phép thay đổi hạn mức công nợ.");
            }
            existing.setCreditLimit(updatedCustomer.getCreditLimit());
        }
        
        existing.setUpdatedAt(LocalDateTime.now());
        return customerRepository.save(existing);
    }

    public void deleteCustomer(String id, String tenantId) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        if (existing.getTenantId().equals(tenantId)) {
            customerRepository.delete(existing);
        }
    }
}