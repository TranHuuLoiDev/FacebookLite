package com.facebooklite.controller;

import com.facebooklite.model.Message;
import com.facebooklite.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            Long senderId = Long.valueOf(request.get("senderId").toString());
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String content = request.get("content").toString();
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nội dung tin nhắn không được để trống"));
            }
            
            Message message = messageService.sendMessage(senderId, receiverId, content);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", message.getId());
            response.put("content", message.getContent());
            response.put("senderId", message.getSenderId());
            response.put("receiverId", message.getReceiverId());
            response.put("isRead", message.getIsRead());
            response.put("createdAt", message.getCreatedAt());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "senderId và receiverId phải là số"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId1, @PathVariable Long userId2) {
        try {
            List<Message> messages = messageService.getConversation(userId1, userId2);
            
            List<Map<String, Object>> response = messages.stream().map(msg -> {
                Map<String, Object> msgMap = new HashMap<>();
                msgMap.put("id", msg.getId());
                msgMap.put("content", msg.getContent());
                msgMap.put("imageUrl", msg.getImageUrl());
                msgMap.put("senderId", msg.getSenderId());
                msgMap.put("receiverId", msg.getReceiverId());
                msgMap.put("isRead", msg.getIsRead());
                msgMap.put("createdAt", msg.getCreatedAt());
                return msgMap;
            }).toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<?> getConversationList(@PathVariable Long userId) {
        try {
            List<Map<String, Object>> conversations = messageService.getConversationList(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/mark-read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        try {
            messageService.markAsRead(messageId);
            return ResponseEntity.ok(Map.of("message", "Đã đánh dấu là đã đọc"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/mark-conversation-read/{userId}/{partnerId}")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long userId, @PathVariable Long partnerId) {
        try {
            messageService.markConversationAsRead(userId, partnerId);
            return ResponseEntity.ok(Map.of("message", "Đã đánh dấu cuộc trò chuyện là đã đọc"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            Long count = messageService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/send-with-image")
    public ResponseEntity<?> sendMessageWithImage(
            @RequestParam("senderId") Long senderId,
            @RequestParam("receiverId") Long receiverId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            String imageUrl = null;
            
            // Upload image if provided
            if (image != null && !image.isEmpty()) {
                // Validate file type
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "File phải là ảnh"));
                }
                
                // Validate file size (5MB)
                if (image.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "File không được vượt quá 5MB"));
                }
                
                // Create upload directory
                String uploadDir = "src/main/resources/static/uploads/messages/";
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                
                // Generate unique filename
                String originalFilename = image.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
                String filename = "msg_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
                
                // Save file
                Path filePath = Paths.get(uploadDir + filename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                imageUrl = "/uploads/messages/" + filename;
            }
            
            // Send message with or without image
            Message message = messageService.sendMessageWithImage(senderId, receiverId, content, imageUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", message.getId());
            response.put("content", message.getContent());
            response.put("imageUrl", message.getImageUrl());
            response.put("senderId", message.getSenderId());
            response.put("receiverId", message.getReceiverId());
            response.put("isRead", message.getIsRead());
            response.put("createdAt", message.getCreatedAt());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Lỗi khi upload ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}
