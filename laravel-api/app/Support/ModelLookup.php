<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;

final class ModelLookup
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    public static function find(string $modelClass, string|int|null $value): ?Model
    {
        if ($value === null || $value === '') {
            return null;
        }

        $query = $modelClass::query();

        if (is_numeric($value)) {
            return $query->where('legacy_id', (int) $value)->first();
        }

        return $query->find((string) $value);
    }
}
