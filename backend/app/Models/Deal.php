<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deal extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'pipeline_id', 'stage_id', 'contact_id',
        'account_id', 'lead_id', 'title', 'value', 'currency',
        'probability', 'expected_close_date', 'actual_close_date',
        'status', 'loss_reason', 'assigned_to', 'position',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'probability' => 'decimal:2',
        'position' => 'integer',
        'expected_close_date' => 'date',
        'actual_close_date' => 'date',
    ];

    // ── Relationships ────────────────────────────────

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes(): MorphMany
    {
        return $this->morphMany(Note::class, 'notable');
    }

    public function tasks(): MorphMany
    {
        return $this->morphMany(Task::class, 'taskable');
    }

    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    // ── Helpers ──────────────────────────────────────

    public function getWeightedValueAttribute(): float
    {
        $prob = $this->probability ?? $this->stage?->win_probability ?? 0;
        return (float) $this->value * ($prob / 100);
    }
}
