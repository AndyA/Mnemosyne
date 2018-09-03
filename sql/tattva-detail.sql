SELECT DATE(`when`) AS `date`, TIME(MIN(`when`)) AS `start`, TIME(MAX(`when`)) AS `end`, 
       `action`, `object_type`, `object_subtype`, 
       GROUP_CONCAT(DISTINCT `object_id` ORDER BY `object_id` SEPARATOR ", ") AS `objects`,  
       COUNT(*) AS `count`  
  FROM `activity` 
 WHERE `database` = "tattva" 
 GROUP BY `date`, `action`, `object_type`, `object_subtype` 
 ORDER BY `date`, `start`;

