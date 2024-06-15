-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 15 Cze 2024, 16:23
-- Wersja serwera: 10.4.27-MariaDB
-- Wersja PHP: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `pracadyplomowatest`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `exercise`
--

CREATE TABLE `exercise` (
  `id` int(11) NOT NULL,
  `exerciseName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `exercise`
--

INSERT INTO `exercise` (`id`, `exerciseName`) VALUES
(1, 'RSVP'),
(2, 'Grouping');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `exercise_result`
--

CREATE TABLE `exercise_result` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `exerciseId` int(11) NOT NULL,
  `score` float NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `exercise_result`
--

INSERT INTO `exercise_result` (`id`, `user_id`, `exerciseId`, `score`, `timestamp`) VALUES
(1, 1, 1, 4, '2024-05-29 19:04:41'),
(2, 1, 2, 0, '2024-06-13 14:33:30'),
(3, 1, 2, 5, '2024-06-13 14:43:32'),
(4, 1, 2, 10, '2024-06-13 15:14:07'),
(5, 1, 1, 0, '2024-06-13 15:15:01');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `quiz_result`
--

CREATE TABLE `quiz_result` (
  `id` int(11) NOT NULL,
  `timestamp` datetime NOT NULL,
  `score` float NOT NULL,
  `effectivity` float NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `quiz_result`
--

INSERT INTO `quiz_result` (`id`, `timestamp`, `score`, `effectivity`, `user_id`) VALUES
(1, '2024-05-29 19:03:50', 20, 317.936, 1),
(2, '2024-05-29 19:17:22', 0, 0, 1),
(3, '2024-05-30 18:11:03', 0, 0, 1),
(4, '2024-06-13 15:15:30', 0, 0, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `readed_texts`
--

CREATE TABLE `readed_texts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `text_quiz_id` int(11) NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `readed_texts`
--

INSERT INTO `readed_texts` (`id`, `user_id`, `text_quiz_id`, `timestamp`) VALUES
(1, 1, 1, '2024-05-29 19:02:57'),
(2, 1, 1, '2024-05-29 19:03:46'),
(3, 1, 1, '2024-05-29 19:04:14'),
(4, 1, 1, '2024-05-29 19:16:43'),
(5, 1, 1, '2024-05-30 18:10:02'),
(6, 1, 1, '2024-05-30 18:10:26'),
(7, 1, 1, '2024-05-30 19:19:36'),
(8, 1, 1, '2024-06-13 14:33:27'),
(9, 1, 1, '2024-06-13 14:43:24'),
(10, 1, 1, '2024-06-13 15:13:22'),
(11, 1, 1, '2024-06-13 15:14:02'),
(12, 1, 1, '2024-06-13 15:14:59'),
(13, 1, 1, '2024-06-13 15:15:27'),
(14, 1, 1, '2024-06-13 17:25:38'),
(15, 1, 1, '2024-06-14 14:51:57'),
(16, 1, 1, '2024-06-14 15:33:39'),
(17, 1, 1, '2024-06-15 16:12:55');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `text_quiz`
--

CREATE TABLE `text_quiz` (
  `id` int(11) NOT NULL,
  `text_file_path` varchar(100) NOT NULL,
  `quiz_file_path` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `text_quiz`
--

INSERT INTO `text_quiz` (`id`, `text_file_path`, `quiz_file_path`) VALUES
(1, 'Sources/Texts/Text1.txt', 'Sources/Quizes/Quiz1.json'),
(2, 'Sources/Texts/Text2.txt', 'Sources/Quizes/Quiz2.json');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password_hash` varchar(60) NOT NULL,
  `level` int(11) NOT NULL,
  `points` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password_hash`, `level`, `points`) VALUES
(1, 'jsc3', 'jsc3@gmail.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 1, 19),
(2, 'user1', 'user1@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 1, 10),
(3, 'user2', 'user2@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 1, 30),
(4, 'user3', 'user3@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 1, 56),
(5, 'user4', 'user4@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 1, 98),
(6, 'user5', 'user5@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 2, 102),
(7, 'user6', 'user6@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 2, 123),
(8, 'user7', 'user7@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 2, 153),
(9, 'user8', 'user8@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 2, 176),
(10, 'user9', 'user9@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 2, 187),
(11, 'user10', 'user10@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 3, 224),
(12, 'user11', 'user11@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 3, 225),
(13, 'user12', 'user12@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 3, 229),
(14, 'user13', 'user13@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 3, 295),
(15, 'user14', 'user14@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 4, 390),
(16, 'user15', 'user15@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 4, 320),
(17, 'user16', 'user16@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 4, 305),
(18, 'user17', 'user17@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 5, 450),
(19, 'user18', 'user18@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 7, 660),
(20, 'user19', 'user19@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 8, 734),
(21, 'user20', 'user20@example.com', '$2b$12$s0cdmtGdcTror8J.7RYCj..kFF15RuhO8dtETVZBDL4H0RPd4RSx6', 10, 999);

--
-- Wyzwalacze `user`
--
DELIMITER $$
CREATE TRIGGER `update_user_level` BEFORE UPDATE ON `user` FOR EACH ROW BEGIN
  SET NEW.level = CEILING(NEW.points / 100);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `wpm_result`
--

CREATE TABLE `wpm_result` (
  `id` int(11) NOT NULL,
  `wpm` float NOT NULL,
  `timestamp` datetime NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_polish_ci;

--
-- Zrzut danych tabeli `wpm_result`
--

INSERT INTO `wpm_result` (`id`, `wpm`, `timestamp`, `user_id`) VALUES
(1, 1639.09, '2024-05-29 19:02:57', 1),
(2, 1589.68, '2024-05-29 19:03:46', 1),
(3, 150, '2024-05-20 14:00:00', 1),
(4, 200, '2024-05-21 14:00:00', 1),
(5, 250, '2024-05-22 14:00:00', 1),
(6, 300, '2024-05-23 14:00:00', 1),
(7, 350, '2024-05-24 14:00:00', 1),
(8, 400, '2024-05-25 14:00:00', 1),
(9, 450, '2024-05-26 14:00:00', 1),
(10, 500, '2024-05-27 14:00:00', 1),
(11, 550, '2024-05-28 14:00:00', 1),
(12, 600, '2024-05-20 15:00:00', 1),
(13, 650, '2024-05-21 15:00:00', 1),
(14, 700, '2024-05-22 15:00:00', 1),
(15, 750, '2024-05-23 15:00:00', 1),
(16, 800, '2024-05-24 15:00:00', 1),
(17, 850, '2024-05-25 15:00:00', 1),
(18, 900, '2024-05-26 15:00:00', 1),
(19, 950, '2024-05-27 15:00:00', 1),
(20, 1000, '2024-05-28 15:00:00', 1),
(21, 150, '2024-05-20 16:00:00', 1),
(22, 200, '2024-05-21 16:00:00', 1),
(23, 250, '2024-05-22 16:00:00', 1),
(24, 300, '2024-05-23 16:00:00', 1),
(25, 350, '2024-05-24 16:00:00', 1),
(26, 400, '2024-05-25 16:00:00', 1),
(27, 450, '2024-05-26 16:00:00', 1),
(28, 500, '2024-05-27 16:00:00', 1),
(29, 550, '2024-05-28 16:00:00', 1),
(30, 600, '2024-05-20 17:00:00', 1),
(31, 650, '2024-05-21 17:00:00', 1),
(32, 700, '2024-05-22 17:00:00', 1),
(33, 750, '2024-05-23 17:00:00', 1),
(34, 800, '2024-05-24 17:00:00', 1),
(35, 850, '2024-05-25 17:00:00', 1),
(36, 900, '2024-05-26 17:00:00', 1),
(37, 950, '2024-05-27 17:00:00', 1),
(38, 1000, '2024-05-28 17:00:00', 1),
(39, 150, '2024-03-20 14:00:00', 1),
(40, 200, '2024-03-21 14:00:00', 1),
(41, 250, '2024-03-22 14:00:00', 1),
(42, 300, '2024-03-23 14:00:00', 1),
(43, 350, '2024-03-24 14:00:00', 1),
(44, 400, '2024-03-25 14:00:00', 1),
(45, 450, '2024-03-26 14:00:00', 1),
(46, 500, '2024-03-27 14:00:00', 1),
(47, 550, '2024-03-28 14:00:00', 1),
(48, 600, '2024-03-29 14:00:00', 1),
(49, 650, '2024-03-30 14:00:00', 1),
(50, 700, '2024-03-31 14:00:00', 1),
(51, 750, '2024-04-01 14:00:00', 1),
(52, 800, '2024-04-02 14:00:00', 1),
(53, 850, '2024-04-03 14:00:00', 1),
(54, 900, '2024-04-04 14:00:00', 1),
(55, 950, '2024-04-05 14:00:00', 1),
(56, 1000, '2024-04-06 14:00:00', 1),
(57, 150, '2024-04-07 14:00:00', 1),
(58, 200, '2024-04-08 14:00:00', 1),
(59, 250, '2024-04-09 14:00:00', 1),
(60, 300, '2024-04-10 14:00:00', 1),
(61, 350, '2024-04-11 14:00:00', 1),
(62, 400, '2024-04-12 14:00:00', 1),
(63, 450, '2024-04-13 14:00:00', 1),
(64, 500, '2024-04-14 14:00:00', 1),
(65, 550, '2024-04-15 14:00:00', 1),
(66, 600, '2024-04-16 14:00:00', 1),
(67, 650, '2024-04-17 14:00:00', 1),
(68, 700, '2024-04-18 14:00:00', 1),
(69, 750, '2024-04-19 14:00:00', 1),
(70, 800, '2024-04-20 14:00:00', 1),
(71, 850, '2024-04-21 14:00:00', 1),
(72, 900, '2024-04-22 14:00:00', 1),
(73, 950, '2024-04-23 14:00:00', 1),
(74, 1000, '2024-04-24 14:00:00', 1),
(75, 150, '2024-05-20 14:00:00', 1),
(76, 200, '2024-05-21 14:00:00', 1),
(77, 250, '2024-05-22 14:00:00', 1),
(78, 300, '2024-05-23 14:00:00', 1),
(79, 350, '2024-05-24 14:00:00', 1),
(80, 400, '2024-05-25 14:00:00', 1),
(81, 450, '2024-05-26 14:00:00', 1),
(82, 500, '2024-05-27 14:00:00', 1),
(83, 550, '2024-05-28 14:00:00', 1),
(84, 600, '2024-05-20 15:00:00', 1),
(85, 650, '2024-05-21 15:00:00', 1),
(86, 700, '2024-05-22 15:00:00', 1),
(87, 750, '2024-05-23 15:00:00', 1),
(88, 800, '2024-05-24 15:00:00', 1),
(89, 1692.64, '2024-05-29 19:16:43', 1),
(90, 679.473, '2024-05-30 18:10:02', 1),
(91, 1747.25, '2024-05-30 18:10:26', 1),
(92, 1747.16, '2024-05-30 19:19:36', 1),
(93, 596.474, '2024-06-13 15:13:22', 1),
(94, 1521.59, '2024-06-13 15:15:27', 1),
(95, 1242.77, '2024-06-13 17:25:38', 1),
(96, 671.053, '2024-06-14 14:51:57', 1),
(97, 1825.78, '2024-06-14 15:33:39', 1),
(98, 1732.76, '2024-06-15 16:12:55', 1);

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `exercise`
--
ALTER TABLE `exercise`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `exercise_result`
--
ALTER TABLE `exercise_result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `exerciseId` (`exerciseId`);

--
-- Indeksy dla tabeli `quiz_result`
--
ALTER TABLE `quiz_result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeksy dla tabeli `readed_texts`
--
ALTER TABLE `readed_texts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `text_quiz_id` (`text_quiz_id`);

--
-- Indeksy dla tabeli `text_quiz`
--
ALTER TABLE `text_quiz`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `text_file_path` (`text_file_path`),
  ADD UNIQUE KEY `quiz_file_path` (`quiz_file_path`);

--
-- Indeksy dla tabeli `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeksy dla tabeli `wpm_result`
--
ALTER TABLE `wpm_result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `exercise`
--
ALTER TABLE `exercise`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT dla tabeli `exercise_result`
--
ALTER TABLE `exercise_result`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT dla tabeli `quiz_result`
--
ALTER TABLE `quiz_result`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT dla tabeli `readed_texts`
--
ALTER TABLE `readed_texts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT dla tabeli `text_quiz`
--
ALTER TABLE `text_quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT dla tabeli `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT dla tabeli `wpm_result`
--
ALTER TABLE `wpm_result`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `exercise_result`
--
ALTER TABLE `exercise_result`
  ADD CONSTRAINT `exercise_result_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `exercise_result_ibfk_2` FOREIGN KEY (`exerciseId`) REFERENCES `exercise` (`id`);

--
-- Ograniczenia dla tabeli `quiz_result`
--
ALTER TABLE `quiz_result`
  ADD CONSTRAINT `quiz_result_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Ograniczenia dla tabeli `readed_texts`
--
ALTER TABLE `readed_texts`
  ADD CONSTRAINT `readed_texts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `readed_texts_ibfk_2` FOREIGN KEY (`text_quiz_id`) REFERENCES `text_quiz` (`id`);

--
-- Ograniczenia dla tabeli `wpm_result`
--
ALTER TABLE `wpm_result`
  ADD CONSTRAINT `wpm_result_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
