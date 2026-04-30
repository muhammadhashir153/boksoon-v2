<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasPublicUuid;

    protected $table = 'comments';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'blog_id',
        'name',
        'email',
        'message',
        'is_verified',
        'is_published',
        'verification_token',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_published' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class, 'blog_id');
    }
}
