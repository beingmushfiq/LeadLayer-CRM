<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('loggable_type', 100);
            $table->unsignedBigInteger('loggable_id');
            $table->string('action', 50);
            $table->string('description', 500)->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['tenant_id', 'created_at'], 'idx_activity_tenant');
            $table->index(['tenant_id', 'loggable_type', 'loggable_id'], 'idx_activity_loggable');
        });

        Schema::create('lead_assignment_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->enum('strategy', ['round_robin', 'load_balanced', 'manual'])->default('round_robin');
            $table->json('eligible_user_ids');
            $table->unsignedInteger('last_assigned_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('tenant_id', 'idx_lar_tenant');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_assignment_rules');
        Schema::dropIfExists('activity_logs');
    }
};
