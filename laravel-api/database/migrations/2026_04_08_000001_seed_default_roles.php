<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['admin', 'manager', 'author', 'reviwer'] as $roleName) {
            if (DB::table('roles')->where('name', $roleName)->exists()) {
                continue;
            }

            DB::table('roles')->insert([
                'id' => (string) Str::orderedUuid(),
                'name' => $roleName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('roles')->whereIn('name', ['admin', 'manager', 'author', 'reviwer'])->delete();
    }
};
