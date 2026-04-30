<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Book;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminParityApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_manage_books_and_blog_editor_uploads(): void
    {
        Storage::fake('public');

        $adminRole = Role::query()->firstOrCreate(['name' => 'admin']);
        $managerRole = Role::query()->firstOrCreate(['name' => 'manager']);
        $authorRole = Role::query()->firstOrCreate(['name' => 'author']);
        Role::query()->firstOrCreate(['name' => 'reviwer']);

        $ministry = Ministry::query()->create(['name' => 'Publishing']);

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

        $managerToken = $this->postJson('/api/v1/auth/login', [
            'email' => $manager->email,
            'pass' => 'secret123',
        ])
            ->assertOk()
            ->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->post('/api/v1/admin/books', [
                'title' => 'Modern Missions',
                'description' => 'A migration parity book.',
                'link_url' => 'https://example.test/books/modern-missions',
                'link_label' => 'Buy now',
                'author_name' => 'Boksoon Kim',
                'sort_order' => 2,
                'is_published' => '1',
                'cover_image' => UploadedFile::fake()->create('cover.jpg', 120, 'image/jpeg'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'modern-missions');

        $this->assertDatabaseHas('books', ['slug' => 'modern-missions']);

        $blog = Blog::query()->create([
            'title' => 'Manager Visible Blog',
            'slug' => 'manager-visible-blog',
            'banner_image' => 'assets/img/default.webp',
            'content' => '<p>Draft</p>',
            'ministry_id' => $ministry->id,
            'publisher_id' => $author->id,
            'is_published' => false,
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->getJson('/api/v1/admin/blogs/'.$blog->uuid)
            ->assertOk()
            ->assertJsonPath('data.slug', 'manager-visible-blog');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->post('/api/v1/admin/blogs/'.$blog->uuid, [
                'is_published' => '1',
                'title' => 'Updated Blog Title',
                'content' => '<p>Updated content</p>',
                'ministry_id' => $ministry->id,
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Blog Title')
            ->assertJsonPath('data.content', '<p>Updated content</p>')
            ->assertJsonPath('data.is_published', true);

        $this->assertDatabaseHas('blogs', [
            'id' => $blog->id,
            'title' => 'Updated Blog Title',
            'content' => '<p>Updated content</p>',
            'is_published' => 1,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->call(
                'PATCH',
                '/api/v1/admin/blogs/'.$blog->uuid,
                ['is_published' => '0'],
                [],
                [],
                [
                    'CONTENT_TYPE' => 'multipart/form-data',
                    'HTTP_AUTHORIZATION' => 'Bearer '.$managerToken,
                ]
            )
            ->assertStatus(422)
            ->assertJsonPath('message', 'Use POST /api/v1/admin/blogs/{blog} for multipart blog updates. PHP does not reliably parse multipart PATCH requests.');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->post('/api/v1/admin/blogs/'.$blog->uuid, [
                'iss_published' => '0',
            ])
            ->assertOk()
            ->assertJsonPath('data.is_published', false);

        $this->assertDatabaseHas('blogs', [
            'id' => $blog->id,
            'is_published' => 0,
        ]);

        $uploadResponse = $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->post('/api/v1/admin/blogs/upload-image', [
                'upload' => UploadedFile::fake()->create('editor-image.jpg', 120, 'image/jpeg'),
            ])
            ->assertCreated();

        $this->assertTrue(str_starts_with((string) $uploadResponse->json('data.path'), 'media/editor/'));

        Storage::disk('public')->assertExists((string) Book::query()->firstWhere('slug', 'modern-missions')?->cover_image);

        $createdBook = Book::query()->firstWhere('slug', 'modern-missions');
        $this->assertNotNull($createdBook);

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->call(
                'PATCH',
                '/api/v1/admin/books/'.$createdBook->uuid,
                ['title' => 'Updated Modern Missions'],
                [],
                [],
                [
                    'CONTENT_TYPE' => 'multipart/form-data',
                    'HTTP_AUTHORIZATION' => 'Bearer '.$managerToken,
                ]
            )
            ->assertStatus(422)
            ->assertJsonPath('message', 'Use POST /api/v1/admin/books/{book} for multipart book updates. PHP does not reliably parse multipart PATCH requests.');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->post('/api/v1/admin/books/'.$createdBook->uuid, [
                'title' => 'Updated Modern Missions',
                'description' => 'A migration parity book.',
                'link_url' => 'https://example.test/books/modern-missions-updated',
                'is_published' => '0',
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Modern Missions')
            ->assertJsonPath('data.is_published', false);

        $this->assertDatabaseHas('books', [
            'id' => $createdBook->id,
            'title' => 'Updated Modern Missions',
            'is_published' => 0,
        ]);

        $authorToken = $this->postJson('/api/v1/auth/login', [
            'email' => $author->email,
            'pass' => 'secret123',
        ])->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->post('/api/v1/admin/blogs', [
                'title' => 'Author Ministry Blog',
                'content' => '<p>Author content</p>',
                'is_published' => '1',
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Author Ministry Blog')
            ->assertJsonPath('data.ministry_id', $ministry->id);

        $this->assertDatabaseHas('blogs', [
            'title' => 'Author Ministry Blog',
            'publisher_id' => $author->id,
            'ministry_id' => $ministry->id,
        ]);

        $otherBook = Book::query()->create([
            'title' => 'Soft Delete Book',
            'slug' => 'soft-delete-book',
            'cover_image' => 'assets/img/default.webp',
            'description' => 'Delete me softly.',
            'link_url' => 'https://example.test/books/soft-delete-book',
            'link_label' => 'Read',
            'author_name' => 'Boksoon Kim',
            'sort_order' => 5,
            'is_published' => true,
            'is_deleted' => false,
            'added_by' => $manager->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->deleteJson('/api/v1/admin/books/'.$otherBook->uuid)
            ->assertForbidden();

        $admin = AdminUser::query()->create([
            'name' => 'Admin',
            'email' => 'admin@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $adminRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $adminToken = $this->postJson('/api/v1/auth/login', [
            'email' => $admin->email,
            'pass' => 'secret123',
        ])->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->deleteJson('/api/v1/admin/books/'.$otherBook->uuid)
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->postJson('/api/v1/admin/donors', [
                'name' => 'Existing Donor',
                'email' => 'donor-duplicate@example.test',
                'address' => '123 Duplicate Lane',
            ])
            ->assertCreated();

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->postJson('/api/v1/admin/donors', [
                'name' => 'Second Donor',
                'email' => 'donor-duplicate@example.test',
                'address' => '456 Duplicate Lane',
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'A donor with this email already exists.')
            ->assertJsonPath('errors.email.0', 'A donor with this email already exists.');

        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/users', [
                'name' => 'First Staff',
                'email' => 'staff-duplicate@example.test',
                'pass' => 'secret123',
                'role' => $managerRole->id,
                'ministry_id' => $ministry->id,
            ])
            ->assertCreated();

        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/users', [
                'name' => 'Second Staff',
                'email' => 'staff-duplicate@example.test',
                'pass' => 'secret123',
                'role' => $managerRole->id,
                'ministry_id' => $ministry->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'A staff member with this email already exists.')
            ->assertJsonPath('errors.email.0', 'A staff member with this email already exists.');
    }
}
