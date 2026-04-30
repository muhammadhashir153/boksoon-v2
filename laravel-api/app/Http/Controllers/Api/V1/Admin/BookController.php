<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Book;
use App\Support\MediaManager;
use App\Support\ResourcePresenter;
use App\Support\UploadRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class BookController extends ApiController
{
    public function index()
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $items = Book::query()
            ->with('author')
            ->where('is_deleted', false)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Book $book) => ResourcePresenter::book($book))
            ->all();

        return $this->ok($items, 'Books retrieved.');
    }

    public function store(Request $request)
    {
        $this->normalizePublishInput($request);

        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'link_url' => ['required', 'url'],
            'link_label' => ['nullable', 'string', 'max:255'],
            'language' => ['nullable', 'string', 'max:100'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['nullable', 'boolean'],
            'cover_image' => UploadRules::image(),
        ]);

        $book = Book::query()->create([
            'title' => $validated['title'],
            'slug' => $this->uniqueSlug($validated['title']),
            'cover_image' => MediaManager::store($request->file('cover_image'), 'media/books'),
            'description' => $validated['description'],
            'link_url' => $validated['link_url'],
            'link_label' => trim((string) ($validated['link_label'] ?? '')) ?: 'Check Out on Amazon',
            'language' => $validated['language'] ?? null,
            'author_name' => trim((string) ($validated['author_name'] ?? '')) ?: 'Boksoon Kim',
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'is_deleted' => false,
            'added_by' => $this->actor()?->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->ok(ResourcePresenter::book($book->fresh('author')), 'Book created.', Response::HTTP_CREATED);
    }

    public function show(Book $book)
    {
        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($book->is_deleted) {
            return $this->fail('Book not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->ok(ResourcePresenter::book($book->load('author')), 'Book retrieved.');
    }

    public function update(Request $request, Book $book)
    {
        if ($this->isUnsupportedMultipartPatch($request)) {
            return $this->fail(
                'Use POST /api/v1/admin/books/{book} for multipart book updates. PHP does not reliably parse multipart PATCH requests.',
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $this->normalizePublishInput($request);

        if (! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($book->is_deleted) {
            return $this->fail('Book not found.', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'link_url' => ['sometimes', 'required', 'url'],
            'link_label' => ['nullable', 'string', 'max:255'],
            'language' => ['nullable', 'string', 'max:100'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['nullable', 'boolean'],
            'cover_image' => UploadRules::image(),
        ]);

        if (array_key_exists('title', $validated) && $validated['title'] !== $book->title) {
            $book->slug = $this->uniqueSlug($validated['title'], $book->id);
        }

        if (array_key_exists('title', $validated)) {
            $book->title = $validated['title'];
        }
        if (array_key_exists('description', $validated)) {
            $book->description = $validated['description'];
        }
        if (array_key_exists('link_url', $validated)) {
            $book->link_url = $validated['link_url'];
        }
        if (array_key_exists('link_label', $validated)) {
            $book->link_label = trim((string) $validated['link_label']) ?: 'Check Out on Amazon';
        }
        if (array_key_exists('language', $validated)) {
            $book->language = $validated['language'];
        }
        if (array_key_exists('author_name', $validated)) {
            $book->author_name = trim((string) $validated['author_name']) ?: 'Boksoon Kim';
        }
        if (array_key_exists('sort_order', $validated)) {
            $book->sort_order = (int) $validated['sort_order'];
        }
        if (array_key_exists('is_published', $validated)) {
            $book->is_published = (bool) $validated['is_published'];
        }
        $book->updated_at = now();

        if ($request->hasFile('cover_image')) {
            $book->cover_image = MediaManager::store($request->file('cover_image'), 'media/books', $book->cover_image);
        }

        $book->save();

        return $this->ok(ResourcePresenter::book($book->fresh('author')), 'Book updated.');
    }

    public function destroy(Book $book)
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $book->update([
            'is_deleted' => true,
            'deleted_at' => now(),
            'updated_at' => now(),
        ]);
        Log::notice('book.soft_deleted', [
            'actor_id' => $actor->id,
            'book_id' => $book->id,
        ]);

        return $this->ok(['deleted' => true], 'Book moved to trash.');
    }

    public function trash()
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $query = Book::query()
            ->with('author')
            ->where('is_deleted', true)
            ->orderByDesc('deleted_at')
            ->orderByDesc('updated_at');

        if ($actor->role_name === 'reviwer') {
            $query->where('added_by', $actor->id);
        }

        $items = $query->get()->map(fn (Book $book) => ResourcePresenter::book($book))->all();

        return $this->ok($items, 'Book trash retrieved.');
    }

    public function restore(Book $book)
    {
        $actor = $this->actor();
        if (! $actor || ! $this->actorHasRole('admin', 'manager', 'reviwer')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }
        if ($actor->role_name === 'reviwer' && $book->added_by !== $actor->id) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        $book->update([
            'is_deleted' => false,
            'deleted_at' => null,
            'updated_at' => now(),
        ]);
        Log::info('book.restored', [
            'actor_id' => $actor->id,
            'book_id' => $book->id,
        ]);

        return $this->ok(ResourcePresenter::book($book->fresh('author')), 'Book restored from trash.');
    }

    public function forceDelete(Book $book)
    {
        if (! $this->actorHasRole('admin', 'manager')) {
            return $this->fail('Forbidden.', Response::HTTP_FORBIDDEN);
        }

        MediaManager::delete($book->cover_image);
        $book->delete();
        Log::notice('book.force_deleted', [
            'actor_id' => $this->actor()?->id,
            'book_id' => $book->id,
        ]);

        return $this->ok(['deleted' => true], 'Book permanently deleted.');
    }

    private function uniqueSlug(string $title, ?string $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'book';
        $slug = $base;
        $counter = 1;

        while (Book::query()
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
}
