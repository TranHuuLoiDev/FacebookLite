let currentUser = null;

// Check authentication
const userStr = localStorage.getItem('user');
if (!userStr) {
    window.location.href = '/html/login.html';
} else {
    currentUser = JSON.parse(userStr);
    updateUserInfo();
    loadPosts();
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

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/html/login.html';
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
document.getElementById('submitPost').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value.trim();
    
    if (!content) {
        alert('Vui lòng nhập nội dung bài viết');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                content: content,
                privacy: 'public'
            })
        });
        
        if (response.ok) {
            closeCreatePostModal();
            loadPosts();
        } else {
            alert('Không thể đăng bài viết. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
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
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${avatarHtml}</div>
            <div class="post-author-info">
                <div class="post-author-name">${authorName}</div>
                <div class="post-time">${timeAgo} · 🌍</div>
            </div>
            <div class="post-more">⋯</div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-stats">
            <span>👍 ${post.likeCount || 0}</span>
            <span>${post.commentCount || 0} bình luận · ${post.shareCount || 0} lượt chia sẻ</span>
        </div>
        <div class="post-actions">
            <div class="post-action-btn" onclick="likePost(${post.id})">
                <span>👍</span>
                <span>Thích</span>
            </div>
            <div class="post-action-btn">
                <span>💬</span>
                <span>Bình luận</span>
            </div>
            <div class="post-action-btn">
                <span>↗️</span>
                <span>Chia sẻ</span>
            </div>
        </div>
    `;
    
    return card;
}

async function likePost(postId) {
    try {
        const response = await fetch('http://localhost:8080/api/posts/' + postId + '/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id
            })
        });
        
        if (response.ok) {
            loadPosts();
        }
    } catch (error) {
        console.error('Error liking post:', error);
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
            // Update current user
            currentUser = data.user;
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
