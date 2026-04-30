<?php

return [
    'trusted_proxies' => env('TRUSTED_PROXIES', '*'),
    'headers' => [
        'x_frame_options' => env('SECURITY_X_FRAME_OPTIONS', 'DENY'),
        'referrer_policy' => env('SECURITY_REFERRER_POLICY', 'no-referrer'),
        'content_security_policy' => env('SECURITY_CONTENT_SECURITY_POLICY', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"),
        'hsts' => [
            'enabled' => filter_var(env('SECURITY_HSTS_ENABLED', true), FILTER_VALIDATE_BOOL),
            'max_age' => (int) env('SECURITY_HSTS_MAX_AGE', 31536000),
        ],
    ],
    'rate_limits' => [
        'public_per_minute' => (int) env('RATE_LIMIT_PUBLIC_PER_MINUTE', 10),
        'auth_per_minute' => (int) env('RATE_LIMIT_AUTH_PER_MINUTE', 5),
        'admin_per_minute' => (int) env('RATE_LIMIT_ADMIN_PER_MINUTE', 60),
    ],
];
