<?php
if (!defined('WPINC')) {
    die();
}

class MnemosyneCron {

    private $interval;

    public function __construct($interval) {
      $this->interval = $interval;
      add_filter('cron_schedules', array($this, 'addOurSchedules'));
    }

    public function addOurSchedules( $schedules ) {
        $schedules['mnemosyne_often'] = array(
            'interval' => $this->interval, 
            'display'  => __( 'Run every ' . $this->interval . ' seconds' ),
        );
        return $schedules;
    }

    public function installCronJob($handler) {
        add_action('mnemosyne_cron_hook', $handler);
        if ( ! wp_next_scheduled( 'mnemosyne_cron_hook' ) ) {
            wp_schedule_event( time(), 'mnemosyne_often', 'mnemosyne_cron_hook' );
        }
    }

    public function uninstallCronJob() {
        $timestamp = wp_next_scheduled( 'mnemosyne_cron_hook' );
        wp_unschedule_event( $timestamp, 'mnemosyne_cron_hook' );
    }
}

