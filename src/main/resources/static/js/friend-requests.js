// Friend Requests Module

let friendRequestLoadInterval = null;

// Toggle friend request dropdown
function toggleFriendRequestDropdown() {
    const dropdown = document.getElementById('friendRequestDropdown');
    const messengerDropdown = document.getElementById('messengerDropdown');
    
    // Close messenger dropdown if open
    if (messengerDropdown && messengerDropdown.classList.contains('active')) {
        messengerDropdown.classList.remove('active');
        if (window.messengerLoadInterval) {
            clearInterval(window.messengerLoadInterval);
            window.messengerLoadInterval = null;
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

// Load friend requests
async function loadFriendRequests() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/received/${currentUser.userId}`);
        const requests = await response.json();
        
        displayFriendRequests(requests);
        updateFriendRequestBadge(requests.length);
    } catch (error) {
        console.error('Error loading friend requests:', error);
    }
}

// Display friend requests
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

// Create friend request item
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

// Accept friend request
async function acceptFriendRequest(requestId) {
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/${requestId}/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.userId })
        });
        
        if (response.ok) {
            loadFriendRequests();
            loadContacts(); // Reload contacts to show new friend
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Lỗi khi chấp nhận lời mời kết bạn');
    }
}

// Reject friend request
async function rejectFriendRequest(requestId) {
    try {
        const response = await fetch(`http://localhost:8080/api/friend-requests/${requestId}/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.userId })
        });
        
        if (response.ok) {
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

// Update friend request badge
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
function loadFriendRequestCount() {
    if (!currentUser) return;
    
    fetch(`http://localhost:8080/api/friend-requests/count/${currentUser.userId}`)
        .then(response => response.json())
        .then(data => updateFriendRequestBadge(data.count))
        .catch(error => console.error('Error loading friend request count:', error));
}

// Find Friends Modal
let allUsers = [];

function openFindFriendsModal() {
    document.getElementById('findFriendsModal').classList.add('active');
    loadFriendSuggestions();
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
    
    const initial = getUserInitial(user);
    const fullName = getUserFullName(user);
    
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
    
    allUsers = allUsers.filter(u => u.id !== userId);
    
    if (allUsers.length === 0) {
        displayFriendSuggestions([]);
    }
}

function viewProfile(userId) {
    window.location.href = `/html/profile.html?userId=${userId}`;
}

// Search friends in modal
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFriends');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allUsers.filter(user => {
                const fullName = getUserFullName(user).toLowerCase();
                const username = user.username.toLowerCase();
                return fullName.includes(searchTerm) || username.includes(searchTerm);
            });
            displayFriendSuggestions(filtered);
        });
    }
});

// Close friend request dropdown when clicking outside
document.addEventListener('click', (e) => {
    const friendRequestBtn = document.getElementById('friendRequestBtn');
    const friendRequestDropdown = document.getElementById('friendRequestDropdown');
    
    if (friendRequestDropdown && friendRequestBtn &&
        !friendRequestBtn.contains(e.target) && 
        !friendRequestDropdown.contains(e.target)) {
        friendRequestDropdown.classList.remove('active');
        if (friendRequestLoadInterval) {
            clearInterval(friendRequestLoadInterval);
            friendRequestLoadInterval = null;
        }
    }
});
