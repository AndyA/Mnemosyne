
DROP TABLE IF EXISTS `capture`;

CREATE TABLE `capture` (
  `key` varchar(100) NOT NULL,
  `latest` varchar(40) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
