// Posts Module - Handle posts, likes, and comments

let selectedPostImage = null;

// Open create post modal
function openCreatePostModal() {
    document.getElementById('createPostModal').classList.add('active');
    document.getElementById('postContent').focus();
}

// Close create post modal
function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
    document.getElementById('postContent').value = '';
    removePostImage();
}

// Handle post image selection
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

// Remove post image
function removePostImage() {
    selectedPostImage = null;
    document.getElementById('postImageInput').value = '';
    document.getElementById('postImagePreviewContainer').style.display = 'none';
}

// Submit post
async function submitPost() {
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
}

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

// Create post card
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const initial = getUserInitial(post.user);
    const authorName = post.user ? getUserFullName(post.user) : 'Unknown';
    const timeAgo = formatDate(post.createdAt);
    
    const avatarHtml = createAvatarHtml(post.user);
    
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
        <div class="post-content">${escapeHtml(post.content)}</div>
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
                <div class="comment-avatar">${createAvatarHtml(currentUser)}</div>
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

// Toggle like
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
            
            // Update like count
            const response2 = await fetch(`http://localhost:8080/api/posts/${postId}`);
            const post = await response2.json();
            likeCountSpan.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> ${post.likeCount || 0}`;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

// Check if user liked post
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

// Toggle comment section
async function toggleCommentSection(postId) {
    const commentSection = document.getElementById(`comment-section-${postId}`);
    
    if (commentSection.style.display === 'none') {
        commentSection.style.display = 'block';
        await loadComments(postId);
    } else {
        commentSection.style.display = 'none';
    }
}

// Load comments
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
        const commentsList = document.getElementById(`comments-list-${postId}`);
        
        if (!commentsList) {
            console.error('Comments list element not found for post', postId);
            return;
        }
        
        commentsList.innerHTML = '';
        
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

// Create comment element
function createCommentElement(comment, postId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const fullName = getUserFullName(comment.user);
    const timeAgo = formatDate(comment.createdAt);
    const avatarHtml = createAvatarHtml(comment.user);
    
    div.innerHTML = `
        <div class="comment-avatar">${avatarHtml}</div>
        <div class="comment-content-wrapper">
            <div class="comment-bubble">
                <div class="comment-author">${fullName}</div>
                <div class="comment-text">${escapeHtml(comment.content)}</div>
            </div>
            <div class="comment-actions">
                <span class="comment-time">${timeAgo}</span>
                ${comment.user.id === currentUser.userId ? `<span class="comment-delete" onclick="deleteComment(${comment.id}, ${postId})">Xóa</span>` : ''}
            </div>
        </div>
    `;
    
    return div;
}

// Post comment
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
            
            // Update comment count
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

// Delete comment
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
            
            // Update comment count
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

// Initialize post modal events
document.addEventListener('DOMContentLoaded', () => {
    const openCreatePostBtn = document.getElementById('openCreatePost');
    if (openCreatePostBtn) {
        openCreatePostBtn.addEventListener('click', openCreatePostModal);
    }
    
    const createPostModal = document.getElementById('createPostModal');
    if (createPostModal) {
        createPostModal.addEventListener('click', (e) => {
            if (e.target.id === 'createPostModal') {
                closeCreatePostModal();
            }
        });
    }
    
    const submitPostBtn = document.getElementById('submitPost');
    if (submitPostBtn) {
        submitPostBtn.addEventListener('click', submitPost);
    }
});
