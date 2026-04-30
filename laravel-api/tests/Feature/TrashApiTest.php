<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Book;
use App\Models\Models\Donation;
use App\Models\Models\Donor;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use App\Models\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TrashApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_soft_delete_trash_restore_and_purge_flow_respects_roles(): void
    {
        $adminRole = Role::query()->firstOrCreate(['name' => 'admin']);
        $managerRole = Role::query()->firstOrCreate(['name' => 'manager']);
        $authorRole = Role::query()->firstOrCreate(['name' => 'author']);
        $reviewerRole = Role::query()->firstOrCreate(['name' => 'reviwer']);
        $ministry = Ministry::query()->create(['name' => 'Publishing']);

        $admin = AdminUser::query()->create([
            'name' => 'Admin',
            'email' => 'admin@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $adminRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $manager = AdminUser::query()->create([
            'name' => 'Manager',
            'email' => 'manager@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $managerRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $author = AdminUser::query()->create([
            'name' => 'Author',
            'email' => 'author@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $authorRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $reviewer = AdminUser::query()->create([
            'name' => 'Reviewer',
            'email' => 'reviewer@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $reviewerRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $authorToken = $this->postJson('/api/v1/auth/login', [
            'email' => $author->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $reviewerToken = $this->postJson('/api/v1/auth/login', [
            'email' => $reviewer->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $managerToken = $this->postJson('/api/v1/auth/login', [
            'email' => $manager->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $adminToken = $this->postJson('/api/v1/auth/login', [
            'email' => $admin->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $blog = Blog::query()->create([
            'title' => 'Trash Blog',
            'slug' => 'trash-blog',
            'content' => '<p>Story</p>',
            'ministry_id' => $ministry->id,
            'publisher_id' => $author->id,
            'is_published' => true,
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $book = Book::query()->create([
            'title' => 'Trash Book',
            'slug' => 'trash-book',
            'description' => 'Book to trash.',
            'link_url' => 'https://example.test/book',
            'link_label' => 'Read',
            'author_name' => 'Boksoon Kim',
            'sort_order' => 1,
            'is_published' => true,
            'is_deleted' => false,
            'added_by' => $reviewer->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $donation = Donation::query()->create([
            'title' => 'Trash Donation',
            'description' => 'Campaign to trash.',
            'target_amount' => 5000,
            'raised_amount' => 120,
            'admin_id' => $manager->id,
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $donor = Donor::query()->create([
            'name' => 'Donor',
            'email' => 'trash-donor@example.test',
            'address' => '123 Street',
        ]);

        $transaction = Transaction::query()->create([
            'donor_id' => $donor->id,
            'donation_id' => $donation->id,
            'amount' => 120,
            'payment_method' => 'card',
            'currency' => 'USD',
            'status' => 'completed',
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->deleteJson('/api/v1/admin/blogs/'.$blog->uuid)
            ->assertOk()
            ->assertJsonPath('message', 'Blog moved to trash.');

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->deleteJson('/api/v1/admin/books/'.$book->uuid)
            ->assertOk()
            ->assertJsonPath('message', 'Book moved to trash.');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/donations/'.$donation->uuid)
            ->assertOk()
            ->assertJsonPath('message', 'Donation moved to trash.');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/transactions/'.$transaction->uuid)
            ->assertOk()
            ->assertJsonPath('message', 'Transaction moved to trash.');

        $this->assertDatabaseHas('blogs', ['id' => $blog->id, 'is_deleted' => 1]);
        $this->assertDatabaseHas('books', ['id' => $book->id, 'is_deleted' => 1]);
        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'is_deleted' => 1]);
        $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'is_deleted' => 1]);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->getJson('/api/v1/admin/blogs')
            ->assertOk()
            ->assertJsonMissing(['id' => $blog->uuid]);

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->getJson('/api/v1/admin/blogs/trash')
            ->assertOk()
            ->assertJsonPath('data.0.id', $blog->uuid);

        $blogTrashPayload = $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->getJson('/api/v1/admin/blogs/trash')
            ->assertOk()
            ->json('data.0');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $blogTrashPayload['deleted_at']);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->getJson('/api/v1/admin/blogs/trash')
            ->assertOk()
            ->assertJsonPath('data.0.id', $blog->uuid);

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->getJson('/api/v1/admin/books/trash')
            ->assertOk()
            ->assertJsonPath('data.0.id', $book->uuid);

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->deleteJson('/api/v1/admin/blogs/'.$blog->uuid.'/purge')
            ->assertForbidden();

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->deleteJson('/api/v1/admin/books/'.$book->uuid.'/purge')
            ->assertForbidden();

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->postJson('/api/v1/admin/blogs/'.$blog->uuid.'/restore')
            ->assertOk()
            ->assertJsonPath('data.is_deleted', false);

        $this->assertDatabaseHas('blogs', ['id' => $blog->id, 'is_deleted' => 0]);

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->deleteJson('/api/v1/admin/blogs/'.$blog->uuid)
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->postJson('/api/v1/admin/books/'.$book->uuid.'/restore')
            ->assertOk()
            ->assertJsonPath('data.is_deleted', false);

        $this->assertDatabaseHas('books', ['id' => $book->id, 'is_deleted' => 0]);

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->deleteJson('/api/v1/admin/books/'.$book->uuid)
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->postJson('/api/v1/admin/donations/'.$donation->uuid.'/restore')
            ->assertOk()
            ->assertJsonPath('data.is_deleted', false);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->postJson('/api/v1/admin/transactions/'.$transaction->uuid.'/restore')
            ->assertOk()
            ->assertJsonPath('data.is_deleted', false);

        $this->assertDatabaseHas('donations', ['id' => $donation->id, 'is_deleted' => 0]);
        $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'is_deleted' => 0]);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/donations/'.$donation->uuid)
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/transactions/'.$transaction->uuid)
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/donations/'.$donation->uuid.'/purge')
            ->assertStatus(409)
            ->assertJsonPath('message', 'Cannot permanently delete a donation while transactions still exist. Remove the related transactions from trash first.');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/transactions/'.$transaction->uuid.'/purge')
            ->assertOk()
            ->assertJsonPath('message', 'Transaction permanently deleted.');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/donations/'.$donation->uuid.'/purge')
            ->assertOk()
            ->assertJsonPath('message', 'Donation permanently deleted.');

        $this->assertDatabaseMissing('donations', ['id' => $donation->id]);
        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/books/'.$book->uuid.'/purge')
            ->assertOk()
            ->assertJsonPath('message', 'Book permanently deleted.');
    }
}
