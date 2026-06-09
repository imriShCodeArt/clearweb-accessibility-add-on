<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Report;

use WP_REST_Request;

final class ReportSpamGuard
{
    private const HOURLY_LIMIT = 5;
    private const HOUR_SECONDS = 3600;

    public function is_honeypot_tripped(array $body): bool
    {
        $honeypot = isset($body['company_website']) ? trim((string) $body['company_website']) : '';

        return $honeypot !== '';
    }

    public function is_rate_limited(WP_REST_Request $request): bool
    {
        $ip = $this->client_ip($request);
        if ($ip === '0.0.0.0') {
            return false;
        }

        $key = 'cwas_report_rl_' . md5($ip);
        $count = (int) get_transient($key);

        return $count >= self::HOURLY_LIMIT;
    }

    public function record_submission(WP_REST_Request $request): void
    {
        $ip = $this->client_ip($request);
        if ($ip === '0.0.0.0') {
            return;
        }

        $key = 'cwas_report_rl_' . md5($ip);
        $count = (int) get_transient($key);
        set_transient($key, $count + 1, self::HOUR_SECONDS);
    }

    private function client_ip(WP_REST_Request $request): string
    {
        $forwarded = $request->get_header('x_forwarded_for');
        if (is_string($forwarded) && $forwarded !== '') {
            $ip = trim(explode(',', $forwarded)[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }

        if (! empty($_SERVER['REMOTE_ADDR'])) {
            $ip = sanitize_text_field(wp_unslash((string) $_SERVER['REMOTE_ADDR']));
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }

        return '0.0.0.0';
    }
}
