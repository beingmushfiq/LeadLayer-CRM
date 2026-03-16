<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'role_id', 'first_name', 'last_name', 'email',
        'password', 'phone', 'avatar_url', 'is_active', 'is_super_admin',
        'google_oauth_token', 'google_refresh_token',
    ];

    protected $hidden = [
        'password', 'remember_token',
        'google_oauth_token', 'google_refresh_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'is_super_admin' => 'boolean',
    ];

    // ── Relationships ────────────────────────────────

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function assignedLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'assigned_to');
    }

    public function assignedDeals(): HasMany
    {
        return $this->hasMany(Deal::class, 'assigned_to');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function calendarEvents(): HasMany
    {
        return $this->hasMany(CalendarEvent::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'author_id');
    }

    // ── RBAC Helpers ─────────────────────────────────

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin;
    }

    public function isTenantAdmin(): bool
    {
        return $this->role?->name === 'tenant_admin';
    }

    /**
     * Check if user has a specific permission via their role.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->role?->permissions()->where('name', $permission)->exists() ?? false;
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }
}
