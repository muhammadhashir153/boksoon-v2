<?php

use App\Http\Middleware\EnsureJwtAccessToken;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\ApplySecurityHeaders;
use App\Http\Middleware\TrustCloudflareProxies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(TrustCloudflareProxies::class);
        $middleware->append(HandleCors::class);
        $middleware->append(ApplySecurityHeaders::class);

        $middleware->alias([
            'auth.jwt' => EnsureJwtAccessToken::class,
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($exception instanceof ValidationException) {
                $errors = $exception->errors();
                $firstMessage = Arr::first(Arr::flatten($errors));
                logger()->warning('api.validation_failed', [
                    'path' => $request->path(),
                    'ip' => $request->ip(),
                    'errors' => array_keys($errors),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => is_string($firstMessage) && $firstMessage !== '' ? $firstMessage : 'Validation failed.',
                    'errors' => $errors,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if ($exception instanceof HttpExceptionInterface) {
                if ($exception->getStatusCode() >= 500) {
                    logger()->error('api.http_exception', [
                        'path' => $request->path(),
                        'ip' => $request->ip(),
                        'status' => $exception->getStatusCode(),
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage() ?: Response::$statusTexts[$exception->getStatusCode()] ?? 'Request failed.',
                ], $exception->getStatusCode());
            }

            logger()->error('api.unhandled_exception', [
                'path' => $request->path(),
                'ip' => $request->ip(),
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $exception->getMessage() : 'Server error.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        });
    })->create();
