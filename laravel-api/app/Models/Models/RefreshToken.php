<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasPublicUuid;

    protected $table = 'refresh_tokens';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'admin_uuid',
        'token_hash',
        'expires_at',
        'revoked_at',
        'created_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'admin_uuid', 'id');
    }
}
