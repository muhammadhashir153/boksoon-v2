<?php

namespace App\Support;

use App\Models\Models\AdminUser;
use App\Models\Models\Blog;
use App\Models\Models\Book;
use App\Models\Models\Comment;
use App\Models\Models\Contact;
use App\Models\Models\Donation;
use App\Models\Models\Donor;
use App\Models\Models\Ministry;
use App\Models\Models\Newsletter;
use App\Models\Models\Role;
use App\Models\Models\Testimonial;
use App\Models\Models\Transaction;
use Carbon\CarbonInterface;

final class ResourcePresenter
{
    public static function user(AdminUser $user): array
    {
        return [
            'id' => $user->id,
            'legacy_id' => $user->legacy_id,
            'name' => $user->name,
            'email' => $user->email,
            'dp' => $user->dp,
            'dp_url' => MediaManager::url($user->dp),
            'role' => $user->roleRecord?->id,
            'role_name' => $user->role_name,
            'is_verified' => (bool) $user->is_verified,
            'ministry_id' => $user->ministry?->id,
            'ministry' => $user->ministry?->name,
        ];
    }

    public static function role(Role $role): array
    {
        return ['id' => $role->id, 'legacy_id' => $role->legacy_id, 'name' => $role->name];
    }

    public static function ministry(Ministry $ministry): array
    {
        return ['id' => $ministry->id, 'legacy_id' => $ministry->legacy_id, 'name' => $ministry->name];
    }

    public static function donation(Donation $donation): array
    {
        return [
            'id' => $donation->id,
            'legacy_id' => $donation->legacy_id,
            'title' => $donation->title,
            'description' => $donation->description,
            'start_date' => optional($donation->start_date)->toDateString(),
            'end_date' => optional($donation->end_date)->toDateString(),
            'target_amount' => (float) $donation->target_amount,
            'raised_amount' => (float) $donation->raised_amount,
            'admin_id' => $donation->admin?->id,
            'admin_name' => $donation->admin?->name,
            'placeholder' => $donation->placeholder,
            'placeholder_url' => MediaManager::url($donation->placeholder),
            'is_deleted' => (bool) $donation->is_deleted,
            'deleted_at' => self::iso8601($donation->deleted_at),
        ];
    }

    public static function blog(Blog $blog): array
    {
        return [
            'id' => $blog->id,
            'legacy_id' => $blog->legacy_id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'banner_image' => $blog->banner_image,
            'banner_image_url' => MediaManager::url($blog->banner_image),
            'content' => $blog->content,
            'published_at' => self::iso8601($blog->published_at),
            'created_at' => self::iso8601($blog->created_at),
            'updated_at' => self::iso8601($blog->updated_at),
            'is_deleted' => (bool) $blog->is_deleted,
            'deleted_at' => self::iso8601($blog->deleted_at),
            'is_published' => (bool) $blog->is_published,
            'ministry_id' => $blog->ministry?->id,
            'ministry_name' => $blog->ministry?->name,
            'publisher_id' => $blog->publisher?->id,
            'publisher_name' => $blog->publisher?->name,
        ];
    }

    public static function book(Book $book): array
    {
        return [
            'id' => $book->id,
            'legacy_id' => $book->legacy_id,
            'title' => $book->title,
            'slug' => $book->slug,
            'cover_image' => $book->cover_image,
            'cover_image_url' => MediaManager::url($book->cover_image),
            'description' => $book->description,
            'link_url' => $book->link_url,
            'link_label' => $book->link_label,
            'language' => $book->language,
            'author_name' => $book->author_name,
            'sort_order' => (int) $book->sort_order,
            'is_published' => (bool) $book->is_published,
            'is_deleted' => (bool) $book->is_deleted,
            'added_by' => $book->author?->id,
            'added_by_name' => $book->author?->name,
            'created_at' => self::iso8601($book->created_at),
            'updated_at' => self::iso8601($book->updated_at),
            'deleted_at' => self::iso8601($book->deleted_at),
        ];
    }

    public static function comment(Comment $comment, bool $includeEmail = false): array
    {
        return [
            'id' => $comment->id,
            'legacy_id' => $comment->legacy_id,
            'blog_id' => $comment->blog?->id,
            'blog_title' => $comment->blog?->title,
            'blog_slug' => $comment->blog?->slug,
            'name' => $comment->name,
            'email' => $includeEmail ? $comment->email : null,
            'message' => $comment->message,
            'is_verified' => (bool) $comment->is_verified,
            'is_published' => (bool) $comment->is_published,
            'created_at' => self::iso8601($comment->created_at),
            'updated_at' => self::iso8601($comment->updated_at),
        ];
    }

    public static function donor(Donor $donor): array
    {
        return [
            'id' => $donor->id,
            'legacy_id' => $donor->legacy_id,
            'name' => $donor->name,
            'email' => $donor->email,
            'phone_number' => $donor->phone_number,
            'address' => $donor->address,
            'is_hidden' => (bool) $donor->is_hidden,
        ];
    }

    public static function transaction(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'legacy_id' => $transaction->legacy_id,
            'donor_id' => $transaction->donor?->id,
            'donation_id' => $transaction->donation?->id,
            'amount' => (float) $transaction->amount,
            'payment_method' => $transaction->payment_method,
            'last_four' => $transaction->last_four,
            'currency' => $transaction->currency,
            'status' => $transaction->status,
            'is_deleted' => (bool) $transaction->is_deleted,
            'deleted_at' => self::iso8601($transaction->deleted_at),
            'created_at' => self::iso8601($transaction->created_at),
            'updated_at' => self::iso8601($transaction->updated_at),
            'donor_name' => $transaction->donor?->name,
            'donor_email' => $transaction->donor?->email,
            'phone_number' => $transaction->donor?->phone_number,
            'address' => $transaction->donor?->address,
            'is_hidden' => $transaction->donor?->is_hidden,
            'donation_title' => $transaction->donation?->title,
            'donation_placeholder' => $transaction->donation?->placeholder,
            'donation_placeholder_url' => MediaManager::url($transaction->donation?->placeholder),
        ];
    }

    public static function testimonial(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->id,
            'legacy_id' => $testimonial->legacy_id,
            'reviewer_name' => $testimonial->reviewer_name,
            'review' => $testimonial->review,
            'added_by' => $testimonial->author?->id,
            'added_by_name' => $testimonial->author?->name,
            'created_at' => self::iso8601($testimonial->created_at),
            'updated_at' => self::iso8601($testimonial->updated_at),
        ];
    }

    public static function contact(Contact $contact): array
    {
        return [
            'id' => $contact->id,
            'legacy_id' => $contact->legacy_id,
            'name' => $contact->name,
            'email' => $contact->email,
            'number' => $contact->number,
            'message' => $contact->message,
            'created_at' => self::iso8601($contact->created_at),
        ];
    }

    public static function newsletter(Newsletter $newsletter): array
    {
        return [
            'id' => $newsletter->id,
            'legacy_id' => $newsletter->legacy_id,
            'email' => $newsletter->email,
            'created_at' => self::iso8601($newsletter->created_at),
        ];
    }

    private static function iso8601(?CarbonInterface $value): ?string
    {
        return $value?->copy()->utc()->format('Y-m-d\TH:i:s\Z');
    }
}
