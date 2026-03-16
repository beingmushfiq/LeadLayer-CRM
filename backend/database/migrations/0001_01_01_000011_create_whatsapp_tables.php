<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained('tenants')->cascadeOnDelete();
            $table->string('phone_number_id', 100);
            $table->string('waba_id', 100);
            $table->text('access_token'); // encrypted
            $table->string('webhook_verify_token', 255);
            $table->boolean('auto_reply_enabled')->default(true);
            $table->text('auto_reply_template')->nullable();
            $table->boolean('auto_create_lead')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('phone_number_id', 'idx_wa_config_phone');
        });

        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->string('wa_contact_number', 20);
            $table->string('wa_profile_name', 255)->nullable();
            $table->enum('status', ['active', 'closed', 'archived'])->default('active');
            $table->timestamp('last_message_at')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('tenant_id', 'idx_wa_conv_tenant');
            $table->index(['tenant_id', 'wa_contact_number'], 'idx_wa_conv_contact_number');
            $table->index(['tenant_id', 'lead_id'], 'idx_wa_conv_lead');
        });

        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('conversation_id')->constrained('whatsapp_conversations')->cascadeOnDelete();
            $table->string('wa_message_id', 255)->nullable();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('message_type', ['text', 'image', 'video', 'audio', 'document', 'template', 'interactive', 'reaction', 'location'])->default('text');
            $table->text('content')->nullable();
            $table->string('media_url', 500)->nullable();
            $table->string('media_mime_type', 100)->nullable();
            $table->string('template_name', 255)->nullable();
            $table->enum('status', ['sent', 'delivered', 'read', 'failed', 'received'])->default('sent');
            $table->string('error_code', 50)->nullable();
            $table->text('error_message')->nullable();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['conversation_id', 'created_at'], 'idx_wa_msg_conversation');
            $table->index('wa_message_id', 'idx_wa_msg_wa_id');
            $table->index('tenant_id', 'idx_wa_msg_tenant');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_conversations');
        Schema::dropIfExists('whatsapp_configs');
    }
};
