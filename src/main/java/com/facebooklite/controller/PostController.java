package com.facebooklite.controller;

import com.facebooklite.model.Post;
import com.facebooklite.service.PostService;
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
import java.util.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<?> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        
        // Transform posts to include user info
        List<Map<String, Object>> response = posts.stream().map(post -> {
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("content", post.getContent());
            postMap.put("imageUrl", post.getImageUrl());
            postMap.put("videoUrl", post.getVideoUrl());
            postMap.put("privacy", post.getPrivacy());
            postMap.put("likeCount", post.getLikeCount());
            postMap.put("commentCount", post.getCommentCount());
            postMap.put("shareCount", post.getShareCount());
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("updatedAt", post.getUpdatedAt());
            postMap.put("user", Map.of(
                "id", post.getUser().getId(),
                "firstName", post.getUser().getFirstName() != null ? post.getUser().getFirstName() : "",
                "lastName", post.getUser().getLastName() != null ? post.getUser().getLastName() : "",
                "username", post.getUser().getUsername(),
                "profilePicture", post.getUser().getProfilePicture() != null ? post.getUser().getProfilePicture() : ""
            ));
            return postMap;
        }).toList();
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(@PathVariable Long userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        
        // Transform posts to include user info
        List<Map<String, Object>> response = posts.stream().map(post -> {
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("content", post.getContent());
            postMap.put("imageUrl", post.getImageUrl());
            postMap.put("videoUrl", post.getVideoUrl());
            postMap.put("privacy", post.getPrivacy());
            postMap.put("likeCount", post.getLikeCount());
            postMap.put("commentCount", post.getCommentCount());
            postMap.put("shareCount", post.getShareCount());
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("updatedAt", post.getUpdatedAt());
            postMap.put("user", Map.of(
                "id", post.getUser().getId(),
                "firstName", post.getUser().getFirstName() != null ? post.getUser().getFirstName() : "",
                "lastName", post.getUser().getLastName() != null ? post.getUser().getLastName() : "",
                "username", post.getUser().getUsername(),
                "profilePicture", post.getUser().getProfilePicture() != null ? post.getUser().getProfilePicture() : ""
            ));
            return postMap;
        }).toList();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post, @RequestParam Long userId) {
        try {
            Post createdPost = postService.createPost(post, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post post) {
        try {
            Post updatedPost = postService.updatePost(id, post);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok().body("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/create-with-image")
    public ResponseEntity<?> createPostWithImage(
            @RequestParam("userId") Long userId,
            @RequestParam("content") String content,
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
                String uploadDir = "src/main/resources/static/uploads/posts/";
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                
                // Generate unique filename
                String originalFilename = image.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
                String filename = "post_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
                
                // Save file
                Path filePath = Paths.get(uploadDir + filename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                imageUrl = "/uploads/posts/" + filename;
            }
            
            // Create post
            Post post = new Post();
            post.setContent(content);
            post.setImageUrl(imageUrl);
            
            Post createdPost = postService.createPost(post, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Tạo bài viết thành công",
                "post", createdPost
            ));
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Lỗi khi upload ảnh: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}
