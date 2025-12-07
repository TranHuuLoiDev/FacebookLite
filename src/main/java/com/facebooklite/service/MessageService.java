package com.facebooklite.service;

import com.facebooklite.model.Message;
import com.facebooklite.model.User;
import com.facebooklite.repository.MessageRepository;
import com.facebooklite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, String content) {
        // Verify users exist
        userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        Message message = new Message(content, senderId, receiverId);
        return messageRepository.save(message);
    }
    
    @Transactional
    public Message sendMessageWithImage(Long senderId, Long receiverId, String content, String imageUrl) {
        // Verify users exist
        userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        if ((content == null || content.trim().isEmpty()) && (imageUrl == null || imageUrl.trim().isEmpty())) {
            throw new RuntimeException("Tin nhắn phải có nội dung hoặc ảnh");
        }
        
        Message message = new Message(content, senderId, receiverId);
        message.setImageUrl(imageUrl);
        return messageRepository.save(message);
    }
    
    @Transactional(readOnly = true)
    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2);
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversationList(Long userId) {
        // Get all messages where user is sender or receiver
        List<Message> allMessages = messageRepository.findAll();
        
        // Group by conversation partner
        Map<Long, Message> latestMessages = new HashMap<>();
        Set<Long> partners = new HashSet<>();
        
        for (Message msg : allMessages) {
            if (msg.getSenderId().equals(userId)) {
                Long partnerId = msg.getReceiverId();
                partners.add(partnerId);
                if (!latestMessages.containsKey(partnerId) || 
                    msg.getCreatedAt().isAfter(latestMessages.get(partnerId).getCreatedAt())) {
                    latestMessages.put(partnerId, msg);
                }
            } else if (msg.getReceiverId().equals(userId)) {
                Long partnerId = msg.getSenderId();
                partners.add(partnerId);
                if (!latestMessages.containsKey(partnerId) || 
                    msg.getCreatedAt().isAfter(latestMessages.get(partnerId).getCreatedAt())) {
                    latestMessages.put(partnerId, msg);
                }
            }
        }
        
        // Build response with user info
        List<Map<String, Object>> conversations = new ArrayList<>();
        for (Long partnerId : partners) {
            User partner = userRepository.findById(partnerId).orElse(null);
            if (partner != null) {
                Message lastMsg = latestMessages.get(partnerId);
                
                // Count unread messages from this partner
                long unreadCount = allMessages.stream()
                    .filter(m -> m.getSenderId().equals(partnerId) && 
                                m.getReceiverId().equals(userId) && 
                                !m.getIsRead())
                    .count();
                
                Map<String, Object> conv = new HashMap<>();
                conv.put("userId", partner.getId());
                conv.put("firstName", partner.getFirstName() != null ? partner.getFirstName() : "");
                conv.put("lastName", partner.getLastName() != null ? partner.getLastName() : "");
                conv.put("username", partner.getUsername());
                conv.put("profilePicture", partner.getProfilePicture() != null ? partner.getProfilePicture() : "");
                
                // Display appropriate message text
                String displayMessage;
                if (lastMsg.getContent() != null && !lastMsg.getContent().trim().isEmpty()) {
                    displayMessage = lastMsg.getContent();
                } else if (lastMsg.getImageUrl() != null) {
                    displayMessage = "Đã gửi 1 ảnh";
                } else {
                    displayMessage = "";
                }
                
                conv.put("lastMessage", displayMessage);
                conv.put("lastMessageTime", lastMsg.getCreatedAt());
                conv.put("unreadCount", unreadCount);
                conv.put("isLastMessageFromMe", lastMsg.getSenderId().equals(userId));
                
                conversations.add(conv);
            }
        }
        
        // Sort by last message time
        conversations.sort((a, b) -> 
            ((java.time.LocalDateTime) b.get("lastMessageTime"))
                .compareTo((java.time.LocalDateTime) a.get("lastMessageTime"))
        );
        
        return conversations;
    }
    
    @Transactional
    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        messageRepository.save(message);
    }
    
    @Transactional
    public void markConversationAsRead(Long userId, Long partnerId) {
        List<Message> messages = messageRepository.findConversation(userId, partnerId);
        for (Message msg : messages) {
            if (msg.getReceiverId().equals(userId) && !msg.getIsRead()) {
                msg.setIsRead(true);
                messageRepository.save(msg);
            }
        }
    }
    
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }
}
