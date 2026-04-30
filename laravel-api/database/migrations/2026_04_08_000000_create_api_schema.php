<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('name')->unique();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('ministry', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('name')->unique();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('admin', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('dp')->nullable();
            $table->string('pass');
            $table->uuid('role');
            $table->uuid('ministry_id')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('role')->references('id')->on('roles')->restrictOnDelete();
            $table->foreign('ministry_id')->references('id')->on('ministry')->nullOnDelete();
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('title');
            $table->longText('description');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('target_amount', 12, 2);
            $table->decimal('raised_amount', 12, 2)->default(0);
            $table->uuid('admin_id')->nullable();
            $table->string('placeholder')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('admin_id')->references('id')->on('admin')->nullOnDelete();
        });

        Schema::create('donors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone_number')->nullable();
            $table->text('address');
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('blogs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('banner_image')->nullable();
            $table->longText('content');
            $table->uuid('ministry_id');
            $table->uuid('publisher_id')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('ministry_id')->references('id')->on('ministry')->restrictOnDelete();
            $table->foreign('publisher_id')->references('id')->on('admin')->nullOnDelete();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('cover_image')->nullable();
            $table->mediumText('description');
            $table->text('link_url');
            $table->string('link_label')->default('Check Out on Amazon');
            $table->string('language', 100)->nullable();
            $table->string('author_name')->default('Boksoon Kim');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->boolean('is_deleted')->default(false);
            $table->uuid('added_by')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('deleted_at')->nullable();

            $table->foreign('added_by')->references('id')->on('admin')->nullOnDelete();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->uuid('blog_id');
            $table->string('name');
            $table->string('email');
            $table->text('message');
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_published')->default(true);
            $table->string('verification_token')->nullable()->unique();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('blog_id')->references('id')->on('blogs')->cascadeOnDelete();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('reviewer_name');
            $table->text('review');
            $table->uuid('added_by')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('added_by')->references('id')->on('admin')->nullOnDelete();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('name');
            $table->string('email');
            $table->string('number')->nullable();
            $table->text('message');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('newsletter', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->string('email')->unique();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->uuid('donor_id');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 50)->default('online');
            $table->uuid('donation_id');
            $table->string('last_four', 4)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('status', 20)->default('pending');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('donor_id')->references('id')->on('donors')->restrictOnDelete();
            $table->foreign('donation_id')->references('id')->on('donations')->restrictOnDelete();
            $table->index(['donation_id', 'status']);
            $table->index(['donor_id', 'created_at']);
        });

        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('admin_uuid');
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->foreign('admin_uuid')->references('id')->on('admin')->cascadeOnDelete();
            $table->index(['admin_uuid', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('newsletter');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('books');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('donors');
        Schema::dropIfExists('donations');
        Schema::dropIfExists('admin');
        Schema::dropIfExists('ministry');
        Schema::dropIfExists('roles');
    }
};
