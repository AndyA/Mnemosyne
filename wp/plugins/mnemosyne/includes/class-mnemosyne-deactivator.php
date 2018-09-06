<?php

/**
 * Fired during plugin deactivation
 *
 * @link       https://github.com/AndyA
 * @since      1.0.0
 *
 * @package    Mnemosyne
 * @subpackage Mnemosyne/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Mnemosyne
 * @subpackage Mnemosyne/includes
 * @author     Andy Armstrong <andy@hexten.net>
 */
class Mnemosyne_Deactivator
{
    public static function deactivate()
    {
        wp_clear_scheduled_hook('mnemosyne_cron');
    }
}
