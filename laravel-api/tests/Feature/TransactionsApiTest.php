<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Donation;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TransactionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_transaction_and_sync_donation_totals(): void
    {
        Storage::fake('public');

        $role = Role::query()->firstOrCreate(['name' => 'admin']);
        $ministry = Ministry::query()->create(['name' => 'Books']);

        $admin = AdminUser::query()->create([
            'name' => 'Admin',
            'email' => 'admin@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $role->id,
            'ministry_id' => $ministry->id,
        ]);

        $donation = Donation::query()->create([
            'title' => 'Mission Fund',
            'description' => 'Support the mission',
            'target_amount' => 5000,
            'raised_amount' => 0,
            'admin_id' => $admin->id,
            'placeholder' => 'media/donations/existing-cover.jpg',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.test',
            'pass' => 'secret123',
        ])->assertOk();

        $token = $login->json('data.access_token');

        $create = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/transactions', [
                'donation_id' => $donation->uuid,
                'amount' => 125.5,
                'payment_method' => 'card',
                'status' => 'completed',
                'email' => 'donor@example.test',
                'name' => 'Test Donor',
                'address' => '123 Street',
            ]);

        $create->assertCreated()
            ->assertJsonPath('data.amount', 125.5)
            ->assertJsonPath('data.status', 'completed');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $create->json('data.created_at'));

        $this->assertDatabaseHas('donors', ['email' => 'donor@example.test']);
        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'raised_amount' => 125.50]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->call(
                'PATCH',
                '/api/v1/admin/donations/'.$donation->uuid,
                ['title' => 'Updated Mission Fund'],
                [],
                [],
                [
                    'CONTENT_TYPE' => 'multipart/form-data',
                    'HTTP_AUTHORIZATION' => 'Bearer '.$token,
                ]
            )
            ->assertStatus(422)
            ->assertJsonPath('message', 'Use POST /api/v1/admin/donations/{donation} for multipart donation updates. PHP does not reliably parse multipart PATCH requests.');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/v1/admin/donations/'.$donation->uuid, [
                'title' => 'Updated Mission Fund',
                'description' => 'Updated support the mission',
                'target_amount' => 7000,
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Mission Fund')
            ->assertJsonPath('data.target_amount', 7000)
            ->assertJsonPath('data.placeholder', 'media/donations/existing-cover.jpg');

        $this->assertDatabaseHas('donations', [
            'id' => $donation->id,
            'title' => 'Updated Mission Fund',
            'target_amount' => 7000,
            'placeholder' => 'media/donations/existing-cover.jpg',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->post('/api/v1/admin/donations/'.$donation->uuid, [
                'title' => 'Updated Mission Fund Again',
                'description' => 'Updated support the mission again',
                'target_amount' => 7500,
                'placeholder' => UploadedFile::fake()->create('donation.jpg', 120, 'image/jpeg'),
            ])
            ->assertOk();

        $this->assertDatabaseMissing('donations', [
            'id' => $donation->id,
            'placeholder' => 'media/donations/existing-cover.jpg',
        ]);
    }
}
