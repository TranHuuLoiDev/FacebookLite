// Global Chat Popup Manager
class ChatPopupManager {
    constructor() {
        this.popups = new Map(); // userId -> popup object
        this.container = null;
        this.currentUser = null;
        this.maxPopups = 3; // Maximum number of open popups
        this.init();
    }

    init() {
        // Get current user
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.error('No user logged in');
            return;
        }
        this.currentUser = JSON.parse(userStr);

        // Create container for popups
        this.container = document.createElement('div');
        this.container.className = 'chat-popups-container';
        document.body.appendChild(this.container);
    }

    openChat(userId, userName, userAvatar) {
        // If popup already exists, just show it
        if (this.popups.has(userId)) {
            const popup = this.popups.get(userId);
            popup.element.classList.remove('minimized');
            this.scrollToBottom(popup);
            return;
        }

        // Check maximum popups
        if (this.popups.size >= this.maxPopups) {
            // Close the oldest popup
            const firstKey = this.popups.keys().next().value;
            this.closeChat(firstKey);
        }

        // Create new popup
        const popup = this.createPopup(userId, userName, userAvatar);
        this.popups.set(userId, popup);
        this.container.appendChild(popup.element);

        // Load messages
        this.loadMessages(userId);

        // Start polling for new messages
        popup.pollingInterval = setInterval(() => {
            this.loadMessages(userId, true);
        }, 3000);
    }

    createPopup(userId, userName, userAvatar) {
        const popup = document.createElement('div');
        popup.className = 'chat-popup';

        popup.innerHTML = `
            <div class="chat-popup-header">
                <div class="chat-popup-user-info">
                    <div class="chat-popup-avatar">${userAvatar}</div>
                    <div class="chat-popup-user-details">
                        <div class="chat-popup-name">${this.escapeHtml(userName)}</div>
                        <div class="chat-popup-status">Hoạt động</div>
                    </div>
                </div>
                <div class="chat-popup-actions">
                    <button class="chat-popup-btn" data-action="fullscreen" title="Mở trong Messenger">
                        <span style="transform: rotate(45deg); display: inline-block;">↑</span>
                    </button>
                    <button class="chat-popup-btn" data-action="minimize" title="Thu nhỏ">−</button>
                    <button class="chat-popup-btn" data-action="close" title="Đóng">×</button>
                </div>
            </div>
            <div class="chat-popup-body">
                <div class="chat-popup-messages">
                    <div class="chat-popup-loading">Đang tải tin nhắn...</div>
                </div>
                <div class="chat-popup-input-area">
                    <div class="chat-image-preview">
                        <div class="chat-preview-container">
                            <img class="chat-preview-img" src="" alt="Preview">
                            <button class="chat-preview-remove">×</button>
                        </div>
                    </div>
                    <div class="chat-popup-input-row">
                        <button class="chat-input-icon-btn" data-action="attach" title="Đính kèm ảnh">
                            <span>📎</span>
                        </button>
                        <input type="file" accept="image/*" style="display: none;" class="chat-file-input">
                        <div class="chat-popup-input-wrapper">
                            <textarea class="chat-popup-input" placeholder="Aa" rows="1"></textarea>
                        </div>
                        <button class="chat-send-btn" disabled title="Gửi">
                            <span>➤</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Get elements
        const header = popup.querySelector('.chat-popup-header');
        const messagesContainer = popup.querySelector('.chat-popup-messages');
        const inputArea = popup.querySelector('.chat-popup-input');
        const sendBtn = popup.querySelector('.chat-send-btn');
        const fileInput = popup.querySelector('.chat-file-input');
        const imagePreview = popup.querySelector('.chat-image-preview');
        const previewImg = popup.querySelector('.chat-preview-img');

        let selectedFile = null;
        let lastMessageId = null;

        // Header click to toggle minimize
        header.addEventListener('click', (e) => {
            if (e.target.closest('.chat-popup-actions')) return;
            popup.classList.toggle('minimized');
        });

        // Action buttons
        popup.querySelector('[data-action="minimize"]').addEventListener('click', (e) => {
            e.stopPropagation();
            popup.classList.add('minimized');
        });

        popup.querySelector('[data-action="close"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeChat(userId);
        });

        popup.querySelector('[data-action="fullscreen"]').addEventListener('click', (e) => {
            e.stopPropagation();
            // Redirect to messages page
            const userData = {
                userId: userId,
                firstName: userName.split(' ')[0],
                lastName: userName.split(' ').slice(1).join(' '),
                username: userName,
                profilePicture: userAvatar.includes('img') ? userAvatar.match(/src="([^"]+)"/)?.[1] : ''
            };
            localStorage.setItem('chatWithUser', JSON.stringify(userData));
            window.location.href = '/html/messages.html';
        });

        // Attach image
        popup.querySelector('[data-action="attach"]').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh');
                fileInput.value = '';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB');
                fileInput.value = '';
                return;
            }

            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imagePreview.classList.add('active');
                sendBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        });

        popup.querySelector('.chat-preview-remove').addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            imagePreview.classList.remove('active');
            if (!inputArea.value.trim()) {
                sendBtn.disabled = true;
            }
        });

        // Input handling
        inputArea.addEventListener('input', () => {
            sendBtn.disabled = !inputArea.value.trim() && !selectedFile;
            
            // Auto resize
            inputArea.style.height = 'auto';
            inputArea.style.height = Math.min(inputArea.scrollHeight, 100) + 'px';
        });

        inputArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sendBtn.disabled) {
                    this.sendMessage(userId, popup, inputArea, selectedFile, imagePreview, fileInput, sendBtn);
                    selectedFile = null;
                }
            }
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage(userId, popup, inputArea, selectedFile, imagePreview, fileInput, sendBtn);
            selectedFile = null;
        });

        return {
            element: popup,
            messagesContainer,
            inputArea,
            sendBtn,
            lastMessageId: null,
            pollingInterval: null,
            getSelectedFile: () => selectedFile,
            setSelectedFile: (file) => { selectedFile = file; }
        };
    }

    async sendMessage(userId, popup, inputArea, selectedFile, imagePreview, fileInput, sendBtn) {
        const content = inputArea.value.trim();
        if (!content && !selectedFile) return;

        const popupData = this.popups.get(userId);
        if (!popupData) return;

        // Disable send button
        sendBtn.disabled = true;

        try {
            let response;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('senderId', this.currentUser.userId);
                formData.append('receiverId', userId);
                if (content) {
                    formData.append('content', content);
                }
                formData.append('image', selectedFile);

                response = await fetch('http://localhost:8080/api/messages/send-with-image', {
                    method: 'POST',
                    body: formData
                });
            } else {
                response = await fetch('http://localhost:8080/api/messages/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        senderId: this.currentUser.userId,
                        receiverId: userId,
                        content: content
                    })
                });
            }

            if (response.ok) {
                const message = await response.json();
                
                // Clear input
                inputArea.value = '';
                inputArea.style.height = 'auto';
                imagePreview.classList.remove('active');
                fileInput.value = '';
                
                // Add message to UI
                this.addMessageToUI(userId, message);
                popupData.lastMessageId = message.id;
                
                // Scroll to bottom
                this.scrollToBottom(popupData);
            } else {
                alert('Không thể gửi tin nhắn');
                sendBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Lỗi khi gửi tin nhắn');
            sendBtn.disabled = false;
        }
    }

    async loadMessages(userId, silent = false) {
        const popup = this.popups.get(userId);
        if (!popup) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/messages/conversation/${this.currentUser.userId}/${userId}`
            );
            const messages = await response.json();

            const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

            // Only update if there are new messages or first load
            if (!silent || popup.lastMessageId !== latestMessageId) {
                popup.messagesContainer.innerHTML = '';

                if (messages.length === 0) {
                    popup.messagesContainer.innerHTML = `
                        <div class="chat-popup-empty">
                            <div class="chat-popup-empty-icon">💬</div>
                            <div>Chưa có tin nhắn nào</div>
                            <div style="font-size: 12px; margin-top: 4px;">Gửi tin nhắn để bắt đầu trò chuyện</div>
                        </div>
                    `;
                } else {
                    messages.forEach(msg => {
                        this.addMessageToUI(userId, msg);
                    });
                }

                // Always scroll to bottom after loading messages
                setTimeout(() => {
                    this.scrollToBottom(popup);
                }, 100);

                popup.lastMessageId = latestMessageId;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            popup.messagesContainer.innerHTML = '<div class="chat-popup-loading">Lỗi tải tin nhắn</div>';
        }
    }

    addMessageToUI(userId, message) {
        const popup = this.popups.get(userId);
        if (!popup) return;

        const isSent = message.senderId === this.currentUser.userId;
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;

        let contentHtml = '';

        // Avatar (only for received messages)
        if (!isSent) {
            const avatarHtml = popup.element.querySelector('.chat-popup-avatar').innerHTML;
            messageDiv.innerHTML += `<div class="chat-message-avatar">${avatarHtml}</div>`;
        }

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-message-content';

        if (message.imageUrl) {
            const img = document.createElement('img');
            img.src = message.imageUrl;
            img.className = 'chat-message-image';
            img.onclick = () => window.open(message.imageUrl, '_blank');
            contentDiv.appendChild(img);
        }

        if (message.content && message.content.trim()) {
            const bubble = document.createElement('div');
            bubble.className = 'chat-message-bubble';
            bubble.textContent = message.content;
            contentDiv.appendChild(bubble);
        }

        messageDiv.appendChild(contentDiv);
        popup.messagesContainer.appendChild(messageDiv);
    }

    scrollToBottom(popup) {
        if (popup && popup.messagesContainer) {
            popup.messagesContainer.scrollTop = popup.messagesContainer.scrollHeight;
        }
    }

    closeChat(userId) {
        const popup = this.popups.get(userId);
        if (popup) {
            if (popup.pollingInterval) {
                clearInterval(popup.pollingInterval);
            }
            popup.element.style.animation = 'slideDown 0.2s ease';
            setTimeout(() => {
                popup.element.remove();
                this.popups.delete(userId);
            }, 200);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add slide down animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatPopupManager = new ChatPopupManager();
    });
} else {
    window.chatPopupManager = new ChatPopupManager();
}

// Global function to open chat popup
window.openChatPopup = function(userId, userName, userAvatar) {
    if (window.chatPopupManager) {
        window.chatPopupManager.openChat(userId, userName, userAvatar);
    }
};
