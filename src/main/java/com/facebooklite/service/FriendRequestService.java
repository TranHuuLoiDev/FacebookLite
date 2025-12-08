package com.facebooklite.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.facebooklite.dto.FriendRequestDTO;
import com.facebooklite.model.FriendRequest;
import com.facebooklite.model.FriendRequest.FriendRequestStatus;
import com.facebooklite.model.Friendship;
import com.facebooklite.model.User;
import com.facebooklite.repository.FriendRequestRepository;
import com.facebooklite.repository.FriendshipRepository;
import com.facebooklite.repository.UserRepository;

@Service
public class FriendRequestService {
    
    @Autowired
    private FriendRequestRepository friendRequestRepository;
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    // Send friend request
    @Transactional
    public FriendRequestDTO sendFriendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Không thể gửi lời mời kết bạn cho chính mình");
        }
        
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận"));
        
        // Check if already friends
        if (friendshipRepository.areFriends(senderId, receiverId)) {
            throw new IllegalArgumentException("Đã là bạn bè");
        }
        
        // Check if request already exists
        if (friendRequestRepository.existsRequestBetweenUsers(senderId, receiverId)) {
            throw new IllegalArgumentException("Lời mời kết bạn đã tồn tại");
        }
        
        FriendRequest request = new FriendRequest(sender, receiver);
        request = friendRequestRepository.save(request);
        
        // Create notification for receiver
        notificationService.createNotification(
            receiverId,
            senderId,
            "friend_request",
            sender.getFirstName() + " " + sender.getLastName() + " đã gửi lời mời kết bạn",
            request.getId()
        );
        
        return convertToDTO(request);
    }
    
    // Accept friend request
    @Transactional
    public void acceptFriendRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời kết bạn"));
        
        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chấp nhận lời mời này");
        }
        
        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException("Lời mời kết bạn không hợp lệ");
        }
        
        // Update request status
        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);
        
        // Create friendship (bidirectional)
        Friendship friendship1 = new Friendship();
        friendship1.setUserId(request.getSender().getId());
        friendship1.setFriendId(request.getReceiver().getId());
        friendshipRepository.save(friendship1);
        
        Friendship friendship2 = new Friendship();
        friendship2.setUserId(request.getReceiver().getId());
        friendship2.setFriendId(request.getSender().getId());
        friendshipRepository.save(friendship2);
        
        // Create notification for sender
        notificationService.createNotification(
            request.getSender().getId(),
            request.getReceiver().getId(),
            "friend_accept",
            request.getReceiver().getFirstName() + " " + request.getReceiver().getLastName() + " đã chấp nhận lời mời kết bạn",
            request.getId()
        );
    }
    
    // Reject friend request
    @Transactional
    public void rejectFriendRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời kết bạn"));
        
        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền từ chối lời mời này");
        }
        
        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException("Lời mời kết bạn không hợp lệ");
        }
        
        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }
    
    // Cancel friend request (sender cancels)
    @Transactional
    public void cancelFriendRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời kết bạn"));
        
        if (!request.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền hủy lời mời này");
        }
        
        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException("Lời mời kết bạn không hợp lệ");
        }
        
        friendRequestRepository.delete(request);
    }
    
    // Get pending requests received by user
    public List<FriendRequestDTO> getPendingRequestsReceived(Long userId) {
        List<FriendRequest> requests = friendRequestRepository.findPendingRequestsByReceiver(userId);
        return requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Get pending requests sent by user
    public List<FriendRequestDTO> getPendingRequestsSent(Long userId) {
        List<FriendRequest> requests = friendRequestRepository.findPendingRequestsBySender(userId);
        return requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Count pending requests
    public Long countPendingRequests(Long userId) {
        return friendRequestRepository.countPendingRequestsByReceiver(userId);
    }
    
    // Unfriend (remove friendship)
    @Transactional
    public void unfriend(Long userId1, Long userId2) {
        if (!friendshipRepository.areFriends(userId1, userId2)) {
            throw new IllegalArgumentException("Không phải bạn bè");
        }
        
        // Delete both friendship records (bidirectional)
        friendshipRepository.deleteByUserIdAndFriendId(userId1, userId2);
        friendshipRepository.deleteByUserIdAndFriendId(userId2, userId1);
    }
    
    // Get friendship status between two users
    public String getFriendshipStatus(Long userId1, Long userId2) {
        // Check if friends
        if (friendshipRepository.areFriends(userId1, userId2)) {
            return "FRIENDS";
        }
        
        // Check for pending request
        Optional<FriendRequest> request = friendRequestRepository.findPendingRequestBetweenUsers(userId1, userId2);
        if (request.isPresent()) {
            if (request.get().getSender().getId().equals(userId1)) {
                return "REQUEST_SENT";
            } else {
                return "REQUEST_RECEIVED";
            }
        }
        
        return "NOT_FRIENDS";
    }
    
    // Convert entity to DTO
    private FriendRequestDTO convertToDTO(FriendRequest request) {
        FriendRequestDTO dto = new FriendRequestDTO();
        dto.setId(request.getId());
        dto.setSenderId(request.getSender().getId());
        dto.setSenderUsername(request.getSender().getUsername());
        dto.setSenderFirstName(request.getSender().getFirstName());
        dto.setSenderLastName(request.getSender().getLastName());
        dto.setSenderProfilePicture(request.getSender().getProfilePicture());
        dto.setReceiverId(request.getReceiver().getId());
        dto.setReceiverUsername(request.getReceiver().getUsername());
        dto.setReceiverFirstName(request.getReceiver().getFirstName());
        dto.setReceiverLastName(request.getReceiver().getLastName());
        dto.setReceiverProfilePicture(request.getReceiver().getProfilePicture());
        dto.setStatus(request.getStatus().name());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}
