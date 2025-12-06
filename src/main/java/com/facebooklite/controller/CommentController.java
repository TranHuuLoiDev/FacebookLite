package com.facebooklite.controller;

import com.facebooklite.model.Comment;
import com.facebooklite.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long postId = Long.valueOf(request.get("postId").toString());
            String content = request.get("content").toString();
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nội dung bình luận không được để trống"));
            }
            
            Comment comment = commentService.createComment(userId, postId, content);
            
            // Create response with user info
            Map<String, Object> response = new HashMap<>();
            response.put("id", comment.getId());
            response.put("content", comment.getContent());
            response.put("createdAt", comment.getCreatedAt());
            response.put("user", Map.of(
                "id", comment.getUser().getId(),
                "firstName", comment.getUser().getFirstName() != null ? comment.getUser().getFirstName() : "",
                "lastName", comment.getUser().getLastName() != null ? comment.getUser().getLastName() : "",
                "username", comment.getUser().getUsername(),
                "profilePicture", comment.getUser().getProfilePicture() != null ? comment.getUser().getProfilePicture() : ""
            ));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "userId và postId phải là số"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPostId(@PathVariable Long postId) {
        try {
            List<Comment> comments = commentService.getCommentsByPostId(postId);
            
            // Transform comments to include user info
            List<Map<String, Object>> response = comments.stream().map(comment -> {
                Map<String, Object> commentMap = new HashMap<>();
                commentMap.put("id", comment.getId());
                commentMap.put("content", comment.getContent());
                commentMap.put("createdAt", comment.getCreatedAt());
                commentMap.put("user", Map.of(
                    "id", comment.getUser().getId(),
                    "firstName", comment.getUser().getFirstName() != null ? comment.getUser().getFirstName() : "",
                    "lastName", comment.getUser().getLastName() != null ? comment.getUser().getLastName() : "",
                    "username", comment.getUser().getUsername(),
                    "profilePicture", comment.getUser().getProfilePicture() != null ? comment.getUser().getProfilePicture() : ""
                ));
                return commentMap;
            }).toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, @RequestParam Long userId) {
        try {
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.ok(Map.of("message", "Xóa bình luận thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}
