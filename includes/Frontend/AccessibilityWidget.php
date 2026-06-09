<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Frontend;

final class AccessibilityWidget
{
    public function register(): void
    {
        add_action('wp_footer', [$this, 'renderMountNode'], 5);
    }

    public function renderMountNode(): void
    {
        $settings = get_option('cwas_settings', []);

        if (empty($settings['accessibility_widget_enabled'])) {
            return;
        }

        echo '<div id="cwas-a11y-widget"></div>';
    }
}
