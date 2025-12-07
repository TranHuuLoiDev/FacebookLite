// Authentication Module

let currentUser = null;

// Check authentication on page load
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/html/login.html';
        return null;
    }
    
    currentUser = JSON.parse(userStr);
    return currentUser;
}

// Initialize user info in UI
function initUserInfo() {
    if (!currentUser) return;
    
    const initial = getUserInitial(currentUser);
    const fullName = getUserFullName(currentUser);
    
    // Update all avatar locations
    updateAvatar('userAvatar', currentUser.profilePicture, initial);
    updateAvatar('dropdownAvatar', currentUser.profilePicture, initial);
    updateAvatar('createPostAvatar', currentUser.profilePicture, initial);
    updateAvatar('modalAvatar', currentUser.profilePicture, initial);
    updateAvatar('sidebarAvatar', currentUser.profilePicture, initial);
    
    // Update username displays
    const dropdownUsername = document.getElementById('dropdownUsername');
    const sidebarUsername = document.getElementById('sidebarUsername');
    const modalUsername = document.getElementById('modalUsername');
    
    if (dropdownUsername) dropdownUsername.textContent = fullName;
    if (sidebarUsername) sidebarUsername.textContent = fullName;
    if (modalUsername) modalUsername.textContent = fullName;
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/html/login.html';
}

// Go to profile page
function goToProfile() {
    window.location.href = '/html/profile.html';
}

// Toggle user dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const messengerDropdown = document.getElementById('messengerDropdown');
    const isActive = dropdown.classList.contains('active');
    
    // Close messenger dropdown if open
    if (messengerDropdown) {
        messengerDropdown.classList.remove('active');
        if (window.messengerLoadInterval) {
            clearInterval(window.messengerLoadInterval);
            window.messengerLoadInterval = null;
        }
    }
    
    if (!isActive) {
        dropdown.classList.add('active');
    } else {
        dropdown.classList.remove('active');
    }
}

// Profile Picture Upload
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
    
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File không được vượt quá 5MB');
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
            
            initUserInfo();
            
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

// Close user dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    const avatar = document.getElementById('userAvatar');
    
    if (userDropdown && avatar && !userDropdown.contains(event.target) && !avatar.contains(event.target)) {
        userDropdown.classList.remove('active');
    }
});
