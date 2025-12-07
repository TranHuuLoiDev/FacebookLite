// Global Search Module

let searchTimeout;
let allUsersList = [];

// Load all users for search
async function loadAllUsers() {
    try {
        const response = await fetch('http://localhost:8080/api/users');
        allUsersList = await response.json();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Perform search
async function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    const resultsContent = searchResults.querySelector('.search-results-content');
    
    try {
        const lowerQuery = query.toLowerCase();
        
        // Search in users
        const userResults = allUsersList.filter(user => {
            if (user.id === currentUser.userId) return false;
            
            const fullName = getUserFullName(user).toLowerCase();
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
            const initial = getUserInitial(user);
            const fullName = getUserFullName(user);
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

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchResults) {
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

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.search-box');
    const searchResults = document.getElementById('searchResults');
    
    if (searchBox && searchResults && !searchBox.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});
