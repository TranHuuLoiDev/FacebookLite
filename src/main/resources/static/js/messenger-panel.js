// Messenger Panel JavaScript
let currentUser = null;
let conversations = [];
let currentTab = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/html/login.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    // Load conversations
    loadConversations();
    
    // Setup event listeners
    setupEventListeners();
    
    // Refresh every 5 seconds
    setInterval(loadConversations, 5000);
});

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            filterConversations();
        });
    });
    
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        filterConversations(e.target.value.toLowerCase());
    });
}

async function loadConversations() {
    try {
        const response = await fetch(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
        conversations = await response.json();
        
        displayConversations(conversations);
    } catch (error) {
        console.error('Error loading conversations:', error);
        showEmptyState('Lỗi tải dữ liệu', 'Không thể tải danh sách đoạn chat');
    }
}

function filterConversations(searchTerm = '') {
    let filtered = conversations;
    
    // Filter by tab
    if (currentTab === 'unread') {
        filtered = filtered.filter(conv => conv.unreadCount > 0);
    } else if (currentTab === 'groups') {
        filtered = []; // No groups yet
    } else if (currentTab === 'community') {
        filtered = []; // No community yet
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(conv => {
            const fullName = `${conv.firstName} ${conv.lastName}`.toLowerCase();
            const username = conv.username.toLowerCase();
            const message = (conv.lastMessage || '').toLowerCase();
            return fullName.includes(searchTerm) || 
                   username.includes(searchTerm) || 
                   message.includes(searchTerm);
        });
    }
    
    displayConversations(filtered);
}

function displayConversations(convList) {
    const container = document.getElementById('conversationsList');
    
    if (convList.length === 0) {
        if (currentTab === 'unread') {
            showEmptyState('Không có tin nhắn chưa đọc', 'Bạn đã đọc tất cả tin nhắn');
        } else if (currentTab === 'groups') {
            showEmptyState('Chưa có nhóm nào', 'Tạo nhóm để trò chuyện cùng nhiều người');
        } else if (currentTab === 'community') {
            showEmptyState('Chưa tham gia cộng đồng nào', 'Khám phá và tham gia các cộng đồng');
        } else {
            showEmptyState('Chưa có đoạn chat nào', 'Bắt đầu trò chuyện với bạn bè của bạn');
        }
        return;
    }
    
    container.innerHTML = '';
    
    convList.forEach(conv => {
        const convElement = createConversationElement(conv);
        container.appendChild(convElement);
    });
}

function createConversationElement(conv) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    
    const initial = conv.firstName ? conv.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${conv.firstName || ''} ${conv.lastName || ''}`.trim() || conv.username;
    const timeAgo = formatTimeAgo(conv.lastMessageTime);
    
    const avatarHtml = conv.profilePicture 
        ? `<img src="${conv.profilePicture}" alt="${fullName}">` 
        : initial;
    
    const lastMessagePrefix = conv.isLastMessageFromMe ? 'Bạn: ' : '';
    const unreadClass = conv.unreadCount > 0 ? 'unread' : '';
    
    div.innerHTML = `
        <div class="conversation-avatar-container">
            <div class="conversation-avatar">${avatarHtml}</div>
            <div class="online-indicator"></div>
        </div>
        <div class="conversation-content">
            <div class="conversation-header">
                <span class="conversation-name">${escapeHtml(fullName)}</span>
                <span class="conversation-time">${timeAgo}</span>
            </div>
            <div class="conversation-message ${unreadClass}">
                <span>${lastMessagePrefix}${escapeHtml(conv.lastMessage || '')}</span>
            </div>
        </div>
        ${conv.unreadCount > 0 ? `<div class="unread-badge">${conv.unreadCount}</div>` : ''}
    `;
    
    div.addEventListener('click', () => {
        openChatPopup(conv, fullName, avatarHtml);
    });
    
    return div;
}

function openChatPopup(conv, fullName, avatarHtml) {
    // Check if chat popup manager exists
    if (window.chatPopupManager) {
        window.chatPopupManager.openChat(conv.userId, fullName, avatarHtml);
        // Close messenger panel on mobile
        if (window.innerWidth < 768) {
            window.history.back();
        }
    } else {
        // Fallback: open messages page
        localStorage.setItem('chatWithUser', JSON.stringify({
            userId: conv.userId,
            firstName: conv.firstName,
            lastName: conv.lastName,
            username: conv.username,
            profilePicture: conv.profilePicture
        }));
        window.location.href = '/html/messages.html';
    }
}

function showEmptyState(title, text) {
    const container = document.getElementById('conversationsList');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-text">${text}</div>
        </div>
    `;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    
    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    if (weeks < 4) return `${weeks} tuần`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
