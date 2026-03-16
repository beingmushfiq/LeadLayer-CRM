<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'plan', 'amount', 'currency', 'status',
        'sslcommerz_transaction_id', 'sslcommerz_session_key',
        'starts_at', 'ends_at', 'renewed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'renewed_at' => 'datetime',
    ];
}
