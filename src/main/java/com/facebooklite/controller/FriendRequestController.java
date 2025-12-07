package com.facebooklite.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.facebooklite.dto.FriendRequestDTO;
import com.facebooklite.service.FriendRequestService;

@RestController
@RequestMapping("/api/friend-requests")
public class FriendRequestController {
    
    @Autowired
    private FriendRequestService friendRequestService;
    
    // Send friend request
    @PostMapping("/send")
    public ResponseEntity<?> sendFriendRequest(@RequestBody Map<String, Long> request) {
        try {
            Long senderId = request.get("senderId");
            Long receiverId = request.get("receiverId");
            
            if (senderId == null || receiverId == null) {
                return ResponseEntity.badRequest().body("senderId và receiverId là bắt buộc");
            }
            
            FriendRequestDTO friendRequest = friendRequestService.sendFriendRequest(senderId, receiverId);
            return ResponseEntity.ok(friendRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi gửi lời mời kết bạn: " + e.getMessage());
        }
    }
    
    // Accept friend request
    @PutMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body("userId là bắt buộc");
            }
            
            friendRequestService.acceptFriendRequest(requestId, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã chấp nhận lời mời kết bạn");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi chấp nhận lời mời: " + e.getMessage());
        }
    }
    
    // Reject friend request
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body("userId là bắt buộc");
            }
            
            friendRequestService.rejectFriendRequest(requestId, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã từ chối lời mời kết bạn");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi từ chối lời mời: " + e.getMessage());
        }
    }
    
    // Cancel friend request (sender cancels)
    @DeleteMapping("/{requestId}/cancel")
    public ResponseEntity<?> cancelFriendRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body("userId là bắt buộc");
            }
            
            friendRequestService.cancelFriendRequest(requestId, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã hủy lời mời kết bạn");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi hủy lời mời: " + e.getMessage());
        }
    }
    
    // Get pending requests received
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequestsReceived(@PathVariable Long userId) {
        try {
            List<FriendRequestDTO> requests = friendRequestService.getPendingRequestsReceived(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get pending requests sent
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequestsSent(@PathVariable Long userId) {
        try {
            List<FriendRequestDTO> requests = friendRequestService.getPendingRequestsSent(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Count pending requests
    @GetMapping("/count/{userId}")
    public ResponseEntity<Map<String, Long>> countPendingRequests(@PathVariable Long userId) {
        try {
            Long count = friendRequestService.countPendingRequests(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get friendship status between two users
    @GetMapping("/status/{userId1}/{userId2}")
    public ResponseEntity<Map<String, String>> getFriendshipStatus(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            String status = friendRequestService.getFriendshipStatus(userId1, userId2);
            Map<String, String> response = new HashMap<>();
            response.put("status", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Unfriend
    @DeleteMapping("/unfriend")
    public ResponseEntity<?> unfriend(@RequestBody Map<String, Long> request) {
        try {
            Long userId1 = request.get("userId1");
            Long userId2 = request.get("userId2");
            
            if (userId1 == null || userId2 == null) {
                return ResponseEntity.badRequest().body("userId1 và userId2 là bắt buộc");
            }
            
            friendRequestService.unfriend(userId1, userId2);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã hủy kết bạn");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi hủy kết bạn: " + e.getMessage());
        }
    }
}
