SELECT DATE(`when`) AS `date`, TIME(MIN(`when`)) AS `start`, TIME(MAX(`when`)) AS `end`, 
       `user_email`, `action`, `object_type`, `object_subtype`, `databases`, 
       GROUP_CONCAT(DISTINCT `object_id` ORDER BY `object_id` SEPARATOR ", ") AS `objects`,  
       COUNT(*) AS `count`
  FROM (
    SELECT `when`, `action`, `object_type`, `object_subtype`, `object_id`, `user_email`, 
          GROUP_CONCAT(DISTINCT `database` ORDER BY `database` SEPARATOR ", ") AS `databases`
      FROM `activity`
    WHERE `database` IN ("tickets", "tickets_live", "tickets_1and1")
    GROUP BY `histid`, `when`
  ) AS `q`
 GROUP BY `date`, `user_email`, `action`, `object_type`, `object_subtype` 
 ORDER BY `date`, `user_email`, `start`;

