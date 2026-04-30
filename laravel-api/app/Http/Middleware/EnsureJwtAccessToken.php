<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use App\Models\Models\AdminUser;
use App\Services\Auth\JwtService;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureJwtAccessToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (! $token) {
            Log::warning('api.missing_bearer_token', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);
            return ApiResponse::error('Bearer token is required.', Response::HTTP_UNAUTHORIZED);
        }

        try {
            /** @var JwtService $jwt */
            $jwt = app(JwtService::class);
            $payload = $jwt->decode($token);
            if (($payload['typ'] ?? null) !== 'access') {
                Log::warning('api.invalid_token_type', [
                    'path' => $request->path(),
                    'ip' => $request->ip(),
                    'token_type' => $payload['typ'] ?? null,
                ]);
                return ApiResponse::error('Invalid token type.', Response::HTTP_UNAUTHORIZED);
            }

            $user = AdminUser::query()->find((string) $payload['sub']);
            if (! $user) {
                Log::warning('api.authenticated_user_missing', [
                    'path' => $request->path(),
                    'ip' => $request->ip(),
                    'subject' => $payload['sub'] ?? null,
                ]);
                return ApiResponse::error('Authenticated user not found.', Response::HTTP_UNAUTHORIZED);
            }

            Auth::setUser($user);
            $request->attributes->set('jwt_payload', $payload);
        } catch (\Throwable $exception) {
            Log::warning('api.invalid_access_token', [
                'path' => $request->path(),
                'ip' => $request->ip(),
                'message' => $exception->getMessage(),
            ]);
            return ApiResponse::error('Token is invalid or expired.', Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
