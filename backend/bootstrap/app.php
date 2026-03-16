<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register middleware aliases for route-level use
        $middleware->alias([
            'tenant' => \App\Http\Middleware\EnsureTenantAccess::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'superadmin' => \App\Http\Middleware\EnsureSuperAdmin::class,
        ]);

        // Configure Sanctum for the React SPA
        $middleware->statefulApi();

        // Exempt some routes from CSRF (needed for some local dev setups)
        $middleware->validateCsrfTokens(except: [
            'api/auth/login',
            'sanctum/csrf-cookie'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
