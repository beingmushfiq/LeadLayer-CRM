<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'name', 'subject', 'body_html', 'from_name',
        'from_email', 'status', 'scheduled_at', 'sent_at',
        'total_recipients', 'total_sent', 'total_opened',
        'total_clicked', 'total_bounced', 'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function recipients(): HasMany
    {
        return $this->hasMany(EmailCampaignRecipient::class, 'campaign_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getOpenRateAttribute(): float
    {
        return $this->total_sent > 0
            ? round(($this->total_opened / $this->total_sent) * 100, 2)
            : 0;
    }

    public function getClickRateAttribute(): float
    {
        return $this->total_sent > 0
            ? round(($this->total_clicked / $this->total_sent) * 100, 2)
            : 0;
    }
}
