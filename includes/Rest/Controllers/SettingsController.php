<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Rest\Controllers;

use WP_REST_Request;

final class SettingsController extends BaseController
{
    public function registerRoutes(): void
    {
        register_rest_route($this->namespace, '/settings', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get'],
                'permission_callback' => [$this, 'canManage'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'update'],
                'permission_callback' => [$this, 'canManage'],
            ],
        ]);
    }

    public function get(): \WP_REST_Response
    {
        return $this->response([
            'settings' => get_option('cwas_settings', []),
        ]);
    }

    public function update(WP_REST_Request $request): \WP_REST_Response
    {
        $body = $this->json($request);

        if (isset($body['settings']) && is_array($body['settings'])) {
            $existing = get_option('cwas_settings', []);
            if (! is_array($existing)) {
                $existing = [];
            }
            $merged = array_merge($existing, $this->sanitizeCwasSettings($body['settings']));
            update_option('cwas_settings', $merged);
        }

        return $this->response(['ok' => true]);
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function sanitizeCwasSettings(array $settings): array
    {
        $out = [];

        foreach ($settings as $key => $value) {
            $key = sanitize_key((string) $key);

            switch ($key) {
                case 'accessibility_widget_enabled':
                case 'widget_remember_prefs':
                case 'widget_analytics':
                    $out[$key] = ! empty($value);
                    break;
                case 'widget_position':
                    $pos = sanitize_key((string) $value);
                    $out[$key] = in_array($pos, ['left', 'right'], true) ? $pos : 'right';
                    break;
                case 'widget_vertical_position':
                case 'widget_vertical_position_mobile':
                    $out[$key] = max(0, min(100, (int) $value));
                    break;
                case 'widget_primary_color':
                    $out[$key] = sanitize_hex_color((string) $value) ?: '#0852e0';
                    break;
                case 'widget_theme':
                    $out[$key] = sanitize_key((string) $value);
                    break;
                case 'widget_report_email':
                    $out[$key] = sanitize_email((string) $value);
                    break;
                case 'widget_statement_url':
                case 'widget_help_url':
                    $out[$key] = esc_url_raw((string) $value);
                    break;
                case 'widget_allowed_features':
                    $out[$key] = is_array($value) ? array_map('sanitize_key', $value) : [];
                    break;
                default:
                    $out[$key] = sanitize_text_field((string) $value);
            }
        }

        return $out;
    }
}
