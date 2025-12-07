let currentUser = null;

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check authentication
const userStr = localStorage.getItem('user');
if (!userStr) {
    window.location.href = '/html/login.html';
} else {
    currentUser = JSON.parse(userStr);
    updateUserInfo();
    loadPosts();
    loadContacts();
}

function updateUserInfo() {
    const initial = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
    
    // Update avatar with image or initial
    updateAvatar('userAvatar', currentUser.profilePicture, initial);
    updateAvatar('dropdownAvatar', currentUser.profilePicture, initial);
    updateAvatar('createPostAvatar', currentUser.profilePicture, initial);
    updateAvatar('modalAvatar', currentUser.profilePicture, initial);
    updateAvatar('sidebarAvatar', currentUser.profilePicture, initial);
    
    document.getElementById('dropdownUsername').textContent = fullName;
    document.getElementById('sidebarUsername').textContent = fullName;
    document.getElementById('modalUsername').textContent = fullName;
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

// Messenger Dropdown
let messengerConversations = [];
let messengerLoadInterval = null;

function toggleMessengerDropdown() {
    const dropdown = document.getElementById('messengerDropdown');
    const isActive = dropdown.classList.contains('active');
    
    // Close user dropdown if open
    document.getElementById('userDropdown').classList.remove('active');
    
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

async function loadMessengerConversations() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
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

function createMessengerConversationItem(conv) {
    const div = document.createElement('div');
    div.className = 'messenger-conversation-item';
    
    const initial = conv.firstName ? conv.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${conv.firstName || ''} ${conv.lastName || ''}`.trim() || conv.username;
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

// Messenger search
document.addEventListener('DOMContentLoaded', () => {
    const messengerSearch = document.getElementById('messengerSearch');
    if (messengerSearch) {
        messengerSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = messengerConversations.filter(conv => {
                const fullName = `${conv.firstName} ${conv.lastName}`.toLowerCase();
                const username = conv.username.toLowerCase();
                return fullName.includes(searchTerm) || username.includes(searchTerm);
            });
            displayMessengerConversations(filtered);
        });
    }
});

function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const isActive = dropdown.classList.contains('active');
    
    // Close messenger dropdown if open
    document.getElementById('messengerDropdown').classList.remove('active');
    if (messengerLoadInterval) {
        clearInterval(messengerLoadInterval);
        messengerLoadInterval = null;
    }
    
    if (!isActive) {
        dropdown.classList.add('active');
    } else {
        dropdown.classList.remove('active');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    const messengerDropdown = document.getElementById('messengerDropdown');
    const avatar = document.getElementById('userAvatar');
    const messengerBtn = document.getElementById('messengerBtn');
    
    // Close user dropdown
    if (userDropdown && !userDropdown.contains(event.target) && !avatar.contains(event.target)) {
        userDropdown.classList.remove('active');
    }
    
    // Close messenger dropdown
    if (messengerDropdown && !messengerDropdown.contains(event.target) && !messengerBtn.contains(event.target)) {
        messengerDropdown.classList.remove('active');
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
            messengerLoadInterval = null;
        }
    }
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/html/login.html';
}

function goToProfile() {
    window.location.href = '/html/profile.html';
}

// Open create post modal
document.getElementById('openCreatePost').addEventListener('click', () => {
    document.getElementById('createPostModal').classList.add('active');
    document.getElementById('postContent').focus();
});

// Close create post modal
function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
    document.getElementById('postContent').value = '';
}

// Close modal on outside click
document.getElementById('createPostModal').addEventListener('click', (e) => {
    if (e.target.id === 'createPostModal') {
        closeCreatePostModal();
    }
});

// Submit post
let selectedPostImage = null;

function handlePostImageSelect(event) {
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
        
        selectedPostImage = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('postImagePreview').src = e.target.result;
            document.getElementById('postImagePreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removePostImage() {
    selectedPostImage = null;
    document.getElementById('postImageInput').value = '';
    document.getElementById('postImagePreviewContainer').style.display = 'none';
}

document.getElementById('submitPost').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content && !selectedPostImage) {
        alert('Vui lòng nhập nội dung hoặc chọn ảnh');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('userId', currentUser.userId);
        formData.append('content', content || '');
        if (selectedPostImage) {
            formData.append('image', selectedPostImage);
        }
        
        const submitButton = document.getElementById('submitPost');
        submitButton.textContent = 'Đang đăng...';
        submitButton.disabled = true;
        
        const response = await fetch('http://localhost:8080/api/posts/create-with-image', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('postContent').value = '';
            removePostImage();
            closeCreatePostModal();
            loadPosts();
        } else {
            alert(data.message || 'Không thể đăng bài viết. Vui lòng thử lại.');
        }
        
        submitButton.textContent = 'Đăng';
        submitButton.disabled = false;
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
        document.getElementById('submitPost').textContent = 'Đăng';
        document.getElementById('submitPost').disabled = false;
    }
});

// Load posts
async function loadPosts() {
    try {
        const response = await fetch('http://localhost:8080/api/posts');
        const posts = await response.json();
        
        const postsFeed = document.getElementById('postsFeed');
        postsFeed.innerHTML = '';
        
        posts.forEach(post => {
            const postCard = createPostCard(post);
            postsFeed.appendChild(postCard);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const initial = post.user?.firstName ? post.user.firstName.charAt(0).toUpperCase() : 'U';
    const authorName = post.user ? `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim() || post.user.username : 'Unknown';
    const timeAgo = formatDate(post.createdAt);
    
    // Check if user has profile picture
    const avatarHtml = post.user?.profilePicture 
        ? `<img src="${post.user.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
        : initial;
    
    const postImageHtml = post.imageUrl 
        ? `<div class="post-image"><img src="${post.imageUrl}" alt="Post image" style="width: 100%; border-radius: 0; display: block;"></div>` 
        : '';
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-avatar" onclick="window.location.href='/html/profile.html?userId=${post.userId}'" style="cursor: pointer;">${avatarHtml}</div>
            <div class="post-author-info">
                <div class="post-author-name" onclick="window.location.href='/html/profile.html?userId=${post.userId}'" style="cursor: pointer;">${authorName}</div>
                <div class="post-time">${timeAgo} · <i class="fa-solid fa-earth-africa"></i></div>
            </div>
            <div class="post-more">⋯</div>
        </div>
        <div class="post-content">${post.content}</div>
        ${postImageHtml}
        <div class="post-stats">
            <span id="like-count-${post.id}"><i class="fa-regular fa-thumbs-up"></i> ${post.likeCount || 0}</span>
            <span id="comment-count-${post.id}">${post.commentCount || 0} bình luận · ${post.shareCount || 0} lượt chia sẻ</span>
        </div>
        <div class="post-actions">
            <div class="post-action-btn" id="like-btn-${post.id}" onclick="toggleLike(${post.id})">
                <span><i class="fa-regular fa-thumbs-up"></i></span>
                <span>Thích</span>
            </div>
            <div class="post-action-btn" onclick="toggleCommentSection(${post.id})">
                <span><i class="fa-regular fa-comment"></i></span>
                <span>Bình luận</span>
            </div>
            <div class="post-action-btn">
                <span><i class="fa-solid fa-share"></i></span>
                <span>Chia sẻ</span>
            </div>
        </div>
        <div class="comment-section" id="comment-section-${post.id}" style="display: none;">
            <div class="comments-list" id="comments-list-${post.id}">
                <!-- Comments will be loaded here -->
            </div>
            <div class="comment-input-box">
                <div class="comment-avatar">${currentUser.profilePicture ? `<img src="${currentUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : initial}</div>
                <div class="comment-input-wrapper">
                    <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Viết bình luận...">
                    <button class="comment-send-btn" onclick="postComment(${post.id})">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Check if user liked this post
    checkIfLiked(post.id);
    
    return card;
}

async function toggleLike(postId) {
    try {
        const response = await fetch('http://localhost:8080/api/likes/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.userId,
                postId: postId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const likeBtn = document.getElementById(`like-btn-${postId}`);
            const likeCountSpan = document.getElementById(`like-count-${postId}`);
            const icon = likeBtn.querySelector('i');
            
            if (data.liked) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                likeBtn.style.color = '#2e89ff';
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                likeBtn.style.color = '';
            }
            
            // Update like count without reload
            const response2 = await fetch(`http://localhost:8080/api/posts/${postId}`);
            const post = await response2.json();
            likeCountSpan.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> ${post.likeCount || 0}`;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

async function checkIfLiked(postId) {
    try {
        const response = await fetch(`http://localhost:8080/api/likes/check?userId=${currentUser.userId}&postId=${postId}`);
        const data = await response.json();
        
        if (data.liked) {
            const likeBtn = document.getElementById(`like-btn-${postId}`);
            const icon = likeBtn.querySelector('i');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            likeBtn.style.color = '#2e89ff';
        }
    } catch (error) {
        console.error('Error checking like status:', error);
    }
}

async function toggleCommentSection(postId) {
    const commentSection = document.getElementById(`comment-section-${postId}`);
    
    if (commentSection.style.display === 'none') {
        commentSection.style.display = 'block';
        await loadComments(postId);
    } else {
        commentSection.style.display = 'none';
    }
}

async function loadComments(postId) {
    try {
        const response = await fetch(`http://localhost:8080/api/comments/post/${postId}`);
        
        if (!response.ok) {
            console.error('Failed to load comments. Status:', response.status);
            const commentsList = document.getElementById(`comments-list-${postId}`);
            if (commentsList) {
                commentsList.innerHTML = '<div style="text-align: center; padding: 16px; color: #e74c3c;">Lỗi tải bình luận</div>';
            }
            return;
        }
        
        const comments = await response.json();
        
        console.log('Loaded comments for post', postId, ':', comments);
        console.log('Is array?', Array.isArray(comments));
        
        const commentsList = document.getElementById(`comments-list-${postId}`);
        if (!commentsList) {
            console.error('Comments list element not found for post', postId);
            return;
        }
        
        commentsList.innerHTML = '';
        
        // Check if comments is an array
        if (!Array.isArray(comments)) {
            console.error('Comments is not an array:', comments);
            commentsList.innerHTML = '<div style="text-align: center; padding: 16px; color: #e74c3c;">Lỗi định dạng dữ liệu</div>';
            return;
        }
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div style="text-align: center; padding: 16px; color: #b0b3b8;">Chưa có bình luận nào</div>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment, postId);
            commentsList.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsList = document.getElementById(`comments-list-${postId}`);
        if (commentsList) {
            commentsList.innerHTML = '<div style="text-align: center; padding: 16px; color: #e74c3c;">Lỗi tải bình luận</div>';
        }
    }
}

function createCommentElement(comment, postId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const initial = comment.user.firstName ? comment.user.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim() || comment.user.username;
    const timeAgo = formatDate(comment.createdAt);
    
    const avatarHtml = comment.user.profilePicture 
        ? `<img src="${comment.user.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
        : initial;
    
    div.innerHTML = `
        <div class="comment-avatar">${avatarHtml}</div>
        <div class="comment-content-wrapper">
            <div class="comment-bubble">
                <div class="comment-author">${fullName}</div>
                <div class="comment-text">${comment.content}</div>
            </div>
            <div class="comment-actions">
                <span class="comment-time">${timeAgo}</span>
                ${comment.user.id === currentUser.userId ? `<span class="comment-delete" onclick="deleteComment(${comment.id}, ${postId})">Xóa</span>` : ''}
            </div>
        </div>
    `;
    
    return div;
}

async function postComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    
    if (!content) {
        alert('Vui lòng nhập nội dung bình luận');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.userId,
                postId: postId,
                content: content
            })
        });
        
        if (response.ok) {
            input.value = '';
            await loadComments(postId);
            
            // Update comment count without reload
            const response2 = await fetch(`http://localhost:8080/api/posts/${postId}`);
            const post = await response2.json();
            const commentCountSpan = document.getElementById(`comment-count-${postId}`);
            commentCountSpan.textContent = `${post.commentCount || 0} bình luận · ${post.shareCount || 0} lượt chia sẻ`;
        } else {
            const data = await response.json();
            alert(data.message || 'Không thể đăng bình luận');
        }
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Có lỗi xảy ra khi đăng bình luận');
    }
}

async function deleteComment(commentId, postId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentId}?userId=${currentUser.userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadComments(postId);
            
            // Update comment count without reload
            const response2 = await fetch(`http://localhost:8080/api/posts/${postId}`);
            const post = await response2.json();
            const commentCountSpan = document.getElementById(`comment-count-${postId}`);
            commentCountSpan.textContent = `${post.commentCount || 0} bình luận · ${post.shareCount || 0} lượt chia sẻ`;
        } else {
            const data = await response.json();
            alert(data.message || 'Không thể xóa bình luận');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Có lỗi xảy ra khi xóa bình luận');
    }
}

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

// Profile Picture Upload Functions
let selectedFile = null;

function openProfilePictureUpload() {
    document.getElementById('uploadProfileModal').classList.add('active');
    document.getElementById('userDropdown').classList.remove('active');
}

function closeUploadProfileModal() {
    document.getElementById('uploadProfileModal').classList.remove('active');
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadButton').style.display = 'none';
    document.getElementById('profilePictureInput').value = '';
    selectedFile = null;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
    }
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File không được vượt quá 5MB');
        return;
    }
    
    selectedFile = file;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('uploadButton').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function uploadProfilePicture() {
    if (!selectedFile) {
        alert('Vui lòng chọn ảnh');
        return;
    }
    
    if (!currentUser || !currentUser.userId) {
        alert('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
        window.location.href = '/html/login.html';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', currentUser.userId.toString());
    
    try {
        const uploadButton = document.getElementById('uploadButton');
        uploadButton.textContent = 'Đang tải lên...';
        uploadButton.disabled = true;
        
        const response = await fetch('http://localhost:8080/api/upload/profile-picture', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update current user with new profile picture
            currentUser.profilePicture = data.profilePicture;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Update UI
            updateUserInfo();
            
            alert('Cập nhật ảnh đại diện thành công!');
            closeUploadProfileModal();
        } else {
            alert(data.message || 'Có lỗi xảy ra khi upload ảnh');
        }
        
        uploadButton.textContent = 'Tải lên';
        uploadButton.disabled = false;
        
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
        document.getElementById('uploadButton').textContent = 'Tải lên';
        document.getElementById('uploadButton').disabled = false;
    }
}

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

function createContactElement(user) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.style.cursor = 'pointer';
    
    const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    
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

// Friend Request Management
let friendRequestLoadInterval = null;

function toggleFriendRequestDropdown() {
    const dropdown = document.getElementById('friendRequestDropdown');
    const messengerDropdown = document.getElementById('messengerDropdown');
    
    // Close messenger dropdown if open
    if (messengerDropdown.classList.contains('active')) {
        messengerDropdown.classList.remove('active');
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
            messengerLoadInterval = null;
        }
    }
    
    // Toggle friend request dropdown
    dropdown.classList.toggle('active');
    
    if (dropdown.classList.contains('active')) {
        loadFriendRequests();
        // Auto refresh every 10 seconds
        friendRequestLoadInterval = setInterval(loadFriendRequests, 10000);
    } else {
        if (friendRequestLoadInterval) {
            clearInterval(friendRequestLoadInterval);
            friendRequestLoadInterval = null;
        }
    }
}

async function loadFriendRequests() {
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/received/${currentUser.userId}`);
        const requests = await response.json();
        
        displayFriendRequests(requests);
        updateFriendRequestBadge(requests.length);
    } catch (error) {
        console.error('Error loading friend requests:', error);
    }
}

function displayFriendRequests(requests) {
    const listContainer = document.getElementById('friendRequestsList');
    
    if (requests.length === 0) {
        listContainer.innerHTML = `
            <div class="friend-request-empty">
                <div class="friend-request-empty-icon">👥</div>
                <div>Không có lời mời kết bạn nào</div>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = '';
    requests.forEach(request => {
        const item = createFriendRequestItem(request);
        listContainer.appendChild(item);
    });
}

function createFriendRequestItem(request) {
    const div = document.createElement('div');
    div.className = 'friend-request-item';
    
    const initial = request.senderFirstName ? request.senderFirstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${request.senderFirstName || ''} ${request.senderLastName || ''}`.trim() || request.senderUsername;
    const timeAgo = formatTimeAgo(request.createdAt);
    
    const avatarHtml = request.senderProfilePicture 
        ? `<img src="${request.senderProfilePicture}" alt="${fullName}">` 
        : initial;
    
    div.innerHTML = `
        <div class="friend-request-avatar">
            ${avatarHtml}
        </div>
        <div class="friend-request-content">
            <div class="friend-request-name">${escapeHtml(fullName)}</div>
            <div class="friend-request-time">${timeAgo}</div>
            <div class="friend-request-actions">
                <button class="friend-request-btn friend-request-btn-accept" onclick="acceptFriendRequest(${request.id})">
                    Chấp nhận
                </button>
                <button class="friend-request-btn friend-request-btn-reject" onclick="rejectFriendRequest(${request.id})">
                    Từ chối
                </button>
            </div>
        </div>
    `;
    
    return div;
}

async function acceptFriendRequest(requestId) {
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/${requestId}/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.userId })
        });
        
        if (response.ok) {
            // Reload friend requests
            loadFriendRequests();
            // Reload contacts to show new friend
            loadContacts();
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Lỗi khi chấp nhận lời mời kết bạn');
    }
}

async function rejectFriendRequest(requestId) {
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/${requestId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.userId })
        });
        
        if (response.ok) {
            // Reload friend requests
            loadFriendRequests();
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        alert('Lỗi khi từ chối lời mời kết bạn');
    }
}

function updateFriendRequestBadge(count) {
    const badge = document.getElementById('friendRequestBadge');
    
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Load friend request count on page load
if (currentUser) {
    fetch(`http://localhost:8080/api/friend-requests/count/${currentUser.userId}`)
        .then(response => response.json())
        .then(data => updateFriendRequestBadge(data.count))
        .catch(error => console.error('Error loading friend request count:', error));
}

// Global Search Functionality
let searchTimeout;
let allUsersList = [];

async function loadAllUsers() {
    try {
        const response = await fetch('http://localhost:8080/api/users');
        allUsersList = await response.json();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load users on page load
loadAllUsers();

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            if (query.length === 0) {
                searchResults.style.display = 'none';
                return;
            }
            
            if (query.length < 2) {
                return;
            }
            
            // Show loading
            searchResults.style.display = 'block';
            searchResults.querySelector('.search-results-content').innerHTML = 
                '<div class="search-loading">Đang tìm kiếm...</div>';
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim().length >= 2) {
                searchResults.style.display = 'block';
            }
        });
    }
});

async function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    const resultsContent = searchResults.querySelector('.search-results-content');
    
    try {
        const lowerQuery = query.toLowerCase();
        
        // Search in users
        const userResults = allUsersList.filter(user => {
            if (user.id === currentUser.userId) return false;
            
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            const username = (user.username || '').toLowerCase();
            
            return fullName.includes(lowerQuery) || username.includes(lowerQuery);
        }).slice(0, 5);
        
        if (userResults.length === 0) {
            resultsContent.innerHTML = `
                <div class="search-no-results">
                    <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
                    <div>Không tìm thấy kết quả</div>
                </div>
            `;
            return;
        }
        
        let html = '<div class="search-section-title">Người dùng</div>';
        
        userResults.forEach(user => {
            const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
            const avatarHtml = user.profilePicture 
                ? `<img src="${user.profilePicture}" alt="${fullName}">` 
                : initial;
            
            html += `
                <div class="search-result-item" onclick="viewProfile(${user.id})">
                    <div class="search-result-avatar">${avatarHtml}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${escapeHtml(fullName)}</div>
                        <div class="search-result-subtitle">@${escapeHtml(user.username)}</div>
                    </div>
                </div>
            `;
        });
        
        resultsContent.innerHTML = html;
        
    } catch (error) {
        console.error('Error performing search:', error);
        resultsContent.innerHTML = `
            <div class="search-no-results">
                <div>Lỗi khi tìm kiếm</div>
            </div>
        `;
    }
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.search-box');
    const searchResults = document.getElementById('searchResults');
    
    if (searchBox && searchResults && !searchBox.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});

// Find Friends Modal
let allUsers = [];

async function openFindFriendsModal() {
    document.getElementById('findFriendsModal').classList.add('active');
    await loadFriendSuggestions();
}

function closeFindFriendsModal() {
    document.getElementById('findFriendsModal').classList.remove('active');
}

async function loadFriendSuggestions() {
    try {
        const [usersResponse, friendsResponse, requestsResponse] = await Promise.all([
            fetch('http://localhost:8080/api/users'),
            fetch(`http://localhost:8080/api/friendships/list/${currentUser.userId}`),
            fetch(`http://localhost:8080/api/friend-requests/sent/${currentUser.userId}`)
        ]);
        
        const users = await usersResponse.json();
        const friends = await friendsResponse.json();
        const sentRequests = await requestsResponse.json();
        
        // Filter out current user, friends, and users with pending requests
        const friendIds = friends.map(f => f.friendId);
        const requestedIds = sentRequests.map(r => r.receiverId);
        
        allUsers = users.filter(user => 
            user.id !== currentUser.userId && 
            !friendIds.includes(user.id) &&
            !requestedIds.includes(user.id)
        );
        
        displayFriendSuggestions(allUsers);
    } catch (error) {
        console.error('Error loading friend suggestions:', error);
        document.getElementById('friendSuggestionsList').innerHTML = 
            '<div style="text-align: center; padding: 20px; color: #e74c3c;">Lỗi tải danh sách</div>';
    }
}

function displayFriendSuggestions(users) {
    const container = document.getElementById('friendSuggestionsList');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #b0b3b8;">
                <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
                <div>Không có gợi ý kết bạn</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    users.forEach(user => {
        const item = createFriendSuggestionItem(user);
        container.appendChild(item);
    });
}

function createFriendSuggestionItem(user) {
    const div = document.createElement('div');
    div.className = 'friend-suggestion-item';
    div.id = `suggestion-${user.id}`;
    
    const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    
    const avatarHtml = user.profilePicture 
        ? `<img src="${user.profilePicture}" alt="${fullName}">` 
        : initial;
    
    div.innerHTML = `
        <div class="friend-suggestion-avatar">
            ${avatarHtml}
        </div>
        <div class="friend-suggestion-info">
            <div class="friend-suggestion-name" onclick="viewProfile(${user.id})">${escapeHtml(fullName)}</div>
            <div class="friend-suggestion-mutual">Gợi ý cho bạn</div>
        </div>
        <div class="friend-suggestion-actions">
            <button class="friend-suggestion-btn friend-suggestion-btn-add" onclick="sendFriendRequestFromSuggestion(${user.id})">
                Thêm bạn bè
            </button>
            <button class="friend-suggestion-btn friend-suggestion-btn-remove" onclick="removeSuggestion(${user.id})">
                Xóa
            </button>
        </div>
    `;
    
    return div;
}

async function sendFriendRequestFromSuggestion(receiverId) {
    try {
        const response = await fetch('http://localhost:8080/api/friend-requests/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: currentUser.userId,
                receiverId: receiverId
            })
        });
        
        if (response.ok) {
            // Remove from suggestions
            removeSuggestion(receiverId);
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Lỗi khi gửi lời mời kết bạn');
    }
}

function removeSuggestion(userId) {
    const element = document.getElementById(`suggestion-${userId}`);
    if (element) {
        element.remove();
    }
    
    // Update allUsers array
    allUsers = allUsers.filter(u => u.id !== userId);
    
    // Check if list is empty
    if (allUsers.length === 0) {
        displayFriendSuggestions([]);
    }
}

function viewProfile(userId) {
    window.location.href = `/html/profile.html?userId=${userId}`;
}

// Search friends
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFriends');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allUsers.filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                const username = user.username.toLowerCase();
                return fullName.includes(searchTerm) || username.includes(searchTerm);
            });
            displayFriendSuggestions(filtered);
        });
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const friendRequestBtn = document.getElementById('friendRequestBtn');
    const friendRequestDropdown = document.getElementById('friendRequestDropdown');
    const messengerBtn = document.getElementById('messengerBtn');
    const messengerDropdown = document.getElementById('messengerDropdown');
    
    if (friendRequestDropdown && !friendRequestBtn.contains(e.target) && !friendRequestDropdown.contains(e.target)) {
        friendRequestDropdown.classList.remove('active');
        if (friendRequestLoadInterval) {
            clearInterval(friendRequestLoadInterval);
            friendRequestLoadInterval = null;
        }
    }
    
    if (messengerDropdown && !messengerBtn.contains(e.target) && !messengerDropdown.contains(e.target)) {
        messengerDropdown.classList.remove('active');
        if (messengerLoadInterval) {
            clearInterval(messengerLoadInterval);
            messengerLoadInterval = null;
        }
    }
});
