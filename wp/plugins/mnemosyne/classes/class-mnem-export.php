<?php
if (!defined('WPINC')) {
    die();
}

class MnemosyneExport {

    private $hwm;

    public function __construct() {
    }

    private function fixLog($log) {
      $url = home_url();

      return array_map(function ($ent) use ($url) {
        unset($ent['ID']);
        unset($ent['user_pass']);
        $ent['siteurl'] = $url;
        return $ent;
      }, $log); 

    }

    public function getSince($hwm) {
        global $wpdb;

        $term = array("`aal`.`user_id` = `u`.`ID`");
        $bind = array();

        if (!is_null($hwm)) {
            $term[] = "`aal`.`histid` > %d";
            $bind[] = $hwm;
        }

        $sql = $wpdb->prepare(
          "SELECT * " .
          "  FROM `$wpdb->activity_log` AS `aal`, `$wpdb->users` AS `u`" .
          " WHERE " . implode(" AND ", $term) .
          " ORDER BY hist_time ASC",
          $bind
        );

        $res = $wpdb->get_results($sql, ARRAY_A);

        $this->hwm = max(array_column($res, "histid"));

        return $this->fixLog($res);
    }

    public function getLatest() {
        $hwm = get_option("mnemosyne_hwm");
        return $this->getSince($hwm);
    }

    public function commit() {
        add_option("mnemosyne_hwm", $this->hwm);
    }

}


