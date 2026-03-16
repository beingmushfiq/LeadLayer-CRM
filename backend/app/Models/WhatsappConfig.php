<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsappConfig extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'phone_number_id', 'waba_id', 'access_token',
        'webhook_verify_token', 'auto_reply_enabled', 'auto_reply_template',
        'auto_create_lead', 'is_active',
    ];

    protected $hidden = ['access_token'];

    protected $casts = [
        'access_token' => 'encrypted',
        'auto_reply_enabled' => 'boolean',
        'auto_create_lead' => 'boolean',
        'is_active' => 'boolean',
    ];
}
