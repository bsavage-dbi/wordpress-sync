<?php
/*
Plugin Name: Synced WordPress Widget
Plugin URI: https://www.elhardoum.com
Description: Synced WordPress Widget.
Author: Samuel Elh
Version: 0.1
Author URI: https://www.elhardoum.com
License: GPLv3
*/

if ( ! defined ( 'WPINC' ) ) {
    exit; // direct access
}

add_action('plugins_loaded', function()
{
    $sync = function()
    {
        if ( ! $data = json_decode(file_get_contents('php://input'), 1) )
            return;

        if ( ! $key = $data['key'] )
            return;

        file_exists( $f=__DIR__ . '/config.php' ) && require( $f );

        if ( ! isset( $ACCESS_KEY ) || $ACCESS_KEY !== $key )
            return;

        update_option('__synced_widget_data', $data['data']);
        return wp_send_json(null, 200);
    };

    add_action('wp_ajax_synced_wordpress_widget_sync', $sync);
    add_action('wp_ajax_nopriv_synced_wordpress_widget_sync', $sync);

    add_action('wp_enqueue_scripts', function()
    {
        return wp_register_style('synced-widget', trailingslashit( plugin_dir_url(__FILE__) ) . 'style.css');
    });

    add_shortcode('synced-wordpress-widget', function()
    {
        ob_start();
        include __DIR__ . '/widget.html';
        $html = ob_get_clean();
        
        if ( $data = (array) get_option('__synced_widget_data') ) {
            foreach ( $data as $pair ) {
                if ( 2 === count( $pair = array_values($pair) ) ) {
                    $html = str_replace( $pair[0], $pair[1], $html );
                }
            }
        }

        wp_enqueue_style('synced-widget');

        return $html;
    });
});