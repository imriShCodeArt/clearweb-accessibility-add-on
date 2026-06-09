<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite;

final class Assets
{
    public function register(): void
    {
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdmin']);
        /* Late priority so widget CSS wins over theme reset.css / button:hover rules. */
        add_action('wp_enqueue_scripts', [$this, 'enqueueFrontend'], 999);
    }

    public function enqueueAdmin(string $hook): void
    {
        if ($hook !== 'toplevel_page_clearweb-accessibility-add-on') {
            return;
        }

        $asset = $this->asset('admin/index');

        wp_enqueue_script(
            'cwas-admin',
            CWAS_URL . 'build/admin/index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_localize_script('cwas-admin', 'CWAS_ADMIN', [
            'restUrl' => esc_url_raw(rest_url('cwas/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'locale' => determine_locale(),
            'isRtl' => is_rtl(),
            'remediationsUrl' => 'https://clearweb.co.il',
            'i18n' => I18n::admin(),
        ]);

        wp_set_script_translations('cwas-admin', 'clearweb-accessibility-add-on', CWAS_PATH . 'languages');

        wp_enqueue_style('cwas-admin', CWAS_URL . 'assets/css/admin.css', [], $this->fileVersion('assets/css/admin.css'));
    }

    public function enqueueFrontend(): void
    {
        $settings = get_option('cwas_settings', []);

        if (! empty($settings['accessibility_widget_enabled'])) {
            $asset = $this->asset('public/accessibility-widget');
            wp_enqueue_script(
                'cwas-accessibility-widget',
                CWAS_URL . 'build/public/accessibility-widget.js',
                $asset['dependencies'],
                $asset['version'],
                true
            );
            $allowedFeatures = array_map('sanitize_key', (array) ($settings['widget_allowed_features'] ?? []));
            $widgetPosition = sanitize_key($settings['widget_position'] ?? 'right');
            if (! in_array($widgetPosition, ['left', 'right'], true)) {
                $widgetPosition = 'right';
            }
            $verticalPosition = isset($settings['widget_vertical_position'])
                ? (int) $settings['widget_vertical_position']
                : 50;
            $verticalPosition = max(0, min(100, $verticalPosition));
            $verticalPositionMobile = isset($settings['widget_vertical_position_mobile'])
                ? (int) $settings['widget_vertical_position_mobile']
                : $verticalPosition;
            $verticalPositionMobile = max(0, min(100, $verticalPositionMobile));
            wp_localize_script('cwas-accessibility-widget', 'CWAS_WIDGET', [
                'i18n'     => I18n::widget(),
                'settings' => [
                    'position'               => $widgetPosition,
                    'verticalPosition'       => $verticalPosition,
                    'verticalPositionMobile' => $verticalPositionMobile,
                    'statementUrl'     => esc_url($settings['widget_statement_url'] ?? ''),
                    'helpUrl'          => esc_url($settings['widget_help_url'] ?? ''),
                    /* Default on when unset (matches Activator); !empty() alone treated missing key as off. */
                    'rememberPrefs'    => ! isset($settings['widget_remember_prefs'])
                        || ! empty($settings['widget_remember_prefs']),
                    'primaryColor'     => sanitize_hex_color($settings['widget_primary_color'] ?? '#0852e0') ?? '#0852e0',
                    'theme'            => sanitize_key($settings['widget_theme'] ?? 'light'),
                    'restUrl'          => esc_url_raw(rest_url('cwas/v1')),
                    'nonce'            => wp_create_nonce('wp_rest'),
                    'reportEmail'      => sanitize_email($settings['widget_report_email'] ?? ''),
                    'analytics'        => ! empty($settings['widget_analytics']),
                    'allowedFeatures'  => $allowedFeatures,
                    'brandUrl'         => 'https://clearweb.co.il',
                    'brandLogoUrl'     => CWAS_URL . 'assets/images/clearweb-logo.svg',
                    'triggerMarkUrl'   => CWAS_URL . 'assets/images/icon.svg',
                ],
            ]);
            wp_enqueue_style('cwas-widget', CWAS_URL . 'assets/css/frontend.css', [], $this->fileVersion('assets/css/frontend.css'));
        }
    }

    /**
     * @return array{dependencies: string[], version: string}
     */
    private function asset(string $entry): array
    {
        $assetFile = CWAS_PATH . 'build/' . $entry . '.asset.php';

        if (is_readable($assetFile)) {
            $asset = include $assetFile;
            return [
                'dependencies' => $asset['dependencies'] ?? [],
                'version' => $asset['version'] ?? CWAS_VERSION,
            ];
        }

        return [
            'dependencies' => [],
            'version' => CWAS_VERSION,
        ];
    }

    private function fileVersion(string $relativePath): string
    {
        $path = CWAS_PATH . ltrim($relativePath, '/');

        return is_readable($path) ? (string) filemtime($path) : CWAS_VERSION;
    }
}
