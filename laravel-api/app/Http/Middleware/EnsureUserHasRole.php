<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = Auth::user();
        if (! $user) {
            Log::warning('api.unauthenticated_role_check', [
                'path' => $request->path(),
                'ip' => $request->ip(),
                'roles' => $roles,
            ]);
            return ApiResponse::error('Authentication required.', Response::HTTP_UNAUTHORIZED);
        }

        if ($roles !== [] && ! in_array($user->role_name, $roles, true)) {
            Log::warning('api.forbidden_role_check', [
                'path' => $request->path(),
                'ip' => $request->ip(),
                'user_id' => $user->id,
                'user_role' => $user->role_name,
                'required_roles' => $roles,
            ]);
            return ApiResponse::error('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
