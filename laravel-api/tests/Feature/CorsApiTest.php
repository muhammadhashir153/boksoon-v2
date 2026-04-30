<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsApiTest extends TestCase
{
    public function test_allowed_origin_receives_cors_headers_for_preflight(): void
    {
        $response = $this->call('OPTIONS', '/api/v1/health', [], [], [], [
            'HTTP_ORIGIN' => 'http://localhost:3000',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    }

    public function test_disallowed_origin_does_not_receive_allow_origin_header(): void
    {
        $response = $this->call('OPTIONS', '/api/v1/health', [], [], [], [
            'HTTP_ORIGIN' => 'https://evil.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);

        $response->assertNoContent();
        $response->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
