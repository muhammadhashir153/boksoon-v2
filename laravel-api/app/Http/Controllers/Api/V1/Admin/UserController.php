<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\AdminUser;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use App\Support\ModelLookup;
use App\Support\ResourcePresenter;
use Illuminate\Hashing\BcryptHasher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class UserController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = AdminUser::query()->with(['roleRecord', 'ministry'])->orderByDesc('created_at')->get()->map(fn (AdminUser $user) => ResourcePresenter::user($user))->all();

        return $this->ok($items, 'Users retrieved.');
    }

    public function store(Request $request)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('admin', 'email')],
            'pass' => ['nullable', 'string', 'min:8'],
            'password' => ['nullable', 'string', 'min:8'],
            'role_id' => ['nullable'],
            'role' => ['nullable'],
            'ministry_id' => ['nullable'],
        ], [
            'email.unique' => 'A staff member with this email already exists.',
        ]);

        $role = ModelLookup::find(Role::class, $validated['role_id'] ?? $validated['role'] ?? null);
        if (! $role instanceof Role) {
            return $this->fail('Role not found.', Response::HTTP_NOT_FOUND);
        }

        $ministry = ModelLookup::find(Ministry::class, $validated['ministry_id'] ?? null);
        if ($role->name === 'author' && ! $ministry instanceof Ministry) {
            return $this->fail('Author users require a ministry.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $verificationToken = Str()->random(64);

        $user = AdminUser::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'pass' => Hash::make((string) ($validated['pass'] ?? $validated['password'] ?? 'ChangeMe123!')),
            'role' => $role->id,
            'ministry_id' => $ministry?->id,
            'verification_token' => $verificationToken
        ]);

        $verificationUrl = $this->verificationUrl($verificationToken);

        Mail::html(
            view('mail.email-verification', [
                'name' => $user->name,
                'verificationUrl' => $verificationUrl,
            ])->render(),
            function ($message) use ($user): void {
                $message
                    ->to($user->email, $user->name)
                    ->subject('Verify Your Email');
            }
        );

        return $this->ok(ResourcePresenter::user($user->fresh(['roleRecord', 'ministry'])), 'User created.', Response::HTTP_CREATED);
    }

    public function show(AdminUser $user)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::user($user->load(['roleRecord', 'ministry'])), 'User retrieved.');
    }

    public function update(Request $request, AdminUser $user)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('admin', 'email')->ignore($user->id)],
            'role_id' => ['nullable'],
            'role' => ['nullable'],
            'ministry_id' => ['nullable'],
        ], [
            'email.unique' => 'A staff member with this email already exists.',
        ]);

        if (array_key_exists('role_id', $validated) || array_key_exists('role', $validated)) {
            $role = ModelLookup::find(Role::class, $validated['role_id'] ?? $validated['role']);
            if (! $role instanceof Role) {
                return $this->fail('Role not found.', Response::HTTP_NOT_FOUND);
            }

            $validated['role'] = $role->id;
            unset($validated['role_id']);
        }

        if (array_key_exists('ministry_id', $validated)) {
            $validated['ministry_id'] = ModelLookup::find(Ministry::class, $validated['ministry_id'])?->id;
        }

        $nextRoleId = $validated['role'] ?? $user->role;
        $nextRole = Role::query()->find($nextRoleId);
        $nextMinistryId = $validated['ministry_id'] ?? $user->ministry_id;
        if ($nextRole?->name === 'author' && ! $nextMinistryId) {
            return $this->fail('Author users require a ministry.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->update($validated);

        return $this->ok(ResourcePresenter::user($user->fresh(['roleRecord', 'ministry'])), 'User updated.');
    }

    public function updatePassword(Request $request, AdminUser $user)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'pass' => ['nullable', 'string', 'min:8'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $password = (string) ($validated['pass'] ?? $validated['password'] ?? '');
        if ($password === '') {
            return $this->fail('A password is required.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->pass = Hash::make($password);
        $user->save();

        return $this->ok(['updated' => true], 'User password updated.');
    }

    public function destroy(AdminUser $user)
    {
        if (! $this->actorHasRole('admin')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        if ($this->actor()?->is($user)) {
            return $this->fail('You cannot delete your own account.', Response::HTTP_CONFLICT);
        }

        $user->delete();

        return $this->ok(['deleted' => true], 'User deleted.');
    }

    private function verificationUrl(String $token): string
    {
        $frontendUrl = rtrim((string) config('ngo_api.frontend_url'), '/');
        $verificationPath = '/admin/verify-email';

        return $frontendUrl.$verificationPath.'?token='.urlencode($token);
    }
}
