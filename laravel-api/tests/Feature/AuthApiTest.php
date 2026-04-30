<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_tokens_and_me_returns_authenticated_user(): void
    {
        $role = Role::query()->firstOrCreate(['name' => 'admin']);
        $ministry = Ministry::query()->create(['name' => 'Publishing']);

        $user = AdminUser::query()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $role->id,
            'ministry_id' => $ministry->id,
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'pass' => 'secret123',
        ]);

        $login->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'admin@example.test');

        $token = $login->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'admin@example.test')
            ->assertJsonPath('data.role_name', 'admin');

        Storage::fake('public');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->call(
                'PATCH',
                '/api/v1/auth/profile',
                ['name' => 'Admin User', 'email' => 'admin@example.test'],
                [],
                [],
                [
                    'CONTENT_TYPE' => 'multipart/form-data',
                    'HTTP_AUTHORIZATION' => 'Bearer '.$token,
                ]
            )
            ->assertStatus(422)
            ->assertJsonPath('message', 'Use POST /api/v1/auth/profile for multipart profile updates. PHP does not reliably parse multipart PATCH requests.');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/v1/auth/profile', [
                'name' => 'Updated Admin User',
                'email' => 'updated-admin@example.test',
                'dp' => UploadedFile::fake()->create('profile.jpg', 120, 'image/jpeg'),
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Admin User')
            ->assertJsonPath('data.email', 'updated-admin@example.test');

        $this->assertDatabaseHas('admin', [
            'id' => $user->id,
            'name' => 'Updated Admin User',
            'email' => 'updated-admin@example.test',
        ]);

        $otherUser = AdminUser::query()->create([
            'name' => 'Existing Staff',
            'email' => 'existing-staff@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $role->id,
            'ministry_id' => $ministry->id,
        ]);

        $this->assertNotNull($otherUser);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/profile', [
                'name' => 'Updated Admin User',
                'email' => 'existing-staff@example.test',
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'A staff member with this email already exists.')
            ->assertJsonPath('errors.email.0', 'A staff member with this email already exists.');
    }
}
