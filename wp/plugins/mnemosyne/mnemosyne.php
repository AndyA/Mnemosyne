<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/AndyA
 * @since             1.0.0
 * @package           Mnemosyne
 *
 * @wordpress-plugin
 * Plugin Name:       Mnemosyne Activity Exporter
 * Plugin URI:        https://github.com/AndyA/Mnemosyne
 * Description:       Periodically export Activity Log to Mnemosyne
 * Version:           1.0.0
 * Author:            Andy Armstrong
 * Author URI:        https://github.com/AndyA
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       mnemosyne
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die();
}

define( 'MNEMOSYNE__FILE__', __FILE__ );
define( 'MNEMOSYNE_BASE', plugin_basename( MNEMOSYNE__FILE__ ) );

include( 'classes/class-mnem-settings.php' );
include( 'classes/class-mnem-cron.php' );
include( 'classes/class-main.php' );

register_activation_hook( MNEMOSYNE__FILE__, array("MnemosyneMain", "activate" ));
register_deactivation_hook( MNEMOSYNE__FILE__, array("MnemosyneMain", "deactivate" ));

MnemosyneMain::instance();

