<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PipelineStage extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'pipeline_id', 'tenant_id', 'name', 'position',
        'win_probability', 'color',
    ];

    protected $casts = [
        'position' => 'integer',
        'win_probability' => 'decimal:2',
    ];

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class, 'stage_id')->orderBy('position');
    }
}
