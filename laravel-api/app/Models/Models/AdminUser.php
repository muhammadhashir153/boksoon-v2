<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class AdminUser extends Authenticatable
{
    use HasPublicUuid;

    protected $table = 'admin';

    public $timestamps = false;

    protected $hidden = ['pass', 'verification_token'];

    protected $fillable = [
        'id',
        'legacy_id',
        'name',
        'email',
        'dp',
        'pass',
        'role',
        'ministry_id',
        'created_at',
        'updated_at',
        'verification_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function roleRecord(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role');
    }

    public function ministry(): BelongsTo
    {
        return $this->belongsTo(Ministry::class, 'ministry_id');
    }

    public function blogs(): HasMany
    {
        return $this->hasMany(Blog::class, 'publisher_id');
    }

    protected function roleName(): Attribute
    {
        return Attribute::get(fn () => $this->roleRecord?->name);
    }

    public function getAuthPassword(): string
    {
        return (string) $this->pass;
    }
}
