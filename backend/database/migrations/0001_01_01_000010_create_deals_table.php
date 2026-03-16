<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('pipeline_id')->constrained('pipelines')->cascadeOnDelete();
            $table->foreignId('stage_id')->constrained('pipeline_stages')->restrictOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->string('title', 255);
            $table->decimal('value', 15, 2)->default(0);
            $table->string('currency', 3)->default('BDT');
            $table->decimal('probability', 5, 2)->nullable();
            $table->date('expected_close_date')->nullable();
            $table->date('actual_close_date')->nullable();
            $table->enum('status', ['open', 'won', 'lost'])->default('open');
            $table->string('loss_reason', 255)->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'pipeline_id'], 'idx_deals_tenant_pipeline');
            $table->index(['stage_id', 'position'], 'idx_deals_stage');
            $table->index(['tenant_id', 'assigned_to'], 'idx_deals_assigned');
            $table->index(['tenant_id', 'status'], 'idx_deals_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
