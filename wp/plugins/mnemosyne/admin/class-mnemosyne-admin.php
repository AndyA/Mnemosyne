<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://github.com/AndyA
 * @since      1.0.0
 *
 * @package    Mnemosyne
 * @subpackage Mnemosyne/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Mnemosyne
 * @subpackage Mnemosyne/admin
 * @author     Andy Armstrong <andy@hexten.net>
 */
class Mnemosyne_Admin
{
    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param      string    $plugin_name       The name of this plugin.
     * @param      string    $version    The version of this plugin.
     */
    public function __construct($plugin_name, $version)
    {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles()
    {
        wp_enqueue_style(
            $this->plugin_name,
            plugin_dir_url(__FILE__) . 'css/mnemosyne-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts()
    {
        wp_enqueue_script(
            $this->plugin_name,
            plugin_dir_url(__FILE__) . 'js/mnemosyne-admin.js',
            array('jquery'),
            $this->version,
            false
        );
    }

    public function field_text($args)
    {
        $defaults['class'] = 'text widefat';
        $defaults['description'] = '';
        $defaults['label'] = '';
        $defaults['name'] =
            $this->plugin_name . '-options[' . $args['id'] . ']';
        $defaults['placeholder'] = '';
        $defaults['type'] = 'text';
        $defaults['value'] = '';

        apply_filters(
            $this->plugin_name . '-field-text-options-defaults',
            $defaults
        );

        $atts = wp_parse_args($args, $defaults);

        if (!empty($this->options[$atts['id']])) {
            $atts['value'] = $this->options[$atts['id']];
        }

        include plugin_dir_path(__FILE__) .
                'partials/' .
                $this->plugin_name .
                '-admin-field-text.php';
    }

    public function register_fields()
    {
        add_settings_field(
            'callback-url',
            apply_filters(
                $this->plugin_name . 'label-callback-url',
                esc_html__('Callback URL', 'mnemosyne')
            ),
            array($this, 'field_text'),
            $this->plugin_name,
            $this->plugin_name, 
            array(
              'description' => 'Callback URL to deliver log data to',
              'id' => 'callback-url'
            )
        );
    }

    /**
     * Cron job to export latest data.
     *
     * @since    1.0.0
     */
    public function export_to_mnemosyne()
    {
        $resp = wp_remote_retrieve_body( wp_remote_get("https://mn.tthtesting.co.uk/mn.php") );
    }
}
