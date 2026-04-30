<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;
use Symfony\Component\HttpFoundation\Response;

class TrustCloudflareProxies
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $configured = trim((string) config('security.trusted_proxies', '*'));
        $proxies = $configured === '*' ? ['REMOTE_ADDR'] : array_values(array_filter(array_map('trim', explode(',', $configured))));

        if (strtolower((string) $request->headers->get('X-Forwarded-Proto')) === 'https') {
            $request->server->set('HTTPS', 'on');
        }

        SymfonyRequest::setTrustedProxies(
            $proxies,
            SymfonyRequest::HEADER_X_FORWARDED_FOR
            | SymfonyRequest::HEADER_X_FORWARDED_HOST
            | SymfonyRequest::HEADER_X_FORWARDED_PORT
            | SymfonyRequest::HEADER_X_FORWARDED_PROTO
        );

        return $next($request);
    }
}
