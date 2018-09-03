SELECT *, TIMEDIFF(`end`, `start`) AS `duration` FROM (
  SELECT DATE(`when`) AS `date`, TIME(MIN(`when`)) AS `start`, TIME(MAX(`when`)) AS `end`, 
        COUNT(*) AS `count`  
    FROM `activity` 
  WHERE `database` = "tattva" 
  GROUP BY `date`
  ORDER BY `date`, `start`) AS `q`;

