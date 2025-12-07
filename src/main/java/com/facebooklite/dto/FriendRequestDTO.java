package com.facebooklite.dto;

import java.time.LocalDateTime;

public class FriendRequestDTO {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderFirstName;
    private String senderLastName;
    private String senderProfilePicture;
    private Long receiverId;
    private String receiverUsername;
    private String receiverFirstName;
    private String receiverLastName;
    private String receiverProfilePicture;
    private String status;
    private LocalDateTime createdAt;
    
    // Constructors
    public FriendRequestDTO() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSenderId() {
        return senderId;
    }
    
    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderUsername() {
        return senderUsername;
    }
    
    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }
    
    public String getSenderFirstName() {
        return senderFirstName;
    }
    
    public void setSenderFirstName(String senderFirstName) {
        this.senderFirstName = senderFirstName;
    }
    
    public String getSenderLastName() {
        return senderLastName;
    }
    
    public void setSenderLastName(String senderLastName) {
        this.senderLastName = senderLastName;
    }
    
    public String getSenderProfilePicture() {
        return senderProfilePicture;
    }
    
    public void setSenderProfilePicture(String senderProfilePicture) {
        this.senderProfilePicture = senderProfilePicture;
    }
    
    public Long getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
    
    public String getReceiverUsername() {
        return receiverUsername;
    }
    
    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }
    
    public String getReceiverFirstName() {
        return receiverFirstName;
    }
    
    public void setReceiverFirstName(String receiverFirstName) {
        this.receiverFirstName = receiverFirstName;
    }
    
    public String getReceiverLastName() {
        return receiverLastName;
    }
    
    public void setReceiverLastName(String receiverLastName) {
        this.receiverLastName = receiverLastName;
    }
    
    public String getReceiverProfilePicture() {
        return receiverProfilePicture;
    }
    
    public void setReceiverProfilePicture(String receiverProfilePicture) {
        this.receiverProfilePicture = receiverProfilePicture;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
