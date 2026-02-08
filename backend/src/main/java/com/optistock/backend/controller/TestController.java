package com.optistock.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép FE gọi vào
public class TestController {

    // API này chỉ để test kết nối, không cần Database
    @GetMapping("/test")
    public Map<String, String> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "KẾT NỐI THÀNH CÔNG! (Backend Java đang chạy)");
        response.put("status", "GOOD");
        return response;
    }
}