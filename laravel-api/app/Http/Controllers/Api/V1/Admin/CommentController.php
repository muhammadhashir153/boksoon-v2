<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Comment;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Comment::query()
            ->with('blog')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Comment $comment) => ResourcePresenter::comment($comment, true))
            ->all();

        return $this->ok($items, 'Comments retrieved.');
    }

    public function show(Comment $comment)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::comment($comment->load('blog'), true), 'Comment retrieved.');
    }

    public function update(Request $request, Comment $comment)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'is_published' => ['required', 'boolean'],
        ]);

        $comment->fill([
            'is_published' => (bool) $validated['is_published'],
            'updated_at' => now(),
        ])->save();

        Log::info('comment.publish_status_updated', [
            'actor_id' => $this->actor()?->id,
            'comment_id' => $comment->id,
            'is_published' => $comment->is_published,
        ]);

        return $this->ok(ResourcePresenter::comment($comment->fresh('blog'), true), 'Comment publish status updated.');
    }

    public function destroy(Comment $comment)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $comment->delete();

        Log::notice('comment.deleted', [
            'actor_id' => $this->actor()?->id,
            'comment_id' => $comment->id,
        ]);

        return $this->ok(['deleted' => true], 'Comment deleted.');
    }
}
