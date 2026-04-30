<?php

namespace App\Providers;

use App\Services\Auth\JwtService;
use App\Services\Auth\RefreshTokenService;
use Illuminate\Auth\Access\Response as AccessResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(JwtService::class, fn () => new JwtService(
            secret: (string) config('ngo_api.jwt.secret'),
            issuer: (string) config('ngo_api.jwt.issuer'),
            audience: (string) config('ngo_api.jwt.audience'),
            accessTtl: (int) config('ngo_api.jwt.access_ttl'),
        ));

        $this->app->singleton(RefreshTokenService::class, fn () => new RefreshTokenService(
            refreshTtl: (int) config('ngo_api.jwt.refresh_ttl'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->validateProductionSecuritySettings();
        $this->registerAuthorizationGates();

        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute((int) config('security.rate_limits.public_per_minute', 10))
                ->by($request->ip().':'.$request->path());
        });

        RateLimiter::for('auth-api', function (Request $request) {
            $email = strtolower(trim((string) $request->input('email', '')));

            return Limit::perMinute((int) config('security.rate_limits.auth_per_minute', 5))
                ->by($request->ip().':'.$email.':'.$request->path());
        });

        RateLimiter::for('admin-api', function (Request $request) {
            $actorId = optional($request->user())->getAuthIdentifier() ?: 'guest';

            return Limit::perMinute((int) config('security.rate_limits.admin_per_minute', 60))
                ->by($request->ip().':'.$actorId.':'.$request->path());
        });
    }

    private function validateProductionSecuritySettings(): void
    {
        if (! $this->app->isProduction()) {
            return;
        }

        if ((bool) config('app.debug')) {
            throw new RuntimeException('APP_DEBUG must be disabled in production.');
        }

        if (blank(config('app.key'))) {
            throw new RuntimeException('APP_KEY must be configured in production.');
        }

        if (blank(config('ngo_api.jwt.secret'))) {
            throw new RuntimeException('JWT_SECRET must be configured in production.');
        }
    }

    private function registerAuthorizationGates(): void
    {
        Gate::define('access-users', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin'));
        Gate::define('access-roles', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin'));
        Gate::define('access-ministries', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin'));
        Gate::define('access-donors', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-donations', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-transactions', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-contacts', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-newsletters', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-books', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager', 'reviwer'));
        Gate::define('purge-books', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-blogs', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager', 'author'));
        Gate::define('purge-blogs', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager'));
        Gate::define('access-testimonials', fn ($user) => $this->allowRoles($user->role_name ?? null, 'admin', 'manager', 'reviwer'));
    }

    private function allowRoles(?string $role, string ...$allowed): AccessResponse
    {
        return in_array($role, $allowed, true)
            ? AccessResponse::allow()
            : AccessResponse::deny('Forbidden.');
    }
}
