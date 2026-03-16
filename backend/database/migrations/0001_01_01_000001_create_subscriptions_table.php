<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained('tenants')->cascadeOnDelete();
            $table->enum('plan', ['starter', 'professional', 'enterprise']);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('BDT');
            $table->enum('status', ['active', 'pending', 'failed', 'cancelled']);
            $table->string('sslcommerz_transaction_id', 255)->nullable();
            $table->string('sslcommerz_session_key', 255)->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamp('renewed_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_subscriptions_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
