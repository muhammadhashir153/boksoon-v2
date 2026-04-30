<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasPublicUuid;

    protected $table = 'transactions';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'donor_id',
        'amount',
        'payment_method',
        'donation_id',
        'last_four',
        'currency',
        'status',
        'is_deleted',
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function donor(): BelongsTo
    {
        return $this->belongsTo(Donor::class, 'donor_id');
    }

    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class, 'donation_id');
    }
}
