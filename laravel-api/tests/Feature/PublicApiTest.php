<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Book;
use App\Models\Models\Comment;
use App\Models\Models\Donation;
use App\Models\Models\Ministry;
use App\Models\Models\Newsletter;
use App\Models\Models\Role;
use App\Models\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_endpoints_return_expected_data_and_comment_verification_flow(): void
    {
        Mail::fake();

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
            'title' => 'Translation Fund',
            'description' => 'Support translation',
            'target_amount' => 1000,
            'raised_amount' => 0,
            'admin_id' => $admin->id,
        ]);

        $blog = Blog::query()->create([
            'title' => 'Published Story',
            'slug' => 'published-story',
            'content' => '<p>Hello</p>',
            'ministry_id' => $ministry->id,
            'publisher_id' => $admin->id,
            'is_published' => true,
            'published_at' => now(),
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Book::query()->create([
            'title' => 'Korean Prayer Notes',
            'slug' => 'korean-prayer-notes',
            'cover_image' => 'assets/img/default.webp',
            'description' => 'A published book.',
            'link_url' => 'https://example.test/book',
            'link_label' => 'Read now',
            'language' => 'English',
            'author_name' => 'Boksoon Kim',
            'sort_order' => 1,
            'is_published' => true,
            'is_deleted' => false,
            'added_by' => $admin->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Testimonial::query()->create([
            'reviewer_name' => 'Sarah',
            'review' => 'Wonderful',
            'added_by' => $admin->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('data.status', 'ok');

        $this->getJson('/api/v1/donations')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Translation Fund');

        $this->getJson('/api/v1/blogs')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'published-story');

        $blogPayload = $this->getJson('/api/v1/blogs')
            ->assertOk()
            ->json('data.0');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $blogPayload['published_at']);
        $this->assertNotFalse(strtotime((string) $blogPayload['published_at']));

        $this->getJson('/api/v1/books')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'korean-prayer-notes');

        $bookPayload = $this->getJson('/api/v1/books')
            ->assertOk()
            ->json('data.0');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $bookPayload['created_at']);

        $this->getJson('/api/v1/testimonials?limit=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $testimonialPayload = $this->getJson('/api/v1/testimonials?limit=1')
            ->assertOk()
            ->json('data.0');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $testimonialPayload['created_at']);

        $commentResponse = $this->postJson('/api/v1/comments', [
            'blog_id' => $blog->uuid,
            'name' => 'Reader',
            'email' => 'reader@example.test',
            'message' => 'Great article',
        ]);

        $commentResponse->assertCreated()
            ->assertJsonPath('success', true);

        $this->postJson('/api/v1/comments', [
            'blog_id' => $blog->uuid,
            'name' => 'Reader Again',
            'email' => 'reader@example.test',
            'message' => 'Trying to post twice',
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'You have already submitted a comment on this blog with this email.')
            ->assertJsonPath('errors.email.0', 'You have already submitted a comment on this blog with this email.');

        $comment = Comment::query()->first();
        $this->assertNotNull($comment);
        $this->assertFalse((bool) $comment->is_verified);

        $this->getJson('/api/v1/comments/verify/'.$comment->verification_token)
            ->assertOk()
            ->assertJsonPath('data.is_verified', true);

        $this->getJson('/api/v1/blogs/'.$blog->uuid.'/comments')
            ->assertOk()
            ->assertJsonPath('data.0.message', 'Great article');

        $commentPayload = $this->getJson('/api/v1/blogs/'.$blog->uuid.'/comments')
            ->assertOk()
            ->json('data.0');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $commentPayload['created_at']);

        $this->postJson('/api/v1/newsletters', ['email' => 'sub@example.test'])
            ->assertCreated()
            ->assertJsonPath('data.email', 'sub@example.test');

        $this->assertDatabaseHas('newsletter', ['email' => 'sub@example.test']);

        $newsletterPayload = $this->postJson('/api/v1/newsletters', ['email' => 'second-sub@example.test'])
            ->assertCreated()
            ->json('data');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $newsletterPayload['created_at']);

        $this->postJson('/api/v1/newsletters', ['email' => 'sub@example.test'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'This email is already subscribed to the newsletter.')
            ->assertJsonPath('errors.email.0', 'This email is already subscribed to the newsletter.');

        $contactPayload = $this->postJson('/api/v1/contacts', [
            'name' => 'Contact Person',
            'email' => 'contact@example.test',
            'number' => '555-0200',
            'message' => 'Need more details.',
        ])
            ->assertCreated()
            ->json('data');

        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', (string) $contactPayload['created_at']);

        $this->postJson('/api/v1/transactions', [
            'donation_id' => $donation->uuid,
            'amount' => 125.50,
            'name' => 'Donor Person',
            'email' => 'donor@example.test',
            'address' => '123 Main Street',
            'number' => '555-0100',
            'status' => 'completed',
        ])
            ->assertCreated()
            ->assertJsonPath('data.donation_id', $donation->uuid)
            ->assertJsonPath('data.raised_amount_after_transaction', 125.5);
    }
}
