<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('taskable_type', 100)->nullable();
            $table->unsignedBigInteger('taskable_id')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->dateTime('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'assigned_to', 'status'], 'idx_tasks_tenant_assigned');
            $table->index(['tenant_id', 'due_date'], 'idx_tasks_due');
            $table->index(['tenant_id', 'taskable_type', 'taskable_id'], 'idx_tasks_taskable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
