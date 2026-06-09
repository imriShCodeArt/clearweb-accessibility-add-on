<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite;

use Clearweb\AccessibilitySuite\Admin\Menu;
use Clearweb\AccessibilitySuite\Frontend\AccessibilityWidget;
use Clearweb\AccessibilitySuite\Rest\RestRegistrar;

final class Plugin
{
    private static ?self $instance = null;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function boot(): void
    {
        (new Assets())->register();
        (new Menu())->register();
        (new RestRegistrar())->register();
        (new AccessibilityWidget())->register();
    }
}
