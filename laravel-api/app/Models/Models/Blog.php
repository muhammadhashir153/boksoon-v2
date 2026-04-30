<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blog extends Model
{
    use HasPublicUuid;

    protected $table = 'blogs';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'slug',
        'title',
        'banner_image',
        'content',
        'ministry_id',
        'publisher_id',
        'is_published',
        'published_at',
        'is_deleted',
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_deleted' => 'boolean',
        'published_at' => 'datetime',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function ministry(): BelongsTo
    {
        return $this->belongsTo(Ministry::class, 'ministry_id');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'publisher_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'blog_id');
    }
}
