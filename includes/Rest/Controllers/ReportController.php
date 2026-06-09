<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Rest\Controllers;

use Clearweb\AccessibilitySuite\Report\ReportSpamGuard;
use WP_REST_Request;
use WP_REST_Response;

final class ReportController extends BaseController
{
    public function registerRoutes(): void
    {
        register_rest_route($this->namespace, '/report', [
            'methods'             => 'POST',
            'callback'            => [$this, 'submit'],
            'permission_callback' => '__return_true',
            'args'                => [
                'category'    => ['required' => true, 'sanitize_callback' => 'sanitize_key'],
                'description' => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
            ],
        ]);
    }

    public function submit(WP_REST_Request $request): WP_REST_Response
    {
        $body = $this->json($request);
        $spam_guard = new ReportSpamGuard();

        if ($spam_guard->is_honeypot_tripped($body)) {
            return $this->response([
                'ok'      => true,
                'message' => __('Report submitted. Thank you!', 'clearweb-accessibility-add-on'),
            ]);
        }

        if ($spam_guard->is_rate_limited($request)) {
            return $this->response([
                'ok'      => false,
                'message' => __('Too many reports from your connection. Please wait and try again later.', 'clearweb-accessibility-add-on'),
            ], 429);
        }

        $name        = sanitize_text_field($body['reporter_name']  ?? '');
        $email       = sanitize_email($body['reporter_email']       ?? '');
        $pageUrl     = esc_url_raw($body['page_url']                ?? '');
        $category    = sanitize_key($body['category']               ?? '');
        $description = sanitize_textarea_field($body['description'] ?? '');

        if (empty($category) || empty($description) || strlen(trim($description)) < 10) {
            return $this->response([
                'ok'      => false,
                'message' => __('Category and description are required.', 'clearweb-accessibility-add-on'),
            ], 422);
        }

        $toEmail = sanitize_email(get_option('cwas_settings', [])['widget_report_email'] ?? '');
        if (! is_email($toEmail)) {
            $toEmail = (string) get_option('admin_email', '');
        }

        /* translators: %s: site name */
        $subject = sprintf(__('[%s] Accessibility problem report', 'clearweb-accessibility-add-on'), get_bloginfo('name'));

        $message  = __('A new accessibility problem has been reported:', 'clearweb-accessibility-add-on') . "\n\n";
        if ($name) {
            $message .= 'Name:        ' . $name . "\n";
        }
        if ($email) {
            $message .= 'Email:       ' . $email . "\n";
        }
        if ($pageUrl) {
            $message .= 'Page:        ' . $pageUrl . "\n";
        }
        $message .= 'Category:    ' . $category . "\n\n";
        $message .= 'Description:' . "\n" . $description . "\n";

        $sent = wp_mail($toEmail, $subject, $message);

        if (! $sent) {
            return $this->response([
                'ok'      => false,
                'message' => __('Could not send the report. Please try again.', 'clearweb-accessibility-add-on'),
            ], 500);
        }

        $spam_guard->record_submission($request);

        return $this->response([
            'ok'      => true,
            'message' => __('Report submitted. Thank you!', 'clearweb-accessibility-add-on'),
        ]);
    }
}
