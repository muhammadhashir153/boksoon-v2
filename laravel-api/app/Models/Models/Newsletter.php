<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class Newsletter extends Model
{
    use HasPublicUuid;

    protected $table = 'newsletter';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'email',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
