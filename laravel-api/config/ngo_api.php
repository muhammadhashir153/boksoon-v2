<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'comment_verification_path' => env('COMMENT_VERIFICATION_PATH', '/verify-comment'),
    'allowed_frontend_origins' => array_values(array_filter(array_map(
        static fn (string $origin): string => trim($origin),
        explode(',', (string) env('ALLOWED_FRONTEND_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000'))
    ))),
    'legacy_frontend_url' => env('LEGACY_FRONTEND_URL', 'http://localhost/ngo/front-end'),
    'legacy_media_source_path' => env('LEGACY_MEDIA_SOURCE_PATH', base_path('../front-end')),
    'legacy_dump_staging_path' => env('LEGACY_DUMP_STAGING_PATH'),
    'media_disk' => env('MEDIA_DISK', env('FILESYSTEM_DISK', 'public')),
    'jwt' => [
        'secret' => env('JWT_SECRET'),
        'issuer' => env('JWT_ISSUER', 'ngo-laravel-api'),
        'audience' => env('JWT_AUDIENCE', 'ngo-admin'),
        'access_ttl' => (int) env('JWT_ACCESS_TTL', 900),
        'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 1209600),
    ],
];
