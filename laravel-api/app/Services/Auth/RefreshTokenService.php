<?php

namespace App\Services\Auth;

use App\Models\Models\RefreshToken;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

final class RefreshTokenService
{
    public function __construct(private readonly int $refreshTtl)
    {
    }

    public function issue(string $userUuid, ?string $replaceToken = null): string
    {
        if ($replaceToken) {
            $this->revoke($replaceToken);
        }

        RefreshToken::query()
            ->where('admin_uuid', $userUuid)
            ->whereNull('revoked_at')
            ->where('expires_at', '<=', now())
            ->update(['revoked_at' => now()]);

        $plainTextToken = Str::random(80);

        RefreshToken::query()->create([
            'id' => (string) Str::orderedUuid(),
            'admin_uuid' => $userUuid,
            'token_hash' => hash('sha256', $plainTextToken),
            'expires_at' => CarbonImmutable::now()->addSeconds($this->refreshTtl),
            'created_at' => now(),
        ]);

        return $plainTextToken;
    }

    public function consume(string $plainTextToken): ?RefreshToken
    {
        $token = RefreshToken::query()
            ->where('token_hash', hash('sha256', $plainTextToken))
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->latest('created_at')
            ->first();

        if (! $token) {
            Log::warning('auth.refresh_token_rejected');
            return null;
        }

        $token->forceFill(['revoked_at' => now()])->save();
        Log::info('auth.refresh_token_consumed', ['token_id' => $token->id, 'user_id' => $token->admin_uuid]);

        return $token;
    }

    public function revoke(string $plainTextToken): void
    {
        RefreshToken::query()
            ->where('token_hash', hash('sha256', $plainTextToken))
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        Log::info('auth.refresh_token_revoked');
    }
}
