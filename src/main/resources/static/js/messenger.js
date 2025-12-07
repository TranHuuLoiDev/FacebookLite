// Messenger Dropdown Module

let messengerConversations = [];
let messengerLoadInterval = null;

// Toggle messenger dropdown
function toggleMessengerDropdown() {
    const dropdown = document.getElementById('messengerDropdown');
    const userDropdown = document.getElementById('userDropdown');
    const isActive = dropdown.classList.contains('active');
    
    // Close user dropdown if open
    if (userDropdown) {
        userDropdown.classList.remove('active');
    }
    
    if (!isActive) {
        dropdown.classList.add('active');
        loadMessengerConversations();
        
        // Auto refresh every 5 seconds while open
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
        }
        messengerLoadInterval = setInterval(loadMessengerConversations, 5000);
    } else {
        dropdown.classList.remove('active');
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
            messengerLoadInterval = null;
        }
    }
}

// Load messenger conversations
async function loadMessengerConversations() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/messages/conversations/${currentUser.userId}`);
        messengerConversations = await response.json();
        
        displayMessengerConversations(messengerConversations);
        updateMessengerBadge();
    } catch (error) {
        console.error('Error loading messenger conversations:', error);
        document.getElementById('messengerConversationsList').innerHTML = 
            '<div class="messenger-empty">Lỗi tải dữ liệu</div>';
    }
}

// Display messenger conversations
function displayMessengerConversations(conversations) {
    const container = document.getElementById('messengerConversationsList');
    
    if (conversations.length === 0) {
        container.innerHTML = '<div class="messenger-empty">Chưa có đoạn chat nào</div>';
        return;
    }
    
    // Show max 8 conversations
    const limited = conversations.slice(0, 8);
    
    container.innerHTML = '';
    limited.forEach(conv => {
        const item = createMessengerConversationItem(conv);
        container.appendChild(item);
    });
}

// Create messenger conversation item
function createMessengerConversationItem(conv) {
    const div = document.createElement('div');
    div.className = 'messenger-conversation-item';
    
    const initial = getUserInitial(conv);
    const fullName = getUserFullName(conv);
    const timeAgo = formatTimeAgo(conv.lastMessageTime);
    
    const avatarHtml = conv.profilePicture 
        ? `<img src="${conv.profilePicture}" alt="${fullName}">` 
        : initial;
    
    const lastMessagePrefix = conv.isLastMessageFromMe ? 'Bạn: ' : '';
    const unreadClass = conv.unreadCount > 0 ? 'unread' : '';
    
    div.innerHTML = `
        <div class="messenger-conv-avatar">
            ${avatarHtml}
            <div class="messenger-online-dot"></div>
        </div>
        <div class="messenger-conv-content">
            <div class="messenger-conv-header">
                <span class="messenger-conv-name">${escapeHtml(fullName)}</span>
                <span class="messenger-conv-time">${timeAgo}</span>
            </div>
            <div class="messenger-conv-message ${unreadClass}">
                ${lastMessagePrefix}${escapeHtml(conv.lastMessage || '')}
            </div>
        </div>
        ${conv.unreadCount > 0 ? `<div class="messenger-unread-badge">${conv.unreadCount}</div>` : ''}
    `;
    
    div.addEventListener('click', () => {
        const avatarForPopup = conv.profilePicture 
            ? `<img src="${conv.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">` 
            : initial;
        
        window.openChatPopup(conv.userId, fullName, avatarForPopup);
        
        // Close dropdown
        document.getElementById('messengerDropdown').classList.remove('active');
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
            messengerLoadInterval = null;
        }
    });
    
    return div;
}

// Update messenger badge
function updateMessengerBadge() {
    const badge = document.getElementById('messengerBadge');
    const totalUnread = messengerConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    
    if (totalUnread > 0) {
        badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Messenger search
document.addEventListener('DOMContentLoaded', () => {
    const messengerSearch = document.getElementById('messengerSearch');
    if (messengerSearch) {
        messengerSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = messengerConversations.filter(conv => {
                const fullName = getUserFullName(conv).toLowerCase();
                const username = (conv.username || '').toLowerCase();
                return fullName.includes(searchTerm) || username.includes(searchTerm);
            });
            displayMessengerConversations(filtered);
        });
    }
});

// Close messenger dropdown when clicking outside
document.addEventListener('click', function(event) {
    const messengerDropdown = document.getElementById('messengerDropdown');
    const messengerBtn = document.getElementById('messengerBtn');
    
    if (messengerDropdown && messengerBtn && 
        !messengerDropdown.contains(event.target) && 
        !messengerBtn.contains(event.target)) {
        messengerDropdown.classList.remove('active');
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
            messengerLoadInterval = null;
        }
    }
});

// Expose messengerLoadInterval to global scope for auth.js
window.messengerLoadInterval = messengerLoadInterval;
