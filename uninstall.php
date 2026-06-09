<?php
/**
 * Uninstall cleanup.
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('cwas_settings');
delete_option('cwas_cookie_settings');
delete_option('cwas_ai_settings');
