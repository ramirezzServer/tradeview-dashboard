<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Allow the Vite dev server (and production frontend) to call our API.
        // Update FRONTEND_URL in .env to match your frontend origin.
        $middleware->validateCsrfTokens(except: ['api/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // Return JSON for validation errors on API routes
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'data'    => null,
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        // Return JSON 401 instead of a redirect when a token is missing or invalid.
        // Without this, Laravel would redirect to a login page (which doesn't exist
        // in an API-only project).
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please provide a valid Bearer token.',
                    'data'    => null,
                ], 401);
            }
        });

    })->create();
