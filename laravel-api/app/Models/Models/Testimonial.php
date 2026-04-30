<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasPublicUuid;

    protected $table = 'testimonials';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'reviewer_name',
        'review',
        'added_by',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'added_by');
    }
}
