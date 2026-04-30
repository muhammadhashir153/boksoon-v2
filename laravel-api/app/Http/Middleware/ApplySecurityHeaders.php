<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApplySecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', (string) config('security.headers.x_frame_options', 'DENY'));
        $response->headers->set('Referrer-Policy', (string) config('security.headers.referrer_policy', 'no-referrer'));

        $csp = trim((string) config('security.headers.content_security_policy', ''));
        if ($csp !== '') {
            $response->headers->set('Content-Security-Policy', $csp);
        }

        if (
            (bool) config('security.headers.hsts.enabled', true)
            && $request->isSecure()
        ) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age='.(int) config('security.headers.hsts.max_age', 31536000).'; includeSubDomains'
            );
        }

        return $response;
    }
}
