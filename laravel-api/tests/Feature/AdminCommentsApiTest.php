<?php

namespace Tests\Feature;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Comment;
use App\Models\Models\Ministry;
use App\Models\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminCommentsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_manager_and_reviewer_can_manage_comment_visibility_and_delete(): void
    {
        $adminRole = Role::query()->firstOrCreate(['name' => 'admin']);
        $managerRole = Role::query()->firstOrCreate(['name' => 'manager']);
        $reviewerRole = Role::query()->firstOrCreate(['name' => 'reviwer']);
        $authorRole = Role::query()->firstOrCreate(['name' => 'author']);
        $ministry = Ministry::query()->create(['name' => 'Publishing']);

        $admin = AdminUser::query()->create([
            'name' => 'Admin',
            'email' => 'admin-comments@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $adminRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $manager = AdminUser::query()->create([
            'name' => 'Manager',
            'email' => 'manager-comments@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $managerRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $reviewer = AdminUser::query()->create([
            'name' => 'Reviewer',
            'email' => 'reviewer-comments@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $reviewerRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $author = AdminUser::query()->create([
            'name' => 'Author',
            'email' => 'author-comments@example.test',
            'pass' => Hash::make('secret123'),
            'role' => $authorRole->id,
            'ministry_id' => $ministry->id,
        ]);

        $blog = Blog::query()->create([
            'title' => 'Managed Blog',
            'slug' => 'managed-blog',
            'content' => '<p>Hello</p>',
            'ministry_id' => $ministry->id,
            'publisher_id' => $author->id,
            'is_published' => true,
            'published_at' => now(),
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $comment = Comment::query()->create([
            'blog_id' => $blog->id,
            'name' => 'Reader',
            'email' => 'reader@example.test',
            'message' => 'Please review this.',
            'is_verified' => true,
            'is_published' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $reviewerToken = $this->postJson('/api/v1/auth/login', [
            'email' => $reviewer->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->getJson('/api/v1/admin/comments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $comment->uuid)
            ->assertJsonPath('data.0.email', 'reader@example.test')
            ->assertJsonPath('data.0.blog_title', 'Managed Blog');

        $this->withHeader('Authorization', 'Bearer '.$reviewerToken)
            ->patchJson('/api/v1/admin/comments/'.$comment->uuid, [
                'is_published' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_published', true);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'is_published' => 1,
        ]);

        $managerToken = $this->postJson('/api/v1/auth/login', [
            'email' => $manager->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$managerToken)
            ->deleteJson('/api/v1/admin/comments/'.$comment->uuid)
            ->assertOk()
            ->assertJsonPath('message', 'Comment deleted.');

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);

        $authorToken = $this->postJson('/api/v1/auth/login', [
            'email' => $author->email,
            'pass' => 'secret123',
        ])->assertOk()->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$authorToken)
            ->getJson('/api/v1/admin/comments')
            ->assertForbidden();
    }
}
