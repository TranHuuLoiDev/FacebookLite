-- Fix notifications table: Remove invalid notifications
-- Run this in MySQL to clean up bad data

USE facebook_lite_db;

-- Delete notifications with invalid actor_id
DELETE FROM notifications WHERE actor_id = 0 OR actor_id IS NULL;

-- Delete notifications where actor user doesn't exist
DELETE FROM notifications 
WHERE actor_id NOT IN (SELECT id FROM users);

-- Show remaining notifications
SELECT n.*, u.first_name, u.last_name 
FROM notifications n
LEFT JOIN users u ON n.actor_id = u.id
ORDER BY n.created_at DESC;
