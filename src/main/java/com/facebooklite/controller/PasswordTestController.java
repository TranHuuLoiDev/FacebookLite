package com.facebooklite.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password")
public class PasswordTestController {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * API để mã hóa password
     * POST http://localhost:8080/api/password/encode
     * Body: { "password": "password123" }
     */
    @PostMapping("/encode")
    public ResponseEntity<?> encodePassword(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        String encodedPassword = passwordEncoder.encode(plainPassword);
        
        Map<String, String> response = new HashMap<>();
        response.put("plainPassword", plainPassword);
        response.put("encodedPassword", encodedPassword);
        response.put("note", "Mỗi lần mã hóa sẽ cho ra kết quả khác nhau (BCrypt tự động thêm salt)");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * API để kiểm tra password có khớp với hash không
     * POST http://localhost:8080/api/password/verify
     * Body: { 
     *   "plainPassword": "password123", 
     *   "encodedPassword": "$2a$10$X5wFWKx4Ot0/P7i8ykRBIOKcgTl9GdQPTJkZ6oY3NlL0k2Rnj8h7m" 
     * }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("plainPassword");
        String encodedPassword = request.get("encodedPassword");
        
        boolean isMatch = passwordEncoder.matches(plainPassword, encodedPassword);
        
        Map<String, Object> response = new HashMap<>();
        response.put("plainPassword", plainPassword);
        response.put("encodedPassword", encodedPassword);
        response.put("isMatch", isMatch);
        response.put("message", isMatch ? "✅ Password khớp!" : "❌ Password không khớp!");
        
        return ResponseEntity.ok(response);
    }
}
