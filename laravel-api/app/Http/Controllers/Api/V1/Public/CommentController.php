<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Blog;
use App\Models\Models\Comment;
use App\Support\ModelLookup;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends ApiController
{
    public function index(Blog $blog)
    {
        $comments = Comment::query()
            ->where('blog_id', $blog->id)
            ->where('is_verified', true)
            ->where('is_published', true)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Comment $comment) => ResourcePresenter::comment($comment->loadMissing('blog')))
            ->all();

        return $this->ok($comments, 'Comments retrieved.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'blog_id' => ['required'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        $blog = ModelLookup::find(Blog::class, $validated['blog_id']);
        if (! $blog instanceof Blog) {
            return $this->fail('Blog not found.', Response::HTTP_NOT_FOUND);
        }

        $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('comments', 'email')->where(fn ($query) => $query->where('blog_id', $blog->id)),
            ],
        ], [
            'email.unique' => 'You have already submitted a comment on this blog with this email.',
        ]);

        $comment = Comment::query()->create([
            'blog_id' => $blog->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $validated['message'],
            'is_verified' => false,
            'is_published' => false,
            'verification_token' => Str::random(64),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $verificationUrl = $this->frontendVerificationUrl($comment->verification_token);

        Mail::html(
            view('mail.comment-verification', [
                'name' => $comment->name,
                'verificationUrl' => $verificationUrl,
            ])->render(),
            function ($message) use ($comment): void {
                $message
                    ->to($comment->email, $comment->name)
                    ->subject('Verify Your Comment');
            }
        );

        return $this->ok(ResourcePresenter::comment($comment->load('blog')), 'Comment submitted. Please verify via email.', Response::HTTP_CREATED);
    }

    public function verify(string $token)
    {
        $comment = Comment::query()->where('verification_token', $token)->first();
        if (! $comment) {
            return $this->fail('Verification failed.', Response::HTTP_NOT_FOUND);
        }

        $comment->fill([
            'is_verified' => true,
            'is_published' => true,
            'verification_token' => null,
            'updated_at' => now(),
        ])->save();

        return $this->ok(ResourcePresenter::comment($comment->load('blog')), 'Comment verified.');
    }

    private function frontendVerificationUrl(string $token): string
    {
        $frontendUrl = rtrim((string) config('ngo_api.frontend_url'), '/');
        $verificationPath = '/'.ltrim((string) config('ngo_api.comment_verification_path', '/verify-comment'), '/');

        return $frontendUrl.$verificationPath.'?token='.urlencode($token);
    }
}
