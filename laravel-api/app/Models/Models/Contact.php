<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasPublicUuid;

    protected $table = 'contacts';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'legacy_id',
        'name',
        'email',
        'number',
        'message',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
