let currentUser = null;
let selectedPostImage = null;
let selectedFile = null;

// Get userId from URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get('userId');

// Check authentication
const userStr = localStorage.getItem('user');
if (!userStr) {
    window.location.href = '/html/login.html';
} else {
    currentUser = JSON.parse(userStr);
    const userIdToLoad = profileUserId || currentUser.userId;
    loadUserProfile(userIdToLoad);
}

async function loadUserProfile(userId) {
    try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        const user = await response.json();
        
        if (response.ok) {
            displayUserProfile(user);
            loadUserPosts(userId);
        } else {
            alert('Không thể tải thông tin người dùng');
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('Có lỗi xảy ra khi tải trang cá nhân');
    }
}

function displayUserProfile(user) {
    const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    
    // Update profile picture
    updateAvatar('profilePicture', user.profilePicture, initial);
    updateAvatar('createPostAvatar', user.profilePicture, initial);
    updateAvatar('modalAvatar', user.profilePicture, initial);
    
    // Update header avatars (for current user)
    if (user.id === currentUser.userId) {
        updateAvatar('userAvatar', user.profilePicture, initial);
        updateAvatar('dropdownAvatar', user.profilePicture, initial);
    }
    
    // Update profile info
    document.getElementById('profileName').textContent = fullName;
    
    // Load profile actions (friend request buttons)
    loadProfileActions(user.id);
    document.getElementById('modalUsername').textContent = fullName;
    document.getElementById('dropdownUsername').textContent = fullName;
    
    // Update intro section
    if (user.bio) {
        document.getElementById('bioSection').style.display = 'flex';
        document.getElementById('bioText').textContent = user.bio;
    }
    
    if (user.email) {
        document.getElementById('emailSection').style.display = 'flex';
        document.getElementById('emailText').textContent = user.email;
    }
    
    if (user.phoneNumber) {
        document.getElementById('phoneSection').style.display = 'flex';
        document.getElementById('phoneText').textContent = user.phoneNumber;
    }
}

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

async function loadUserPosts(userId) {
    try {
        const response = await fetch(`http://localhost:8080/api/posts/user/${userId}`);
        const posts = await response.json();
        
        const postsFeed = document.getElementById('postsFeed');
        postsFeed.innerHTML = '';
        
        if (posts.length === 0) {
            postsFeed.innerHTML = `
                <div class="post-card">
                    <div style="text-align: center; padding: 40px 20px; color: #b0b3b8;">
                        <p>Chưa có bài viết nào</p>
                    </div>
                </div>
            `;
            return;
        }
        
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
    
    const avatarHtml = post.user?.profilePicture 
        ? `<img src="${post.user.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
        : initial;
    
    const postImageHtml = post.imageUrl 
        ? `<div class="post-image"><img src="${post.imageUrl}" alt="Post image" style="width: 100%; border-radius: 0; display: block;"></div>` 
        : '';
    
    const userInitial = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U';
    
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
                <div class="comment-avatar">${currentUser.profilePicture ? `<img src="${currentUser.profilePicture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : userInitial}</div>
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

function formatDate(dateString) {
    if (!dateString) return 'Không rõ';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    
    return date.toLocaleDateString('vi-VN');
}

// Like and Comment functions
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
            if (likeBtn) {
                const icon = likeBtn.querySelector('i');
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                likeBtn.style.color = '#2e89ff';
            }
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

// Dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('userDropdown');
    const avatar = document.getElementById('userAvatar');
    
    if (!dropdown.contains(event.target) && !avatar.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// Create post modal
function openCreatePostModal() {
    document.getElementById('createPostModal').classList.add('active');
    document.getElementById('postContent').focus();
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
    document.getElementById('postContent').value = '';
    removePostImage();
}

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
            loadUserPosts(profileUserId || currentUser.userId);
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

// Profile picture upload
function openProfilePictureUpload() {
    document.getElementById('uploadProfileModal').classList.add('active');
    document.getElementById('userDropdown').classList.remove('active');
}

function closeUploadProfileModal() {
    document.getElementById('uploadProfileModal').classList.remove('active');
    document.getElementById('profilePictureInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadButton').style.display = 'none';
    selectedFile = null;
}

function handleFileSelect(event) {
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
        
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('uploadButton').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
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
            currentUser.profilePicture = data.profilePicture;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            loadUserProfile(currentUser.userId);
            
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

async function likePost(postId) {
    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.userId
            })
        });
        
        if (response.ok) {
            loadUserPosts(profileUserId || currentUser.userId);
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/html/login.html';
}

// Friend Request Functions
async function loadProfileActions(profileUserId) {
    const actionsContainer = document.getElementById('profileActions');
    
    // If viewing own profile
    if (profileUserId === currentUser.userId) {
        actionsContainer.innerHTML = `
            <button class="profile-btn primary">
                <i class="fa-solid fa-plus"></i>
                Thêm vào tin
            </button>
            <button class="profile-btn">
                <i class="fa-solid fa-pen"></i>
                Chỉnh sửa trang cá nhân
            </button>
        `;
        return;
    }
    
    // Check friendship status
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/status/${currentUser.userId}/${profileUserId}`);
        const data = await response.json();
        
        displayProfileActions(data.status, profileUserId);
    } catch (error) {
        console.error('Error loading friendship status:', error);
    }
}

function displayProfileActions(status, profileUserId) {
    const actionsContainer = document.getElementById('profileActions');
    
    if (status === 'FRIENDS') {
        actionsContainer.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <button class="profile-btn primary" id="friendsMenuBtn" onclick="toggleFriendsMenu(event, ${profileUserId})">
                    <i class="fa-solid fa-user-check"></i>
                    Bạn bè
                    <i class="fa-solid fa-caret-down" style="margin-left: 4px;"></i>
                </button>
                <div id="friendsMenu" class="friends-dropdown-menu" style="display: none;">
                    <div class="friends-menu-item" onclick="unfriend(${profileUserId})">
                        <i class="fa-solid fa-user-xmark"></i>
                        Hủy kết bạn
                    </div>
                </div>
            </div>
            <button class="profile-btn" onclick="sendMessage(${profileUserId})">
                <i class="fa-brands fa-facebook-messenger"></i>
                Nhắn tin
            </button>
        `;
    } else if (status === 'REQUEST_SENT') {
        actionsContainer.innerHTML = `
            <button class="profile-btn" onclick="cancelFriendRequest(${profileUserId})">
                <i class="fa-solid fa-user-clock"></i>
                Hủy lời mời
            </button>
            <button class="profile-btn" onclick="sendMessage(${profileUserId})">
                <i class="fa-brands fa-facebook-messenger"></i>
                Nhắn tin
            </button>
        `;
    } else if (status === 'REQUEST_RECEIVED') {
        actionsContainer.innerHTML = `
            <button class="profile-btn primary" onclick="respondToFriendRequest(${profileUserId}, true)">
                <i class="fa-solid fa-user-plus"></i>
                Chấp nhận lời mời
            </button>
            <button class="profile-btn" onclick="respondToFriendRequest(${profileUserId}, false)">
                <i class="fa-solid fa-user-xmark"></i>
                Từ chối
            </button>
        `;
    } else {
        actionsContainer.innerHTML = `
            <button class="profile-btn primary" onclick="sendFriendRequest(${profileUserId})">
                <i class="fa-solid fa-user-plus"></i>
                Thêm bạn bè
            </button>
            <button class="profile-btn" onclick="sendMessage(${profileUserId})">
                <i class="fa-brands fa-facebook-messenger"></i>
                Nhắn tin
            </button>
        `;
    }
}

async function sendFriendRequest(receiverId) {
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
            loadProfileActions(receiverId);
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Lỗi khi gửi lời mời kết bạn');
    }
}

async function cancelFriendRequest(receiverId) {
    try {
        // First get the request ID
        const response = await fetch(`http://localhost:8080/api/friend-requests/sent/${currentUser.userId}`);
        const requests = await response.json();
        
        const request = requests.find(r => r.receiverId === receiverId);
        if (!request) return;
        
        const cancelResponse = await fetch(`http://localhost:8080/api/friend-requests/${request.id}/cancel`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.userId })
        });
        
        if (cancelResponse.ok) {
            loadProfileActions(receiverId);
        }
    } catch (error) {
        console.error('Error canceling friend request:', error);
    }
}

async function respondToFriendRequest(senderId, accept) {
    try {
        // Get the request ID
        const response = await fetch(`http://localhost:8080/api/friend-requests/received/${currentUser.userId}`);
        const requests = await response.json();
        
        const request = requests.find(r => r.senderId === senderId);
        if (!request) return;
        
        const endpoint = accept ? 'accept' : 'reject';
        const respondResponse = await fetch(`http://localhost:8080/api/friend-requests/${request.id}/${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.userId })
        });
        
        if (respondResponse.ok) {
            loadProfileActions(senderId);
        }
    } catch (error) {
        console.error('Error responding to friend request:', error);
    }
}

function sendMessage(userId) {
    // Redirect to messages page
    window.location.href = `/html/messages.html?userId=${userId}`;
}

function toggleFriendsMenu(event, userId) {
    event.stopPropagation();
    const menu = document.getElementById('friendsMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

async function unfriend(friendId) {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/friend-requests/unfriend', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId1: currentUser.userId,
                userId2: friendId
            })
        });
        
        if (response.ok) {
            // Hide menu
            const menu = document.getElementById('friendsMenu');
            if (menu) menu.style.display = 'none';
            
            // Reload profile actions
            loadProfileActions(friendId);
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Error unfriending:', error);
        alert('Lỗi khi hủy kết bạn');
    }
}

// Close friends menu when clicking outside
document.addEventListener('click', (e) => {
    const friendsMenu = document.getElementById('friendsMenu');
    const friendsMenuBtn = document.getElementById('friendsMenuBtn');
    
    if (friendsMenu && friendsMenuBtn && 
        !friendsMenu.contains(e.target) && 
        !friendsMenuBtn.contains(e.target)) {
        friendsMenu.style.display = 'none';
    }
});

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
});
