<?php

namespace App\Models\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasPublicUuid;

    protected $table = 'roles';

    public $timestamps = false;

    protected $fillable = ['id', 'legacy_id', 'name', 'created_at', 'updated_at'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(AdminUser::class, 'role');
    }
}
