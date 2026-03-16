<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('subscription_id')->constrained('subscriptions')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('BDT');
            $table->enum('status', ['success', 'failed', 'refunded']);
            $table->string('sslcommerz_transaction_id', 255);
            $table->string('sslcommerz_val_id', 255)->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('tenant_id', 'idx_payment_tenant');
            $table->index('sslcommerz_transaction_id', 'idx_payment_transaction');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_histories');
    }
};
