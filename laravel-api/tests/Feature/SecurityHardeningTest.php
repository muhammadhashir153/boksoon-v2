<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_applied_to_secure_api_responses(): void
    {
        $response = $this->call('GET', '/api/v1/health', [], [], [], [
            'HTTP_X_FORWARDED_PROTO' => 'https',
            'REMOTE_ADDR' => '127.0.0.1',
        ]);

        $response->assertOk();
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'no-referrer');
        $response->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
        $response->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    public function test_failed_logins_are_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'nobody@example.test',
                'pass' => 'wrong-password',
            ])->assertStatus(401);
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.test',
            'pass' => 'wrong-password',
        ])->assertStatus(429);
    }

    public function test_refresh_token_cannot_be_replayed(): void
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
        ])->assertOk();

        $refreshToken = $login->json('data.refresh_token');

        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ])->assertOk();

        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ])->assertStatus(401)
            ->assertJsonPath('message', 'Refresh token is invalid or expired.');
    }

    public function test_non_image_uploads_are_rejected(): void
    {
        $role = Role::query()->firstOrCreate(['name' => 'admin']);
        $ministry = Ministry::query()->create(['name' => 'Publishing']);
        $user = AdminUser::query()->create([
            'name' => 'Admin User',
            'email' => 'admin-upload@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $role->id,
            'ministry_id' => $ministry->id,
        ]);

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/v1/admin/blogs/upload-image', [
                'upload' => UploadedFile::fake()->create('shell.php', 10, 'application/x-php'),
            ])
            ->assertStatus(422);
    }

    public function test_author_cannot_restore_another_authors_trashed_blog(): void
    {
        $role = Role::query()->firstOrCreate(['name' => 'author']);
        $ministry = Ministry::query()->create(['name' => 'Publishing']);

        $authorA = AdminUser::query()->create([
            'name' => 'Author A',
            'email' => 'author-a@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $role->id,
            'ministry_id' => $ministry->id,
        ]);

        $authorB = AdminUser::query()->create([
            'name' => 'Author B',
            'email' => 'author-b@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $role->id,
            'ministry_id' => $ministry->id,
        ]);

        $blog = Blog::query()->create([
            'title' => 'Hidden Blog',
            'slug' => 'hidden-blog',
            'content' => '<p>secret</p>',
            'ministry_id' => $ministry->id,
            'publisher_id' => $authorA->id,
            'is_published' => false,
            'is_deleted' => true,
            'deleted_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $tokenB = $this->postJson('/api/v1/auth/login', [
            'email' => $authorB->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$tokenB)
            ->postJson('/api/v1/admin/blogs/'.$blog->uuid.'/restore')
            ->assertForbidden();
    }

    public function test_production_mode_hides_internal_exception_messages(): void
    {
        config(['app.debug' => false]);

        Route::get('/api/v1/_security/fail', function () {
            throw new \RuntimeException('sensitive-internal-message');
        });

        $this->getJson('/api/v1/_security/fail')
            ->assertStatus(500)
            ->assertJsonPath('message', 'Server error.');
    }
}
