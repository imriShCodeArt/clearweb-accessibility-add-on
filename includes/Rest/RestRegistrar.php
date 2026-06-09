<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite\Rest;

use Clearweb\AccessibilitySuite\Rest\Controllers\ReportController;
use Clearweb\AccessibilitySuite\Rest\Controllers\SettingsController;

final class RestRegistrar
{
    public function register(): void
    {
        add_action('rest_api_init', function (): void {
            (new SettingsController())->registerRoutes();
            (new ReportController())->registerRoutes();
        });
    }
}
