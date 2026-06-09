<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Admin;

final class Menu
{
    public function register(): void
    {
        add_action('admin_menu', [$this, 'addMenuPage']);
    }

    public function addMenuPage(): void
    {
        add_menu_page(
            __('Clearweb A11y', 'clearweb-accessibility-add-on'),
            __('Clearweb A11y', 'clearweb-accessibility-add-on'),
            'manage_options',
            'clearweb-accessibility-add-on',
            [$this, 'render'],
            'dashicons-universal-access-alt',
            58
        );
    }

    public function render(): void
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'clearweb-accessibility-add-on'));
        }

        echo '<div class="wrap"><div id="cwas-admin-app"></div></div>';
    }
}
