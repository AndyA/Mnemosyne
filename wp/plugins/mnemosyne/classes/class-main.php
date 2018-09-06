<?php
if (!defined('WPINC')) {
    die();
}

final class MnemosyneMain
{
    /**
     * @var MnemosyneMain singleton
     * @since 1.0.0
     */
    private static $_instance = null;

    /**
     * Load text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain('mnemosyne');
    }

    /**
     * Construct
     */
    protected function __construct() {

        $this->settings = new MnemosyneSettings();
        $this->cron = new MnemosyneCron(60);

        add_action('plugins_loaded', array(&$this, 'load_textdomain'));

        $this->cron->installCronJob(array($this, "cron"));
    }

    public function cron() {
        $resp = wp_remote_retrieve_body(wp_remote_get("https://mn.tthtesting.co.uk/mn.php"));
    }

    /**
     * Throw error on object clone
     *
     * The whole idea of the singleton design pattern is that there is a single
     * object therefore, we don't want the object to be cloned.
     *
     * @since 2.0.7
     * @return void
     */
    public function __clone() {
        // Cloning instances of the class is forbidden
        _doing_it_wrong(
            __FUNCTION__,
            __('Singleton may not be cloned', 'mnemosyne'),
            '2.0.7'
        );
    }

    /**
     * Disable unserializing of the class
     *
     * @since 2.0.7
     * @return void
     */
    public function __wakeup() {
        // Unserializing instances of the class is forbidden
        _doing_it_wrong(
            __FUNCTION__,
            __('Singleton may not be serialized', 'mnemosyne'),
            '2.0.7'
        );
    }

    /**
     * @return MnemosyneMain
     */
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new MnemosyneMain();
        }
        return self::$_instance;
    }

    /**
     * Static activation hook
     */
    public static function activate() {
    }

    /**
     * Static deactivation hook
     */
    public static function deactivate() {
      $pl = MnemosyneMain::instance();
      $pl->cron->uninstallCronJob(array($pl, "cron"));
    }
}

