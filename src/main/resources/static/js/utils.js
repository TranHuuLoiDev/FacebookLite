// Utility Functions

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date/time to human readable format
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// Format date for posts
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return diffMins + ' phút';
    if (diffHours < 24) return diffHours + ' giờ';
    if (diffDays < 7) return diffDays + ' ngày';
    
    return date.toLocaleDateString('vi-VN');
}

// Update avatar with image or initial
function updateAvatar(elementId, profilePicture, initial) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (profilePicture && profilePicture.trim() !== '') {
        element.innerHTML = `<img src="${profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        element.textContent = initial;
        element.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// Get user's initial from name
function getUserInitial(user) {
    if (user.firstName) {
        return user.firstName.charAt(0).toUpperCase();
    }
    if (user.username) {
        return user.username.charAt(0).toUpperCase();
    }
    return 'U';
}

// Get user's full name
function getUserFullName(user) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
}

// Create avatar HTML
function createAvatarHtml(user) {
    const initial = getUserInitial(user);
    
    if (user.profilePicture && user.profilePicture.trim() !== '') {
        return `<img src="${user.profilePicture}" alt="${getUserFullName(user)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    
    return initial;
}
