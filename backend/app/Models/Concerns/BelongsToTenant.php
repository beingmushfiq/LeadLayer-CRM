<?php

namespace App\Models\Concerns;

use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * BelongsToTenant - Applied to all tenant-scoped models.
 * Automatically sets tenant_id on creation and applies TenantScope for queries.
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        // Apply global scope for query-level tenant isolation
        static::addGlobalScope(new TenantScope);

        // Auto-set tenant_id when creating a new record
        static::creating(function ($model) {
            if (Auth::check() && !Auth::user()->is_super_admin && Auth::user()->tenant_id && !$model->tenant_id) {
                $model->tenant_id = Auth::user()->tenant_id;
            }
        });
    }

    /**
     * Get the tenant that owns this record.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
