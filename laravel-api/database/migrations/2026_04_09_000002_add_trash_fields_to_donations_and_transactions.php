<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            if (! Schema::hasColumn('donations', 'is_deleted')) {
                $table->boolean('is_deleted')->default(false)->after('placeholder');
            }
            if (! Schema::hasColumn('donations', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('is_deleted');
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'is_deleted')) {
                $table->boolean('is_deleted')->default(false)->after('status');
            }
            if (! Schema::hasColumn('transactions', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('is_deleted');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'deleted_at')) {
                $table->dropColumn('deleted_at');
            }
            if (Schema::hasColumn('transactions', 'is_deleted')) {
                $table->dropColumn('is_deleted');
            }
        });

        Schema::table('donations', function (Blueprint $table) {
            if (Schema::hasColumn('donations', 'deleted_at')) {
                $table->dropColumn('deleted_at');
            }
            if (Schema::hasColumn('donations', 'is_deleted')) {
                $table->dropColumn('is_deleted');
            }
        });
    }
};
