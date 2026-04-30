<?php

namespace App\Services\Auth;

use Carbon\CarbonImmutable;
use RuntimeException;

final class JwtService
{
    public function __construct(
        private readonly string $secret,
        private readonly string $issuer,
        private readonly string $audience,
        private readonly int $accessTtl
    ) {
    }

    public function issueAccessToken(string $subject, string $role): string
    {
        $now = CarbonImmutable::now();

        return $this->encode([
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'sub' => $subject,
            'role' => $role,
            'typ' => 'access',
            'iat' => $now->timestamp,
            'nbf' => $now->timestamp,
            'exp' => $now->addSeconds($this->accessTtl)->timestamp,
        ]);
    }

    public function decode(string $token): array
    {
        [$encodedHeader, $encodedPayload, $signature] = explode('.', $token) + [null, null, null];
        if (! $encodedHeader || ! $encodedPayload || ! $signature) {
            throw new RuntimeException('Malformed token.');
        }

        $expected = $this->sign($encodedHeader.'.'.$encodedPayload);
        if (! hash_equals($expected, $signature)) {
            throw new RuntimeException('Invalid signature.');
        }

        $payload = json_decode($this->base64UrlDecode($encodedPayload), true, 512, JSON_THROW_ON_ERROR);
        $now = CarbonImmutable::now()->timestamp;

        if (($payload['iss'] ?? null) !== $this->issuer || ($payload['aud'] ?? null) !== $this->audience) {
            throw new RuntimeException('Invalid token audience.');
        }

        if (($payload['nbf'] ?? 0) > $now || ($payload['exp'] ?? 0) < $now) {
            throw new RuntimeException('Token expired.');
        }

        return $payload;
    }

    public function getExpiresIn(): int
    {
        return $this->accessTtl;
    }

    private function encode(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $encodedHeader = $this->base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR));
        $encodedPayload = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        return $encodedHeader.'.'.$encodedPayload.'.'.$this->sign($encodedHeader.'.'.$encodedPayload);
    }

    private function sign(string $data): string
    {
        return $this->base64UrlEncode(hash_hmac('sha256', $data, $this->secret, true));
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
