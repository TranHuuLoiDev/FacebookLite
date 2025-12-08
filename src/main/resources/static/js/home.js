// Home Page - Main Initialization
// This file coordinates all modules and initializes the page

// Check authentication and initialize
currentUser = checkAuth();

if (currentUser) {
    // Initialize user interface
    initUserInfo();
    
    // Load initial data
    loadPosts();
    loadContacts();
    loadAllUsers();
    updateNotificationBadge();
    
    // Update notification badge every 30 seconds
    setInterval(updateNotificationBadge, 30000);
}
