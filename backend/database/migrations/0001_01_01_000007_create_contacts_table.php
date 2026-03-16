<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('whatsapp_number', 20)->nullable();
            $table->string('job_title', 100)->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('source', ['manual', 'whatsapp', 'web_form', 'import', 'referral', 'email', 'other'])->default('manual');
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id', 'idx_contacts_tenant');
            $table->index(['tenant_id', 'account_id'], 'idx_contacts_account');
            $table->index(['tenant_id', 'whatsapp_number'], 'idx_contacts_whatsapp');
            $table->index(['tenant_id', 'email'], 'idx_contacts_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
