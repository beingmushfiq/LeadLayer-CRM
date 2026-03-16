<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 100)->unique();
            $table->string('domain', 255)->nullable()->unique();
            $table->string('logo_url', 500)->nullable();
            $table->string('timezone', 50)->default('UTC');
            $table->enum('subscription_plan', ['free_trial', 'starter', 'professional', 'enterprise'])->default('free_trial');
            $table->enum('subscription_status', ['active', 'past_due', 'cancelled', 'trialing'])->default('trialing');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('subscription_status', 'idx_tenants_subscription_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
