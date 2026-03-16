<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('whatsapp_number', 20)->nullable();
            $table->string('company_name', 255)->nullable();
            $table->string('job_title', 100)->nullable();
            $table->enum('status', ['pending', 'new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'])->default('new');
            $table->enum('source', ['manual', 'whatsapp', 'web_form', 'import', 'referral', 'email_campaign', 'other'])->default('manual');
            $table->unsignedInteger('lead_score')->default(0);
            $table->json('score_breakdown')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('converted_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id', 'idx_leads_tenant');
            $table->index(['tenant_id', 'status'], 'idx_leads_status');
            $table->index(['tenant_id', 'assigned_to'], 'idx_leads_assigned');
            $table->index(['tenant_id', 'whatsapp_number'], 'idx_leads_whatsapp');
            $table->index(['tenant_id', 'lead_score'], 'idx_leads_score');
            $table->index(['tenant_id', 'source'], 'idx_leads_source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
