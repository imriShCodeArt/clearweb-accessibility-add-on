<?php
declare(strict_types=1);

/**
 * Plugin Name: Clearweb Accessibility Add-on
 * Plugin URI: https://clearweb.co.il/wp-plugin
 * Description: Accessibility widget for WordPress with Hebrew (עברית) and RTL support — built for Israeli businesses.
 * Version: 1.0.3
 * Author: Clearweb
 * Author URI: https://clearweb.co.il
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: clearweb-accessibility-add-on
 * Domain Path: /languages
 * Requires at least: 6.4
 * Requires PHP: 8.1
 */

if (! defined('ABSPATH')) {
    exit;
}

define('CWAS_VERSION', '1.0.3');
define('CWAS_FILE', __FILE__);
define('CWAS_PATH', plugin_dir_path(__FILE__));
define('CWAS_URL', plugin_dir_url(__FILE__));
define('CWAS_BASENAME', plugin_basename(__FILE__));

require_once CWAS_PATH . 'includes/Autoloader.php';
\Clearweb\AccessibilitySuite\Autoloader::register();

register_activation_hook(__FILE__, [\Clearweb\AccessibilitySuite\Lifecycle\Activator::class, 'activate']);
register_deactivation_hook(__FILE__, [\Clearweb\AccessibilitySuite\Lifecycle\Deactivator::class, 'deactivate']);

add_action('plugins_loaded', static function (): void {
    \Clearweb\AccessibilitySuite\Plugin::instance()->boot();
});
