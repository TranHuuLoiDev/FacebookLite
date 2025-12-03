-- Facebook Lite Database Schema
-- Created: 2025-12-03
-- Database: facebook_lite_db

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Database: `facebook_lite_db`
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `facebook_lite_db` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `facebook_lite_db`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `cover_photo` varchar(255) DEFAULT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `posts`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `privacy` varchar(20) NOT NULL DEFAULT 'public',
  `like_count` int(11) DEFAULT 0,
  `comment_count` int(11) DEFAULT 0,
  `share_count` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_posts_user` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_created` (`user_id`, `created_at`),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `comments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comments_user` (`user_id`),
  KEY `fk_comments_post` (`post_id`),
  KEY `idx_post_created` (`post_id`, `created_at`),
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `likes`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_post` (`user_id`, `post_id`),
  KEY `fk_likes_user` (`user_id`),
  KEY `fk_likes_post` (`post_id`),
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `friendships`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `friendships`;
CREATE TABLE `friendships` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `friend_id` bigint(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_friend` (`user_id`, `friend_id`),
  KEY `idx_user_status` (`user_id`, `status`),
  KEY `idx_friend_status` (`friend_id`, `status`),
  KEY `fk_friendships_user` (`user_id`),
  KEY `fk_friendships_friend` (`friend_id`),
  CONSTRAINT `fk_friendships_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friendships_friend` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `messages`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_messages_sender` (`sender_id`),
  KEY `fk_messages_receiver` (`receiver_id`),
  KEY `idx_receiver_read` (`receiver_id`, `is_read`),
  KEY `idx_sender_receiver` (`sender_id`, `receiver_id`, `created_at`),
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notifications`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `content` varchar(500) NOT NULL,
  `related_id` bigint(20) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_user` (`user_id`),
  KEY `idx_user_read` (`user_id`, `is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Insert sample data
-- --------------------------------------------------------

-- Sample Users
INSERT INTO `users` (`username`, `email`, `password`, `first_name`, `last_name`, `bio`, `gender`, `country`) VALUES
('john_doe', 'john@example.com', '$2a$10$X5wFWKx4Ot0/P7i8ykRBIOKcgTl9GdQPTJkZ6oY3NlL0k2Rnj8h7m', 'John', 'Doe', 'Software Developer | Tech Enthusiast', 'male', 'Vietnam'),
('jane_smith', 'jane@example.com', '$2a$10$X5wFWKx4Ot0/P7i8ykRBIOKcgTl9GdQPTJkZ6oY3NlL0k2Rnj8h7m', 'Jane', 'Smith', 'Designer | Creative Mind', 'female', 'Vietnam'),
('bob_wilson', 'bob@example.com', '$2a$10$X5wFWKx4Ot0/P7i8ykRBIOKcgTl9GdQPTJkZ6oY3NlL0k2Rnj8h7m', 'Bob', 'Wilson', 'Photographer | Travel Lover', 'male', 'USA');

-- Sample Posts
INSERT INTO `posts` (`user_id`, `content`, `privacy`, `like_count`, `comment_count`) VALUES
(1, 'Hello everyone! This is my first post on Facebook Lite! 🎉', 'public', 5, 2),
(2, 'Just finished working on a new design project. Feeling accomplished! 💪', 'public', 8, 3),
(3, 'Beautiful sunset today! 🌅', 'friends', 12, 4),
(1, 'Learning Spring Boot is amazing! #coding #java', 'public', 15, 5);

-- Sample Comments
INSERT INTO `comments` (`user_id`, `post_id`, `content`) VALUES
(2, 1, 'Welcome to Facebook Lite! 👋'),
(3, 1, 'Nice to have you here!'),
(1, 2, 'Congratulations on your project!'),
(3, 2, 'Can we see some screenshots?'),
(2, 2, 'That is awesome! Keep it up! 🎨');

-- Sample Likes
INSERT INTO `likes` (`user_id`, `post_id`) VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 3),
(2, 4),
(3, 1),
(3, 2),
(3, 4);

-- Sample Friendships
INSERT INTO `friendships` (`user_id`, `friend_id`, `status`) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(2, 3, 'pending');

-- Sample Messages
INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`, `is_read`) VALUES
(1, 2, 'Hi Jane! How are you?', 1),
(2, 1, 'Hi John! I am doing great, thanks!', 1),
(1, 3, 'Hey Bob! Want to grab coffee sometime?', 0);

-- Sample Notifications
INSERT INTO `notifications` (`user_id`, `type`, `content`, `related_id`, `is_read`) VALUES
(1, 'like', 'Jane Smith liked your post', 1, 1),
(1, 'comment', 'Bob Wilson commented on your post', 1, 1),
(2, 'friend_request', 'John Doe sent you a friend request', 1, 0),
(1, 'message', 'Jane Smith sent you a message', 1, 0);

COMMIT;

-- --------------------------------------------------------
-- End of SQL script
-- --------------------------------------------------------
