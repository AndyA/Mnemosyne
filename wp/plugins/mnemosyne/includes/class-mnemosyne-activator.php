<?php

/**
 * Fired during plugin activation
 *
 * @link       https://github.com/AndyA
 * @since      1.0.0
 *
 * @package    Mnemosyne
 * @subpackage Mnemosyne/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Mnemosyne
 * @subpackage Mnemosyne/includes
 * @author     Andy Armstrong <andy@hexten.net>
 */
class Mnemosyne_Activator
{
    public static function activate()
    {
        if (! wp_next_scheduled ( 'mnemosyne_cron' )) {
            wp_schedule_event(time(), 'hourly', 'mnemosyne_cron');
        }
    }
}
