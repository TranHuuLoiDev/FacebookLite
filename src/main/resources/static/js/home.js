let currentUser = null;

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
            <div class="post-avatar">${avatarHtml}</div>
            <div class="post-author-info">
                <div class="post-author-name">${authorName}</div>
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
        <span>${fullName}</span>
    `;
    
    div.addEventListener('click', () => {
        // Save selected user to localStorage and redirect to messages
        localStorage.setItem('chatWithUser', JSON.stringify({
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profilePicture: user.profilePicture
        }));
        window.location.href = '/html/messages.html';
    });
    
    return div;
}
