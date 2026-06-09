<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Lifecycle;

final class Activator
{
    public static function activate(): void
    {
        add_option('cwas_settings', [
            'accessibility_widget_enabled' => true,
            'widget_position'              => 'right',
            'widget_vertical_position'         => 50,
            'widget_vertical_position_mobile'  => 50,
            'widget_statement_url'         => '',
            'widget_help_url'              => '',
            'widget_remember_prefs'        => true,
            'widget_primary_color'         => '#0852e0',
            'widget_theme'                 => 'light',
            'widget_report_email'          => '',
            'widget_analytics'             => false,
            'widget_allowed_features'      => [],
        ]);
    }
}
