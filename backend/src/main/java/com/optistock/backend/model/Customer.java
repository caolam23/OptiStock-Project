package com.optistock.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    private String id;

    @Indexed
    private String tenantId; // Mã Workspace chứa khách hàng này

    private String name;
    private String phone;
    private String email;
    private String address;
    @Builder.Default
    private double totalDebt = 0.0; // Dư nợ hiện tại

    @Builder.Default
    private double creditLimit = 0.0; // Hạn mức tín dụng cho phép

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
}