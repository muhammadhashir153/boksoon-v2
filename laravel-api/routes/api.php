<?php

use App\Http\Controllers\Api\V1\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Api\V1\Admin\BookController as AdminBookController;
use App\Http\Controllers\Api\V1\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Api\V1\Admin\ContactController as AdminContactController;
use App\Http\Controllers\Api\V1\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Api\V1\Admin\DonorController as AdminDonorController;
use App\Http\Controllers\Api\V1\Admin\MinistryController as AdminMinistryController;
use App\Http\Controllers\Api\V1\Admin\NewsletterController as AdminNewsletterController;
use App\Http\Controllers\Api\V1\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\V1\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Api\V1\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Public\BlogController;
use App\Http\Controllers\Api\V1\Public\BookController;
use App\Http\Controllers\Api\V1\Public\CommentController;
use App\Http\Controllers\Api\V1\Public\ContactController;
use App\Http\Controllers\Api\V1\Public\DonationController;
use App\Http\Controllers\Api\V1\Public\MinistryController;
use App\Http\Controllers\Api\V1\Public\NewsletterController;
use App\Http\Controllers\Api\V1\Public\TransactionController as PublicTransactionController;
use App\Http\Controllers\Api\V1\Public\TestimonialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => response()->json([
        'success' => true,
        'message' => 'API is healthy.',
        'data' => ['status' => 'ok'],
    ]));

    Route::prefix('auth')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth-api');
        Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:auth-api');
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth.jwt');
        Route::get('/me', [AuthController::class, 'me'])->middleware('auth.jwt');
        Route::post('/profile', [AuthController::class, 'updateProfile'])->middleware('auth.jwt');
        Route::patch('/profile', [AuthController::class, 'updateProfile'])->middleware('auth.jwt');
        Route::patch('/password', [AuthController::class, 'updatePassword'])->middleware('auth.jwt');
    });

    Route::get('/verify-email/{token}', [AuthController::class, 'verifyEmail']);

    Route::get('/donations', [DonationController::class, 'index']);
    Route::get('/donations/{donation}', [DonationController::class, 'show']);

    Route::get('/ministries', [MinistryController::class, 'index']);
    Route::get('/ministries/{ministry}', [MinistryController::class, 'show']);

    Route::get('/blogs', [BlogController::class, 'index']);
    Route::get('/blogs/{blog}', [BlogController::class, 'show']);
    Route::get('/blogs/slug/{slug}', [BlogController::class, 'showBySlug']);

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{book}', [BookController::class, 'show']);

    Route::get('/blogs/{blog}/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store'])->middleware('throttle:public-api');
    Route::get('/comments/verify/{token}', [CommentController::class, 'verify'])->middleware('throttle:public-api');

    Route::post('/contacts', [ContactController::class, 'store'])->middleware('throttle:public-api');
    Route::post('/newsletters', [NewsletterController::class, 'store'])->middleware('throttle:public-api');
    Route::post('/transactions', [PublicTransactionController::class, 'store'])->middleware('throttle:public-api');
    Route::get('/testimonials', [TestimonialController::class, 'index']);

    Route::middleware(['auth.jwt', 'throttle:admin-api'])->prefix('admin')->group(function (): void {
        Route::middleware('role:admin')->group(function (): void {
            Route::apiResource('users', AdminUserController::class);
            Route::patch('users/{user}/password', [AdminUserController::class, 'updatePassword']);
            Route::apiResource('roles', AdminRoleController::class);
            Route::apiResource('ministries', AdminMinistryController::class);
        });

        Route::middleware('role:admin,manager')->group(function (): void {
            Route::apiResource('donors', AdminDonorController::class);
            Route::get('transactions/trash', [AdminTransactionController::class, 'trash']);
            Route::post('transactions/{transaction}/restore', [AdminTransactionController::class, 'restore']);
            Route::delete('transactions/{transaction}/purge', [AdminTransactionController::class, 'forceDelete']);
            Route::apiResource('transactions', AdminTransactionController::class);
            Route::get('donations/trash', [AdminDonationController::class, 'trash']);
            Route::post('donations/{donation}/restore', [AdminDonationController::class, 'restore']);
            Route::delete('donations/{donation}/purge', [AdminDonationController::class, 'forceDelete']);
            Route::post('donations/{donation}', [AdminDonationController::class, 'update']);
            Route::apiResource('donations', AdminDonationController::class);
            Route::apiResource('contacts', AdminContactController::class)->only(['index', 'show']);
            Route::apiResource('newsletters', AdminNewsletterController::class)->only(['index', 'show']);
        });

        Route::middleware('role:admin,manager,reviwer')->group(function (): void {
            Route::apiResource('testimonials', AdminTestimonialController::class);
            Route::apiResource('comments', AdminCommentController::class)->only(['index', 'show', 'update', 'destroy']);
            Route::get('books/trash', [AdminBookController::class, 'trash']);
            Route::post('books/{book}/restore', [AdminBookController::class, 'restore']);
            Route::delete('books/{book}/purge', [AdminBookController::class, 'forceDelete']);
            Route::post('books/{book}', [AdminBookController::class, 'update']);
            Route::apiResource('books', AdminBookController::class);
        });

        Route::middleware('role:admin,manager,author')->group(function (): void {
            Route::post('blogs/upload-image', [AdminBlogController::class, 'uploadImage']);
            Route::get('blogs/trash', [AdminBlogController::class, 'trash']);
            Route::post('blogs/{blog}/restore', [AdminBlogController::class, 'restore']);
            Route::delete('blogs/{blog}/purge', [AdminBlogController::class, 'forceDelete']);
            Route::post('blogs/{blog}', [AdminBlogController::class, 'update']);
            Route::apiResource('blogs', AdminBlogController::class);
        });
    });
});
