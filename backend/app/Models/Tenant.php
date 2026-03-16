<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'domain', 'logo_url', 'timezone',
        'subscription_plan', 'subscription_status', 'trial_ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

    // ── Relationships ────────────────────────────────

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    public function paymentHistories(): HasMany
    {
        return $this->hasMany(PaymentHistory::class);
    }

    public function roles(): HasMany
    {
        return $this->hasMany(Role::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function pipelines(): HasMany
    {
        return $this->hasMany(Pipeline::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    public function whatsappConfig(): HasOne
    {
        return $this->hasOne(WhatsappConfig::class);
    }

    public function leadAssignmentRules(): HasMany
    {
        return $this->hasMany(LeadAssignmentRule::class);
    }

    // ── Helpers ──────────────────────────────────────

    public function isTrialing(): bool
    {
        return $this->subscription_status === 'trialing';
    }

    public function isActive(): bool
    {
        return in_array($this->subscription_status, ['active', 'trialing']);
    }
}
