package com.facebooklite.controller;

import com.facebooklite.model.User;
import com.facebooklite.service.UserService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private UserService userService;

    private static final String UPLOAD_DIR = "src/main/resources/static/uploads/";

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn file"));
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("message", "File phải là ảnh"));
        }

        // Check file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "File không được vượt quá 5MB"));
        }

        try {
            // Create upload directory if not exists
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
            String filename = "profile_" + userId + "_" + UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user profile picture in database
            User user = userService.getUserById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy user"));
            }

            // Delete old profile picture if exists
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                String oldFilename = user.getProfilePicture().replace("/uploads/", "");
                Path oldFilePath = Paths.get(UPLOAD_DIR + oldFilename);
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    // Ignore if old file doesn't exist
                }
            }

            user.setProfilePicture("/uploads/" + filename);
            userService.updateUser(userId, user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Upload ảnh đại diện thành công");
            response.put("profilePicture", "/uploads/" + filename);
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Lỗi khi upload file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/profile-picture/{userId}")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy user"));
            }

            // Delete file from disk
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                String filename = user.getProfilePicture().replace("/uploads/", "");
                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.deleteIfExists(filePath);
            }

            // Update database
            user.setProfilePicture(null);
            userService.updateUser(userId, user);

            return ResponseEntity.ok(Map.of(
                "message", "Đã xóa ảnh đại diện",
                "user", user
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Lỗi khi xóa file: " + e.getMessage()));
        }
    }
}
