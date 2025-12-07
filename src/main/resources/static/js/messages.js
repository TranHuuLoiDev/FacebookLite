let currentUser = null;
let selectedPartnerId = null;
let selectedPartnerName = '';
let messagePollingInterval = null;
let lastMessageId = null;

// Check authentication
const userStr = localStorage.getItem('user');
if (!userStr) {
    window.location.href = '/html/login.html';
} else {
    currentUser = JSON.parse(userStr);
    updateUserInfo();
    loadConversations();
    
    // Check if there's a selected user to chat with
    const chatWithUserStr = localStorage.getItem('chatWithUser');
    if (chatWithUserStr) {
        const chatWithUser = JSON.parse(chatWithUserStr);
        localStorage.removeItem('chatWithUser'); // Clear after reading
        
        // Wait a bit for conversations to load, then open the chat
        setTimeout(() => {
            const initial = chatWithUser.firstName ? chatWithUser.firstName.charAt(0).toUpperCase() : chatWithUser.username.charAt(0).toUpperCase();
            const fullName = `${chatWithUser.firstName || ''} ${chatWithUser.lastName || ''}`.trim() || chatWithUser.username;
            const avatarHtml = chatWithUser.profilePicture 
                ? `<img src="${chatWithUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                : initial;
            
            openConversation(chatWithUser.userId, fullName, avatarHtml);
        }, 500);
    }
}

function updateUserInfo() {
    const initial = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
    
    // Update avatars
    updateAvatar('userAvatar', currentUser.profilePicture, initial);
    updateAvatar('dropdownAvatar', currentUser.profilePicture, initial);
    
    document.getElementById('dropdownUsername').textContent = fullName;
}

function updateAvatar(elementId, profilePicture, initial) {
    const element = document.getElementById(elementId);
    if (profilePicture && profilePicture.trim() !== '') {
        element.innerHTML = `<img src="${profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        element.textContent = initial;
        element.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const avatar = document.getElementById('userAvatar');
    
    if (dropdown && !dropdown.contains(event.target) && !avatar.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// Add click event to avatar
document.getElementById('userAvatar').addEventListener('click', toggleDropdown);

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/html/login.html';
}

function goToProfile() {
    window.location.href = '/html/profile.html';
}

// Load conversations list
async function loadConversations() {
    try {
        const response = await fetch(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
        const conversations = await response.json();
        
        const conversationsList = document.getElementById('conversationsList');
        conversationsList.innerHTML = '';
        
        if (conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="loading">
                    <p>Chưa có cuộc trò chuyện nào</p>
                    <p style="font-size: 13px; margin-top: 8px;">Bắt đầu trò chuyện từ trang cá nhân của bạn bè</p>
                </div>
            `;
            return;
        }
        
        conversations.forEach(conv => {
            const convElement = createConversationElement(conv);
            conversationsList.appendChild(convElement);
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
        document.getElementById('conversationsList').innerHTML = '<div class="loading">Lỗi tải danh sách trò chuyện</div>';
    }
}

function createConversationElement(conv) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    div.dataset.userId = conv.userId;
    
    const initial = conv.firstName ? conv.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${conv.firstName || ''} ${conv.lastName || ''}`.trim() || conv.username;
    const avatarHtml = conv.profilePicture 
        ? `<img src="${conv.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
        : initial;
    
    const timeAgo = formatDate(conv.lastMessageTime);
    const lastMessagePrefix = conv.isLastMessageFromMe ? 'Bạn: ' : '';
    const unreadClass = conv.unreadCount > 0 ? 'unread' : '';
    
    div.innerHTML = `
        <div class="conversation-avatar">
            <div class="avatar medium">${avatarHtml}</div>
        </div>
        <div class="conversation-info">
            <div class="conversation-name">${fullName}</div>
            <div class="conversation-last-message ${unreadClass}">
                <span>${lastMessagePrefix}${conv.lastMessage}</span>
            </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            <span class="conversation-time">${timeAgo}</span>
            ${conv.unreadCount > 0 ? `<div class="unread-badge">${conv.unreadCount}</div>` : ''}
        </div>
    `;
    
    div.addEventListener('click', () => openConversation(conv.userId, fullName, avatarHtml));
    
    return div;
}

async function openConversation(partnerId, partnerName, partnerAvatar) {
    selectedPartnerId = partnerId;
    selectedPartnerName = partnerName;
    lastMessageId = null; // Reset for new conversation
    
    // Update UI
    updateActiveConversation(partnerId);
    
    // Show chat window
    document.querySelector('.no-conversation-selected').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'flex';
    
    // Update chat header
    document.getElementById('chatPartnerAvatar').innerHTML = partnerAvatar;
    document.getElementById('chatPartnerName').textContent = partnerName;
    
    // Load messages
    await loadMessages();
    
    // Mark conversation as read
    await markConversationAsRead(partnerId);
    
    // Start polling for new messages
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    messagePollingInterval = setInterval(() => loadMessages(true), 3000);
}

function updateActiveConversation(partnerId) {
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-user-id="${partnerId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

async function loadMessages(silent = false) {
    if (!selectedPartnerId) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/messages/conversation/${currentUser.userId}/${selectedPartnerId}`);
        const messages = await response.json();
        
        // Check if there are new messages
        const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
        
        // Only update if there are new messages or first load
        if (!silent || lastMessageId !== latestMessageId) {
            const container = document.getElementById('messagesContainer');
            const shouldScrollToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            
            container.innerHTML = '';
            
            messages.forEach(msg => {
                const msgElement = createMessageElement(msg);
                container.appendChild(msgElement);
            });
            
            if (shouldScrollToBottom || !silent) {
                container.scrollTop = container.scrollHeight;
            }
            
            lastMessageId = latestMessageId;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    const isSent = msg.senderId === currentUser.userId;
    div.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const timeStr = formatTime(msg.createdAt);
    
    let contentHtml = '';
    if (msg.imageUrl) {
        contentHtml += `<img src="${msg.imageUrl}" class="message-image" onclick="window.open('${msg.imageUrl}', '_blank')">`;
    }
    if (msg.content && msg.content.trim()) {
        contentHtml += `<div class="message-bubble">${escapeHtml(msg.content)}</div>`;
    }
    
    if (isSent) {
        div.innerHTML = contentHtml;
    } else {
        const initial = selectedPartnerName.charAt(0).toUpperCase();
        div.innerHTML = `
            <div class="message-avatar">${initial}</div>
            <div>
                ${contentHtml}
                <div class="message-time">${timeStr}</div>
            </div>
        `;
    }
    
    return div;
}

async function markConversationAsRead(partnerId) {
    try {
        await fetch(`http://localhost:8080/api/messages/mark-conversation-read/${currentUser.userId}/${partnerId}`, {
            method: 'PUT'
        });
        // Refresh conversations list to update unread count, but keep the active state
        await loadConversationsWithActiveState();
    } catch (error) {
        console.error('Error marking conversation as read:', error);
    }
}

async function loadConversationsWithActiveState() {
    const currentActiveId = selectedPartnerId;
    await loadConversations();
    if (currentActiveId) {
        updateActiveConversation(currentActiveId);
    }
}

// Handle image selection
let selectedImage = null;

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            return;
        }
        
        selectedImage = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function clearImageSelection() {
    selectedImage = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
}

// Send message
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('sendButton').addEventListener('click', sendMessage);

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if ((!content && !selectedImage) || !selectedPartnerId) return;
    
    // Create temporary preview for optimistic UI
    let tempImageUrl = null;
    let tempMessageElement = null;
    
    if (selectedImage) {
        tempImageUrl = URL.createObjectURL(selectedImage);
    }
    
    // Show message immediately (optimistic UI)
    if (tempImageUrl || content) {
        const tempMsg = {
            senderId: currentUser.userId,
            receiverId: selectedPartnerId,
            content: content,
            imageUrl: tempImageUrl,
            createdAt: new Date().toISOString()
        };
        
        const container = document.getElementById('messagesContainer');
        tempMessageElement = createMessageElement(tempMsg);
        tempMessageElement.style.opacity = '0.6'; // Show as pending
        tempMessageElement.dataset.temporary = 'true'; // Mark as temporary
        container.appendChild(tempMessageElement);
        container.scrollTop = container.scrollHeight;
    }
    
    try {
        let response;
        
        if (selectedImage) {
            // Send with image
            const formData = new FormData();
            formData.append('senderId', currentUser.userId);
            formData.append('receiverId', selectedPartnerId);
            if (content) {
                formData.append('content', content);
            }
            formData.append('image', selectedImage);
            
            response = await fetch('http://localhost:8080/api/messages/send-with-image', {
                method: 'POST',
                body: formData
            });
        } else {
            // Send text only
            response = await fetch('http://localhost:8080/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    senderId: currentUser.userId,
                    receiverId: selectedPartnerId,
                    content: content
                })
            });
        }
        
        if (response.ok) {
            const newMessage = await response.json();
            
            input.value = '';
            clearImageSelection();
            
            // Cleanup temp URL
            if (tempImageUrl) {
                URL.revokeObjectURL(tempImageUrl);
            }
            
            // Remove temporary message and add real one
            if (tempMessageElement) {
                tempMessageElement.remove();
            }
            
            // Add the real message with actual imageUrl from server
            const container = document.getElementById('messagesContainer');
            const realMessageElement = createMessageElement(newMessage);
            container.appendChild(realMessageElement);
            container.scrollTop = container.scrollHeight;
            
            // Update last message ID to prevent duplicate on next poll
            lastMessageId = newMessage.id;
            
            // Update conversations list
            await loadConversationsWithActiveState();
        } else {
            alert('Không thể gửi tin nhắn');
            // Remove the temporary message on error
            if (tempMessageElement) {
                tempMessageElement.remove();
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Lỗi khi gửi tin nhắn');
        // Remove the temporary message on error
        if (tempMessageElement) {
            tempMessageElement.remove();
        }
    }
}

// Search conversations
document.getElementById('searchConversations').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const conversations = document.querySelectorAll('.conversation-item');
    
    conversations.forEach(conv => {
        const name = conv.querySelector('.conversation-name').textContent.toLowerCase();
        const lastMsg = conv.querySelector('.conversation-last-message').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || lastMsg.includes(searchTerm)) {
            conv.style.display = 'flex';
        } else {
            conv.style.display = 'none';
        }
    });
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
});
