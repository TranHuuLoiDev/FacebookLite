package com.facebooklite.service;

import com.facebooklite.dto.NotificationDTO;
import com.facebooklite.model.Notification;
import com.facebooklite.model.User;
import com.facebooklite.repository.NotificationRepository;
import com.facebooklite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public void createNotification(Long userId, Long actorId, String type, String content, Long relatedId) {
        // Không tạo thông báo cho chính mình
        if (userId.equals(actorId)) {
            return;
        }
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setActorId(actorId);
        notification.setType(type);
        notification.setContent(content);
        notification.setRelatedId(relatedId);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }
    
    public List<NotificationDTO> getNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return notifications.stream()
            .map(this::convertToDTO)
            .filter(dto -> dto != null && dto.getActorFirstName() != null)
            .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        
        return notifications.stream()
            .map(this::convertToDTO)
            .filter(dto -> dto != null && dto.getActorFirstName() != null)
            .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setActorId(notification.getActorId());
        dto.setType(notification.getType());
        dto.setRelatedId(notification.getRelatedId());
        dto.setContent(notification.getContent());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        
        // Get actor info
        User actor = userRepository.findById(notification.getActorId()).orElse(null);
        if (actor != null) {
            dto.setActorFirstName(actor.getFirstName());
            dto.setActorLastName(actor.getLastName());
            dto.setActorUsername(actor.getUsername());
            dto.setActorProfilePicture(actor.getProfilePicture());
        }
        
        return dto;
    }
}
