<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    use HasPublicUuid;

    protected $table = 'books';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'title',
        'slug',
        'cover_image',
        'description',
        'link_url',
        'link_label',
        'language',
        'author_name',
        'sort_order',
        'is_published',
        'is_deleted',
        'added_by',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_published' => 'boolean',
        'is_deleted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'added_by');
    }
}
