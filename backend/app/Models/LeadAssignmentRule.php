<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeadAssignmentRule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'strategy', 'eligible_user_ids',
        'last_assigned_index', 'is_active',
    ];

    protected $casts = [
        'eligible_user_ids' => 'json',
        'last_assigned_index' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the next user ID in round-robin rotation.
     */
    public function getNextAssigneeId(): ?int
    {
        $userIds = $this->eligible_user_ids;

        if (empty($userIds)) {
            return null;
        }

        $nextIndex = ($this->last_assigned_index + 1) % count($userIds);
        $this->update(['last_assigned_index' => $nextIndex]);

        return $userIds[$nextIndex];
    }
}
