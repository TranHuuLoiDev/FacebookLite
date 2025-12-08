// Notifications module - Handles notification loading, display, and interactions
let notificationDropdownVisible = false;
let notificationRefreshInterval;

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.querySelector('.notification-dropdown');
    notificationDropdownVisible = !notificationDropdownVisible;
    
    if (notificationDropdownVisible) {
        dropdown.classList.add('active');
        loadNotifications();
        
        // Start auto-refresh
        notificationRefreshInterval = setInterval(() => {
            loadNotifications();
            updateNotificationBadge();
        }, 10000); // Refresh every 10 seconds
    } else {
        dropdown.classList.remove('active');
        
        // Stop auto-refresh
        if (notificationRefreshInterval) {
            clearInterval(notificationRefreshInterval);
        }
    }
}

// Load notifications
async function loadNotifications() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/notifications/${currentUser.userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const notifications = await response.json();
        
        console.log('Loaded notifications:', notifications); // Debug
        displayNotifications(notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
        const notificationList = document.querySelector('.notification-list');
        if (notificationList) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <i class="fa-regular fa-bell"></i>
                    <p>Không thể tải thông báo</p>
                </div>
            `;
        }
    }
}

// Display notifications
function displayNotifications(notifications) {
    const notificationList = document.querySelector('.notification-list');
    
    if (!notifications || notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="fa-regular fa-bell"></i>
                <p>Bạn không có thông báo nào</p>
            </div>
        `;
        return;
    }
    
    notificationList.innerHTML = notifications.filter(n => n && n.actorFirstName).map(notification => `
        <div class="notification-item ${notification.isRead ? '' : 'unread'}" 
             data-id="${notification.id}"
             data-type="${notification.type}"
             data-related-id="${notification.relatedId || ''}"
             onclick="handleNotificationClick(${notification.id}, '${notification.type}', ${notification.relatedId || 'null'})">
            <div class="notification-avatar-wrapper">
                ${createAvatarHtml(notification.actorProfilePicture, notification.actorFirstName, notification.actorLastName, 56)}
                ${getNotificationIconBadge(notification.type)}
            </div>
            <div class="notification-content">
                <div class="notification-text">
                    <span class="actor-name">${escapeHtml((notification.actorFirstName || '') + ' ' + (notification.actorLastName || ''))}</span>
                    <span>${getNotificationActionText(notification)}</span>
                </div>
                ${getNotificationMessage(notification)}
                <div class="notification-time">${formatTimeAgo(notification.createdAt)}</div>
            </div>
        </div>
    `).join('');
}

// Get notification icon badge based on type
function getNotificationIconBadge(type) {
    const icons = {
        'like': '<i class="fa-solid fa-heart"></i>',
        'comment': '<i class="fa-solid fa-comment"></i>',
        'friend_request': '<i class="fa-solid fa-user-plus"></i>',
        'friend_accept': '<i class="fa-solid fa-check"></i>'
    };
    
    const icon = icons[type] || '<i class="fa-solid fa-bell"></i>';
    return `<div class="notification-icon-badge ${type}">${icon}</div>`;
}

// Get notification action text based on type
function getNotificationActionText(notification) {
    const texts = {
        'like': ' đã thích bài viết của bạn.',
        'comment': ' đã bình luận về bài viết của bạn.',
        'friend_request': ' đã gửi lời mời kết bạn cho bạn.',
        'friend_accept': ' đã chấp nhận lời mời kết bạn của bạn.'
    };
    
    return texts[notification.type] || '';
}

// Get notification message/content
function getNotificationMessage(notification) {
    if (notification.type === 'comment' && notification.content) {
        // Extract comment text from content
        const match = notification.content.match(/đã bình luận: (.+)/);
        if (match && match[1]) {
            const commentText = match[1];
            return `<div class="notification-message">"${escapeHtml(commentText)}"</div>`;
        }
    }
    return '';
}

// Get notification text based on type (legacy function for compatibility)
function getNotificationText(notification) {
    return getNotificationActionText(notification);
}

// Handle notification click
async function handleNotificationClick(notificationId, type, relatedId) {
    // Mark as read
    await markNotificationAsRead(notificationId);
    
    // Close notification dropdown first
    toggleNotificationDropdown();
    
    // Navigate based on type
    switch(type) {
        case 'like':
        case 'comment':
            if (relatedId) {
                // Find the post element
                const postElement = document.querySelector(`[data-post-id="${relatedId}"]`);
                if (postElement) {
                    // Scroll to the post smoothly
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight the post with animation
                    postElement.style.transition = 'background-color 0.3s ease';
                    postElement.style.backgroundColor = '#e7f3ff';
                    postElement.style.boxShadow = '0 0 0 3px #0866ff';
                    
                    // If it's a comment notification, also open the comment section
                    if (type === 'comment') {
                        setTimeout(() => {
                            const commentSection = document.getElementById(`comment-section-${relatedId}`);
                            if (commentSection && commentSection.style.display === 'none') {
                                toggleCommentSection(relatedId);
                            }
                        }, 500);
                    }
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        postElement.style.backgroundColor = '';
                        postElement.style.boxShadow = '';
                    }, 3000);
                } else {
                    // Post not found, maybe need to scroll down to load it
                    console.log('Post not found in current view, scrolling to load more...');
                }
            }
            break;
        case 'friend_request':
            // Open friend requests dropdown
            if (typeof toggleFriendRequestDropdown === 'function') {
                toggleFriendRequestDropdown();
            }
            break;
        case 'friend_accept':
            // Could navigate to the friend's profile or show friends list
            console.log('Friend accepted notification clicked');
            break;
    }
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        
        // Update badge
        updateNotificationBadge();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
    if (!currentUser) return;
    
    try {
        await fetch(`/api/notifications/mark-all-read/${currentUser.userId}`, {
            method: 'PUT'
        });
        
        // Reload notifications
        loadNotifications();
        updateNotificationBadge();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}

// Update notification badge
async function updateNotificationBadge() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/notifications/count/${currentUser.userId}`);
        if (!response.ok) {
            console.error('Failed to fetch notification count:', response.status);
            return;
        }
        const count = await response.json();
        
        console.log('Notification count:', count); // Debug
        
        const badge = document.querySelector('.notification-icon .notification-badge');
        if (badge) {
            if (count > 0) {
                badge.style.display = 'block';
                badge.textContent = count > 99 ? '99+' : count;
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating notification badge:', error);
    }
}

// Close notification dropdown when clicking outside
document.addEventListener('click', (e) => {
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationIcon && notificationDropdown) {
        if (!notificationIcon.contains(e.target) && !notificationDropdown.contains(e.target)) {
            if (notificationDropdownVisible) {
                toggleNotificationDropdown();
            }
        }
    }
});

// Note: updateNotificationBadge() is called from home.js after currentUser is initialized
