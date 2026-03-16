<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('notable_type', 100); // polymorphic
            $table->unsignedBigInteger('notable_id');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['manual', 'ai_summary', 'call_log', 'system'])->default('manual');
            $table->string('title', 255)->nullable();
            $table->text('content');
            $table->string('ai_model', 50)->nullable();   // future AI integration
            $table->string('ai_source_ref', 255)->nullable(); // future AI integration
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'notable_type', 'notable_id'], 'idx_notes_notable');
            $table->index(['tenant_id', 'author_id'], 'idx_notes_author');
            $table->index(['tenant_id', 'type'], 'idx_notes_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
