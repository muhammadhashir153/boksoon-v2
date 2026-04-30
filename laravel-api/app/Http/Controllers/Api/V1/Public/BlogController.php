<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Blog;
use App\Models\Models\Ministry;
use App\Support\ModelLookup;
use App\Support\ResourcePresenter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlogController extends ApiController
{
    public function index(Request $request)
    {
        $query = Blog::query()
            ->with(['ministry', 'publisher'])
            ->where('is_deleted', false)
            ->where('is_published', true)
            ->orderByDesc('created_at');

        if ($request->filled('ministry_id')) {
            $ministry = ModelLookup::find(Ministry::class, (string) $request->input('ministry_id'));
            if (! $ministry instanceof Ministry) {
                return $this->fail('Ministry not found.', Response::HTTP_NOT_FOUND);
            }

            $query->where('ministry_id', $ministry->id);
        }

        $blogs = $query->get()
            ->map(fn (Blog $blog) => ResourcePresenter::blog($blog))
            ->all();

        return $this->ok($blogs, 'Blogs retrieved.');
    }

    public function show(Blog $blog)
    {
        if ($blog->is_deleted || ! $blog->is_published) {
            return $this->fail('Blog not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->ok(ResourcePresenter::blog($blog->load(['ministry', 'publisher'])), 'Blog retrieved.');
    }

    public function showBySlug(string $slug)
    {
        $blog = Blog::query()
            ->with(['ministry', 'publisher'])
            ->where('slug', $slug)
            ->where('is_deleted', false)
            ->first();

        if (! $blog) {
            return $this->fail('Blog not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->ok(ResourcePresenter::blog($blog), 'Blog retrieved.');
    }
}
