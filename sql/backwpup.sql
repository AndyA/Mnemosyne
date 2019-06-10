
DROP TABLE IF EXISTS `backwpup`;

CREATE TABLE `backwpup` (
  `database` varchar(100) NOT NULL,
  `latest` varchar(40) NOT NULL,
  PRIMARY KEY (`database`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
