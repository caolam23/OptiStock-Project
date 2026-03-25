package com.optistock.backend.repository;

import com.optistock.backend.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {
    List<Customer> findByTenantId(String tenantId);
}