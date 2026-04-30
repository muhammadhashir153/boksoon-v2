<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Models\AdminUser;
use App\Services\Auth\JwtService;
use App\Services\Auth\RefreshTokenService;
use App\Support\MediaManager;
use App\Support\ResourcePresenter;
use App\Support\UploadRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends ApiController
{
    public function login(Request $request, JwtService $jwtService, RefreshTokenService $refreshTokenService)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['nullable', 'string'],
            'pass' => ['nullable', 'string'],
        ]);

        $password = (string) ($validated['password'] ?? $validated['pass'] ?? '');

        $user = AdminUser::query()
            ->with(['roleRecord', 'ministry'])
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($password, (string) $user->pass)) {
            Log::warning('auth.failed_login', [
                'email' => strtolower($validated['email']),
                'ip' => $request->ip(),
            ]);
            return $this->fail('Invalid credentials.', Response::HTTP_UNAUTHORIZED);
        }
        if(!$user->is_verified){
            Log::warning('auth.failed_login', [
                'email' => strtolower($validated['email']),
                'ip' => $request->ip(),
            ]);
            return $this->fail('Please verify your email address.', Response::HTTP_UNAUTHORIZED);
        }

        Log::info('auth.login_success', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
        ]);

        return $this->ok([
            'access_token' => $jwtService->issueAccessToken($user->id, (string) $user->role_name),
            'refresh_token' => $refreshTokenService->issue($user->id),
            'token_type' => 'Bearer',
            'expires_in' => $jwtService->getExpiresIn(),
            'user' => ResourcePresenter::user($user),
        ], 'Login successful.');
    }

    public function refresh(Request $request, JwtService $jwtService, RefreshTokenService $refreshTokenService)
    {
        $validated = $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $refreshToken = $refreshTokenService->consume($validated['refresh_token']);
        if (! $refreshToken) {
            Log::warning('auth.invalid_refresh_token', [
                'ip' => $request->ip(),
            ]);
            return $this->fail('Refresh token is invalid or expired.', Response::HTTP_UNAUTHORIZED);
        }

        $user = AdminUser::query()->with(['roleRecord', 'ministry'])->find($refreshToken->admin_uuid);
        if (! $user) {
            Log::warning('auth.refresh_user_missing', [
                'ip' => $request->ip(),
                'admin_uuid' => $refreshToken->admin_uuid,
            ]);
            return $this->fail('Authenticated user not found.', Response::HTTP_UNAUTHORIZED);
        }

        return $this->ok([
            'access_token' => $jwtService->issueAccessToken($user->id, (string) $user->role_name),
            'refresh_token' => $refreshTokenService->issue($user->id, $validated['refresh_token']),
            'token_type' => 'Bearer',
            'expires_in' => $jwtService->getExpiresIn(),
        ], 'Token refreshed.');
    }

    public function logout(Request $request, RefreshTokenService $refreshTokenService)
    {
        $request->validate([
            'refresh_token' => ['nullable', 'string'],
        ]);

        if ($request->filled('refresh_token')) {
            $refreshTokenService->revoke((string) $request->string('refresh_token'));
        }

        Log::info('auth.logout', [
            'user_id' => $this->actor()?->id,
            'ip' => $request->ip(),
        ]);

        return $this->ok(['logged_out' => true], 'Logged out successfully.');
    }

    public function me()
    {
        $actor = $this->actor()?->loadMissing(['roleRecord', 'ministry']);

        return $this->ok(ResourcePresenter::user($actor), 'Authenticated user.');
    }

    public function updateProfile(Request $request)
    {
        if ($this->isUnsupportedMultipartPatch($request)) {
            return $this->fail(
                'Use POST /api/v1/auth/profile for multipart profile updates. PHP does not reliably parse multipart PATCH requests.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $actor = $this->actor();
        if (! $actor) {
            return $this->fail('Authentication required.', Response::HTTP_UNAUTHORIZED);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('admin', 'email')->ignore($actor->id)],
            'dp' => UploadRules::image(2048),
        ], [
            'email.unique' => 'A staff member with this email already exists.',
        ]);

        $actor->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'dp' => MediaManager::store($request->file('dp'), 'media/profile', $actor->dp),
        ]);
        $actor->save();

        return $this->ok(ResourcePresenter::user($actor->fresh(['roleRecord', 'ministry'])), 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $actor = $this->actor();
        if (! $actor) {
            return $this->fail('Authentication required.', Response::HTTP_UNAUTHORIZED);
        }

        $validated = $request->validate([
            'current_pass' => ['required', 'string'],
            'new_pass' => ['required', 'string', 'min:8'],
            'confirm_pass' => ['required', 'same:new_pass'],
        ]);

        if (! Hash::check($validated['current_pass'], (string) $actor->pass)) {
            return $this->fail('Current password is incorrect.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $actor->pass = Hash::make($validated['new_pass']);
        $actor->save();

        return $this->ok(['updated' => true], 'Password updated.');
    }

    public function verifyEmail(string $token)
    {
        $user = AdminUser::query()->where('verification_token', $token)->first();
        if (!$user) {
            return $this->fail('Invalid verification token.', Response::HTTP_BAD_REQUEST);
        }

        if ( !$user->is_verified ) {
           $user->is_verified = true;
           $user->save();

            Log::info('auth.email_verified', [
                'user_id' => $user->id,
                'ip' => request()->ip(),
            ]);

            return $this->ok(['verified' => true], 'Email verified successfully.');
        }else{
            return $this->ok(['already_verified' => true], 'Email already verified.');
        }

    }

    private function isUnsupportedMultipartPatch(Request $request): bool
    {
        $contentType = (string) $request->header('Content-Type', '');

        return in_array($request->method(), ['PATCH', 'PUT'], true)
            && str_contains(strtolower($contentType), 'multipart/form-data');
    }
}
