<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Rest\Controllers;

use WP_REST_Request;
use WP_REST_Response;

abstract class BaseController
{
    protected string $namespace = 'cwas/v1';

    abstract public function registerRoutes(): void;

    public function canManage(): bool
    {
        return current_user_can('manage_options');
    }

    protected function response(array $data, int $status = 200): WP_REST_Response
    {
        return new WP_REST_Response($data, $status);
    }

    protected function json(WP_REST_Request $request): array
    {
        $params = $request->get_json_params();
        return is_array($params) ? $params : [];
    }
}
