<?php
if (!defined('WPINC')) {
    die();
}

class MnemosyneExport {

    private $hwm;

    public function __construct() {
    }

    public static function formatUUID($hash) {
        return strtolower(implode("-", array(
            substr($hash, 0, 8 ), 
            substr($hash, 8, 4),
            substr($hash, 12, 4),
            substr($hash, 16, 4),
            substr($hash, 20))));
    }

    public static function createHash($values) {
        array_unshift($values, "Mnemosyne");
        return md5(implode("\t", $values));
    }

    public static function createUUID($values) {
        return self::formatUUID(self::createHash($values));
    }

    public static function pickKeys($object, $keys) {
      $res = [];
      foreach ($keys as $in => $out) {
        if (array_key_exists($in, $object)) {
          $res[$out] = $object[$in];
        }
      }

      return $res;
    }

    public static function atPath($object, $path) {
        $keys = explode(".", $path);
        $obj = $object;
        foreach ($keys as $key) {
            if (is_null($obj)) {
                return null;
            }
            $obj = $obj[$key];
        }
        return $obj;
    }

    public static function buildIndex($object, $keySets) {
        $idx = array();
        foreach ($keySets as $set) {
            $vals = array();
            foreach ($set as $path) {
                $val = self::atPath($object, $path);
                if (!is_null($val)) {
                  $vals[] = $val;
                }
            }
            $uuid = self::createUUID($vals);
            $idx[$uuid] = implode(":", $set);
        }
        return $idx;
    }

    private function fixLog($log) {
        $url = home_url();

        return array_map(function ($ent) use ($url) {
            unset($ent['ID']);
            unset($ent['user_pass']);
            unset($ent['user_activation_key']);

            $ent['siteurl'] = $url;

            $ts = new DateTime("@" . $ent['hist_time']);
            $host = gethostname();

            $ev = array(
              "uuid" => self::createUUID(array(
                $host, 
                $ent['siteurl'], 
                $ent['histid'], 
                // Include time because aryo log can be truncated
                $ent['hist_time'] 
              )), 
              "sender" => "Wordpress", 
              "kind" => "Activity Log", 
              "host" => $host, 
              "timing" => array(
                "start" => $ts->format(DateTime::ATOM),
                "busy"  => array(
                  "before" => 10,
                  "after"  =>  5
                )
              ), 
              "identity" => self::pickKeys($ent, array(
                  "user_id"         => "id",
                  "user_caps"       => "caps",
                  "user_login"      => "login",
                  "user_nicename"   => "nicename",
                  "user_email"      => "email",
                  "user_url"        => "url",
                  "user_registered" => "registered",
                  "display_name"    => "display"
                )
              ), 
              "target" => self::pickKeys($ent, array(
                  "siteurl"         => "site_url"
                )
              ),
              "event" => self::pickKeys($ent, array(
                  "action"          => "action", 
                  "object_type"     => "object_type", 
                  "object_subtype"  => "object_subtype", 
                  "object_name"     => "object_name", 
                  "object_id"       => "object_id" 
                )
              ), 
              "raw" => $ent
            );

            $ev["index"] = self::buildIndex($ev, array(
                array("sender"), 
                array("kind"), 
                array("host"), 
                array("sender", "kind"), 
                array("sender", "host"), 
                array("identity.email"), 
                array("identity.login"), 
                array("identity.login", "target.site_url"), 
                array("identity.caps"), 
                array("target.site_url"), 
                array("event.action"), 
                array("event.object_type"), 
                array("event.object_subtype"), 
                array("event.object_name"), 
                array("event.object_type", "event.object_subtype"), 
                array("event.object_id", "target.site_url")
            ));

            return $ev;

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


