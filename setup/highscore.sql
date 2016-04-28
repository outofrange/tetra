CREATE TABLE `games_highscore` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(50) COLLATE 'utf8_bin' NOT NULL,
  `score` int NOT NULL
) AUTO_INCREMENT=1;