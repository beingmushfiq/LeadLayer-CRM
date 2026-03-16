<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('google_event_id', 255)->nullable();
            $table->string('google_calendar_id', 255)->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('location', 255)->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('is_all_day')->default(false);
            $table->string('recurrence_rule', 255)->nullable();
            $table->string('eventable_type', 100)->nullable();
            $table->unsignedBigInteger('eventable_id')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'error', 'local_only'])->default('local_only');
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'user_id'], 'idx_cal_tenant_user');
            $table->index('google_event_id', 'idx_cal_google_event');
            $table->index(['tenant_id', 'starts_at', 'ends_at'], 'idx_cal_dates');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
