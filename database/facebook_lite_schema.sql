-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 07, 2025 at 10:27 AM
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
(2, 'DevLoi', 'jane@example.com', '$2a$10$ET3/IfZ/fRPaS9gNJT2mA.deJ4fzhv54z2THcGv89fQ7tY/ybNbna', 'Trần', 'Lợi', 'Designer | Creative Mind', NULL, NULL, NULL, 'female', NULL, NULL, 'Vietnam', 1, '2025-12-03 10:41:38', '2025-12-07 15:49:03'),
(3, 'LoiDev', 'bob@example.com', '$2a$10$ET3/IfZ/fRPaS9gNJT2mA.deJ4fzhv54z2THcGv89fQ7tY/ybNbna', 'Dev', 'Lợi', 'Photographer | Travel Lover', NULL, NULL, NULL, 'male', NULL, NULL, 'USA', 1, '2025-12-03 10:41:38', '2025-12-07 15:49:11'),
(4, 'LoiTestApp', 'LoiTestApp@gmail.com', '$2a$10$NotJU6/F.7oWKd4QEtHK9uEol.yzeZAkSYBjzGVfTForKMPk4fmHG', 'Lợi', 'Test', 'Developer', '/uploads/profile_4_3841be21-8294-4073-9a3a-f6f2c1c48838.jpg', NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-03 18:21:42', '2025-12-07 12:17:19');

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
