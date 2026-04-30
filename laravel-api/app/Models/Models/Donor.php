<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Donor extends Model
{
    use HasPublicUuid;

    protected $table = 'donors';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'name',
        'email',
        'phone_number',
        'address',
        'is_hidden',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'donor_id');
    }
}
