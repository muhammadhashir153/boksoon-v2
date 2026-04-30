<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Donation extends Model
{
    use HasPublicUuid;

    protected $table = 'donations';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'target_amount',
        'raised_amount',
        'admin_id',
        'placeholder',
        'is_deleted',
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'target_amount' => 'decimal:2',
        'raised_amount' => 'decimal:2',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'admin_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'donation_id');
    }
}
