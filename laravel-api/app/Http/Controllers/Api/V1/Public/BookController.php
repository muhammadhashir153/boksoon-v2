<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\V1\ApiController;
use App\Models\Models\Book;
use App\Support\ResourcePresenter;
use Symfony\Component\HttpFoundation\Response;

class BookController extends ApiController
{
    public function index()
    {
        $books = Book::query()
            ->with('author')
            ->where('is_published', true)
            ->where('is_deleted', false)
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Book $book) => ResourcePresenter::book($book))
            ->all();

        return $this->ok($books, 'Books retrieved.');
    }

    public function show(Book $book)
    {
        if ($book->is_deleted || ! $book->is_published) {
            return $this->fail('Book not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->ok(ResourcePresenter::book($book->load('author')), 'Book retrieved.');
    }
}
