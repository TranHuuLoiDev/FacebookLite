-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 06, 2025 at 01:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `facebook_lite_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Welcome to Facebook Lite! 👋', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(2, 3, 1, 'Nice to have you here!', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(3, 1, 2, 'Congratulations on your project!', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(4, 3, 2, 'Can we see some screenshots?', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(5, 2, 2, 'That is awesome! Keep it up! 🎨', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(6, 4, 6, 'Hello', '2025-12-06 05:00:17', '2025-12-06 05:00:17');

-- --------------------------------------------------------

--
-- Table structure for table `friendships`
--

CREATE TABLE `friendships` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `friend_id` bigint(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `friendships`
--

INSERT INTO `friendships` (`id`, `user_id`, `friend_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'accepted', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(2, 1, 3, 'accepted', '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(3, 2, 3, 'pending', '2025-12-03 10:41:38', '2025-12-03 10:41:38');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES
(1, 1, 2, '2025-12-03 10:41:38'),
(2, 1, 3, '2025-12-03 10:41:38'),
(3, 2, 1, '2025-12-03 10:41:38'),
(4, 2, 3, '2025-12-03 10:41:38'),
(5, 2, 4, '2025-12-03 10:41:38'),
(6, 3, 1, '2025-12-03 10:41:38'),
(7, 3, 2, '2025-12-03 10:41:38'),
(8, 3, 4, '2025-12-03 10:41:38'),
(15, 4, 5, '2025-12-06 04:59:45');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `content` varchar(2000) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`, `image_url`) VALUES
(1, 1, 2, 'Hi Jane! How are you?', 1, '2025-12-03 10:41:38', NULL),
(2, 2, 1, 'Hi John! I am doing great, thanks!', 1, '2025-12-03 10:41:38', NULL),
(3, 1, 3, 'Hey Bob! Want to grab coffee sometime?', 0, '2025-12-03 10:41:38', NULL),
(4, 1, 2, 'Xin chào bạn', 1, '2025-12-06 17:26:15', NULL),
(5, 2, 1, 'Xin chàoo', 1, '2025-12-06 17:27:44', NULL),
(6, 1, 2, 'Hello', 1, '2025-12-06 17:28:34', NULL),
(7, 4, 1, 'console.log(`Hello Dev Loi`)', 1, '2025-12-06 17:34:38', NULL),
(8, 4, 1, 'Hi', 0, '2025-12-06 19:39:53', NULL),
(9, 4, 1, NULL, 0, '2025-12-06 19:44:19', '/uploads/messages/msg_1765025059263_0996fa52-f7ef-4cb6-9b43-ef1f34066b07.png'),
(10, 4, 1, NULL, 0, '2025-12-06 19:44:55', '/uploads/messages/msg_1765025095694_cc364abc-fe80-4361-8fd2-cbf03fa73fe9.png'),
(11, 4, 1, NULL, 0, '2025-12-06 19:46:02', '/uploads/messages/msg_1765025162583_6774fbf0-5ade-48f9-8d87-a3ac55ee4698.png'),
(12, 4, 1, NULL, 0, '2025-12-06 19:48:25', '/uploads/messages/msg_1765025305223_8dd7fffe-971b-4d2b-b3b0-8173113856a5.png'),
(13, 4, 1, NULL, 0, '2025-12-06 19:51:00', '/uploads/messages/msg_1765025460141_239238bf-dd2d-4ca2-8cae-3dd4efaf8318.jpg'),
(14, 4, 1, NULL, 0, '2025-12-06 19:53:43', '/uploads/messages/msg_1765025623312_6fdc2585-5d18-4b3b-af46-10062f941f7e.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `content` varchar(500) NOT NULL,
  `related_id` bigint(20) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `content`, `related_id`, `is_read`, `created_at`) VALUES
(1, 1, 'like', 'Jane Smith liked your post', 1, 1, '2025-12-03 10:41:38'),
(2, 1, 'comment', 'Bob Wilson commented on your post', 1, 1, '2025-12-03 10:41:38'),
(3, 2, 'friend_request', 'John Doe sent you a friend request', 1, 0, '2025-12-03 10:41:38'),
(4, 1, 'message', 'Jane Smith sent you a message', 1, 0, '2025-12-03 10:41:38');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `privacy` varchar(20) NOT NULL DEFAULT 'public',
  `like_count` int(11) DEFAULT 0,
  `comment_count` int(11) DEFAULT 0,
  `share_count` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `content`, `image_url`, `video_url`, `privacy`, `like_count`, `comment_count`, `share_count`, `created_at`, `updated_at`) VALUES
(1, 1, 'Xin chào các bạn! Tôi là Trần Hữu Lợi. Đây là môn xây dựng phần mềm hướng đối tượng', NULL, NULL, 'public', 5, 2, 0, '2025-12-03 10:41:38', '2025-12-04 13:04:23'),
(2, 2, 'Just finished working on a new design project. Feeling accomplished! 💪', NULL, NULL, 'public', 8, 3, 0, '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(3, 3, 'Beautiful sunset today! 🌅', NULL, NULL, 'friends', 12, 4, 0, '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(4, 1, 'Learning Spring Boot is amazing! #coding #java', NULL, NULL, 'public', 15, 5, 0, '2025-12-03 10:41:38', '2025-12-03 10:41:38'),
(5, 4, 'Xin chào mọi người!', NULL, NULL, 'public', 1, 0, 0, '2025-12-06 04:45:05', '2025-12-06 04:59:45'),
(6, 4, 'Developer', '/uploads/posts/post_1764971137494_4d5f09a6-9fe3-4444-9d06-4d01d6cbf923.jpg', NULL, 'public', 0, 1, 0, '2025-12-06 04:45:37', '2025-12-06 17:13:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `bio`, `profile_picture`, `cover_photo`, `date_of_birth`, `gender`, `phone_number`, `city`, `country`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'tranhuuloi', 'tranhuuloi20010@gmail.com', '$2a$10$ET3/IfZ/fRPaS9gNJT2mA.deJ4fzhv54z2THcGv89fQ7tY/ybNbna', 'Hữu', 'Lợi', 'Software Developer | Tech Enthusiast', NULL, NULL, NULL, 'male', NULL, NULL, 'Vietnam', 1, '2025-12-03 10:41:38', '2025-12-03 18:19:58'),
(2, 'jane_smith', 'jane@example.com', '$2a$10$ET3/IfZ/fRPaS9gNJT2mA.deJ4fzhv54z2THcGv89fQ7tY/ybNbna', 'Jane', 'Smith', 'Designer | Creative Mind', NULL, NULL, NULL, 'female', NULL, NULL, 'Vietnam', 1, '2025-12-03 10:41:38', '2025-12-03 18:16:45'),
(3, 'bob_wilson', 'bob@example.com', '$2a$10$ET3/IfZ/fRPaS9gNJT2mA.deJ4fzhv54z2THcGv89fQ7tY/ybNbna', 'Bob', 'Wilson', 'Photographer | Travel Lover', NULL, NULL, NULL, 'male', NULL, NULL, 'USA', 1, '2025-12-03 10:41:38', '2025-12-03 18:16:50'),
(4, 'LoiTestApp', 'LoiTestApp@gmail.com', '$2a$10$NotJU6/F.7oWKd4QEtHK9uEol.yzeZAkSYBjzGVfTForKMPk4fmHG', 'Lợi', 'Test', NULL, '/uploads/profile_4_3841be21-8294-4073-9a3a-f6f2c1c48838.jpg', NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-03 18:21:42', '2025-12-06 04:36:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comments_user` (`user_id`),
  ADD KEY `fk_comments_post` (`post_id`),
  ADD KEY `idx_post_created` (`post_id`,`created_at`);

--
-- Indexes for table `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_friend` (`user_id`,`friend_id`),
  ADD UNIQUE KEY `UKjwaac0iw9d1fu58mx7afwf9f4` (`user_id`,`friend_id`),
  ADD KEY `idx_user_status` (`user_id`,`status`),
  ADD KEY `idx_friend_status` (`friend_id`,`status`),
  ADD KEY `fk_friendships_user` (`user_id`),
  ADD KEY `fk_friendships_friend` (`friend_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_post` (`user_id`,`post_id`),
  ADD UNIQUE KEY `UK2jovqhqo324cubdomovkex03b` (`user_id`,`post_id`),
  ADD KEY `fk_likes_user` (`user_id`),
  ADD KEY `fk_likes_post` (`post_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_messages_sender` (`sender_id`),
  ADD KEY `fk_messages_receiver` (`receiver_id`),
  ADD KEY `idx_receiver_read` (`receiver_id`,`is_read`),
  ADD KEY `idx_sender_receiver` (`sender_id`,`receiver_id`,`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_posts_user` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_username` (`username`),
  ADD UNIQUE KEY `uk_email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `friendships`
--
ALTER TABLE `friendships`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `friendships`
--
ALTER TABLE `friendships`
  ADD CONSTRAINT `fk_friendships_friend` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_friendships_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
