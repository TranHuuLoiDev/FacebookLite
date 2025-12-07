// Contacts Sidebar Module

// Load contacts list
async function loadContacts() {
    try {
        const response = await fetch('http://localhost:8080/api/users');
        const users = await response.json();
        
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = '';
        
        // Filter out current user and show others
        const otherUsers = users.filter(user => user.id !== currentUser.userId);
        
        if (otherUsers.length === 0) {
            contactsList.innerHTML = '<div style="text-align: center; padding: 16px; color: #65676b;">Chưa có người dùng khác</div>';
            return;
        }
        
        otherUsers.forEach(user => {
            const contactElement = createContactElement(user);
            contactsList.appendChild(contactElement);
        });
    } catch (error) {
        console.error('Error loading contacts:', error);
        document.getElementById('contactsList').innerHTML = '<div style="text-align: center; padding: 16px; color: #e74c3c;">Lỗi tải danh sách</div>';
    }
}

// Create contact element
function createContactElement(user) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.style.cursor = 'pointer';
    
    const initial = getUserInitial(user);
    const fullName = getUserFullName(user);
    
    const avatarHtml = user.profilePicture 
        ? `<img src="${user.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
        : initial;
    
    div.innerHTML = `
        <div class="contact-avatar">
            ${avatarHtml}
            <div class="online-status"></div>
        </div>
        <span style="flex: 1;">${fullName}</span>
        <div class="contact-actions">
            <button class="contact-action-btn" onclick="event.stopPropagation(); window.location.href='/html/profile.html?userId=${user.id}'" title="Xem trang cá nhân">
                <i class="fa-solid fa-user"></i>
            </button>
            <button class="contact-action-btn" onclick="event.stopPropagation(); openChatWithUser(${user.id}, '${fullName.replace(/'/g, "\\'")}', '${user.profilePicture || ''}')" title="Nhắn tin">
                <i class="fa-solid fa-message"></i>
            </button>
        </div>
    `;
    
    div.addEventListener('click', () => {
        // Default click goes to profile
        window.location.href = `/html/profile.html?userId=${user.id}`;
    });
    
    return div;
}

// Open chat with user
function openChatWithUser(userId, fullName, profilePicture) {
    localStorage.setItem('chatWithUser', JSON.stringify({
        userId: userId,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' '),
        username: fullName,
        profilePicture: profilePicture
    }));
    window.location.href = '/html/messages.html';
}
