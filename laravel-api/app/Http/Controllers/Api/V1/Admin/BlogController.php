<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Blog;
use App\Models\Models\Ministry;
use App\Support\MediaManager;
use App\Support\ModelLookup;
use App\Support\ResourcePresenter;
use App\Support\UploadRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class BlogController extends ApiController
{
    public function index()
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $query = Blog::query()->with(['ministry', 'publisher'])->where('is_deleted', false)->orderByDesc('created_at');
        if (in_array($actor->role_name, ['author'], true)) {
            $query->where('publisher_id', $actor->id);
        }

        $items = $query->get()->map(fn (Blog $blog) => ResourcePresenter::blog($blog))->all();

        return $this->ok($items, 'Blogs retrieved.');
    }

    public function store(Request $request)
    {
        $this->normalizePublishInput($request);

        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'ministry_id' => ['nullable'],
            'is_published' => ['nullable', 'boolean'],
            'banner_image' => UploadRules::image(),
        ]);

        $ministry = $this->resolveBlogMinistry($actor, $validated['ministry_id'] ?? null);
        if (! $ministry instanceof Ministry) {
            return $this->fail(
                $actor->role_name === 'author'
                    ? 'Author accounts require an assigned ministry before creating blogs.'
                    : 'Ministry is required.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $blog = Blog::query()->create([
            'title' => $validated['title'],
            'slug' => $this->uniqueSlug($validated['title']),
            'banner_image' => MediaManager::store($request->file('banner_image'), 'media/blogs'),
            'content' => $validated['content'],
            'ministry_id' => $ministry->id,
            'publisher_id' => $actor->id,
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->ok(ResourcePresenter::blog($blog->fresh(['ministry', 'publisher'])), 'Blog created.', Response::HTTP_CREATED);
    }

    public function show(Blog $blog)
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($blog->is_deleted) {
            return $this->fail('Blog not found.', Response::HTTP_NOT_FOUND);
        }
        if ($actor->role_name === 'author' && $blog->publisher_id !== $actor->id) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        return $this->ok(ResourcePresenter::blog($blog->load(['ministry', 'publisher'])), 'Blog retrieved.');
    }

    public function update(Request $request, Blog $blog)
    {
        if ($this->isUnsupportedMultipartPatch($request)) {
            return $this->fail(
                'Use POST /api/v1/admin/blogs/{blog} for multipart blog updates. PHP does not reliably parse multipart PATCH requests.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $this->normalizePublishInput($request);

        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($blog->is_deleted) {
            return $this->fail('Blog not found.', Response::HTTP_NOT_FOUND);
        }
        if ($actor->role_name === 'author' && $blog->publisher_id !== $actor->id) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'ministry_id' => ['nullable'],
            'is_published' => ['nullable', 'boolean'],
            'banner_image' => UploadRules::image(),
        ]);

        if (array_key_exists('title', $validated) && $validated['title'] !== $blog->title) {
            $blog->slug = $this->uniqueSlug($validated['title'], $blog->id);
        }

        if ($actor->role_name === 'author') {
            $ministry = $this->resolveBlogMinistry($actor, null);
            if (! $ministry instanceof Ministry) {
                return $this->fail('Author accounts require an assigned ministry before updating blogs.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $blog->ministry_id = $ministry->id;
        } elseif (array_key_exists('ministry_id', $validated)) {
            $ministry = $this->resolveBlogMinistry($actor, $validated['ministry_id']);
            if (! $ministry instanceof Ministry) {
                return $this->fail('Ministry not found.', Response::HTTP_NOT_FOUND);
            }

            $blog->ministry_id = $ministry->id;
        }

        if (array_key_exists('title', $validated)) {
            $blog->title = $validated['title'];
        }
        if (array_key_exists('content', $validated)) {
            $blog->content = $validated['content'];
        }
        if (array_key_exists('is_published', $validated)) {
            $blog->is_published = (bool) $validated['is_published'];
        }
        if ($request->hasFile('banner_image')) {
            $blog->banner_image = MediaManager::store($request->file('banner_image'), 'media/blogs', $blog->banner_image);
        }
        if (array_key_exists('is_published', $validated)) {
            $blog->published_at = (bool) $validated['is_published'] ? now() : null;
        }
        $blog->updated_at = now();
        $blog->save();

        return $this->ok(ResourcePresenter::blog($blog->fresh(['ministry', 'publisher'])), 'Blog updated.');
    }

    public function destroy(Blog $blog)
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($actor->role_name === 'author' && $blog->publisher_id !== $actor->id) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $blog->update(['is_deleted' => true, 'deleted_at' => now(), 'updated_at' => now()]);
        Log::notice('blog.soft_deleted', [
            'actor_id' => $actor->id,
            'blog_id' => $blog->id,
        ]);

        return $this->ok(['deleted' => true], 'Blog moved to trash.');
    }

    public function trash()
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $query = Blog::query()
            ->with(['ministry', 'publisher'])
            ->where('is_deleted', true)
            ->orderByDesc('deleted_at')
            ->orderByDesc('updated_at');

        if ($actor->role_name === 'author') {
            $query->where('publisher_id', $actor->id);
        }

        $items = $query->get()->map(fn (Blog $blog) => ResourcePresenter::blog($blog))->all();

        return $this->ok($items, 'Blog trash retrieved.');
    }

    public function restore(Blog $blog)
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($actor->role_name === 'author' && $blog->publisher_id !== $actor->id) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $blog->update([
            'is_deleted' => false,
            'deleted_at' => null,
            'updated_at' => now(),
        ]);
        Log::info('blog.restored', [
            'actor_id' => $actor->id,
            'blog_id' => $blog->id,
        ]);

        return $this->ok(ResourcePresenter::blog($blog->fresh(['ministry', 'publisher'])), 'Blog restored from trash.');
    }

    public function forceDelete(Blog $blog)
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        MediaManager::delete($blog->banner_image);
        $blog->delete();
        Log::notice('blog.force_deleted', [
            'actor_id' => $actor->id,
            'blog_id' => $blog->id,
        ]);

        return $this->ok(['deleted' => true], 'Blog permanently deleted.');
    }

    public function uploadImage(Request $request)
    {
        if (! $this->actorHasRole('admin', 'manager', 'author')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'upload' => UploadRules::requiredImage(),
        ]);

        $path = MediaManager::store($request->file('upload'), 'media/editor');

        return $this->ok([
            'url' => MediaManager::url($path),
            'path' => $path,
            'upload' => $validated['upload']->getClientOriginalName(),
        ], 'Image uploaded.', Response::HTTP_CREATED);
    }

    private function uniqueSlug(string $title, ?string $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $counter = 1;

        while (Blog::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function normalizePublishInput(Request $request): void
    {
        if (! $request->has('is_published') && $request->has('iss_published')) {
            $request->merge([
                'is_published' => $request->input('iss_published'),
            ]);
        }

        if ($request->has('is_published')) {
            $request->merge([
                'is_published' => $request->boolean('is_published'),
            ]);
        }
    }

    private function isUnsupportedMultipartPatch(Request $request): bool
    {
        $contentType = (string) $request->header('Content-Type', '');

        return in_array($request->method(), ['PATCH', 'PUT'], true)
            && str_contains(strtolower($contentType), 'multipart/form-data');
    }

    private function resolveBlogMinistry(object $actor, mixed $requestedMinistryId): ?Ministry
    {
        if (($actor->role_name ?? null) === 'author') {
            return $actor->ministry_id ? Ministry::query()->find($actor->ministry_id) : null;
        }

        if ($requestedMinistryId === null || $requestedMinistryId === '') {
            return null;
        }

        $ministry = ModelLookup::find(Ministry::class, $requestedMinistryId);

        return $ministry instanceof Ministry ? $ministry : null;
    }
}
