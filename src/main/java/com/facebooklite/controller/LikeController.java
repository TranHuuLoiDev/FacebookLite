package com.facebooklite.controller;

import com.facebooklite.model.Like;
import com.facebooklite.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {
    
    @Autowired
    private LikeService likeService;
    
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLike(@RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            Long postId = request.get("postId");
            
            if (userId == null || postId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "userId và postId là bắt buộc"));
            }
            
            Like like = likeService.toggleLike(userId, postId);
            
            if (like == null) {
                return ResponseEntity.ok(Map.of(
                    "message", "Unlike thành công",
                    "liked", false
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "Like thành công",
                    "liked", true
                ));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkLike(@RequestParam Long userId, @RequestParam Long postId) {
        boolean isLiked = likeService.isLikedByUser(userId, postId);
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }
}
