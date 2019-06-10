
DROP TABLE IF EXISTS `backwpup`;

CREATE TABLE `backwpup` (
  `key` varchar(100) NOT NULL,
  `latest` varchar(40) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
