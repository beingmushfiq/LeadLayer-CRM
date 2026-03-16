<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Define all permissions grouped by module
        $permissionGroups = [
            'leads' => [
                ['name' => 'leads.view', 'description' => 'View leads'],
                ['name' => 'leads.create', 'description' => 'Create new leads'],
                ['name' => 'leads.edit', 'description' => 'Edit existing leads'],
                ['name' => 'leads.delete', 'description' => 'Delete leads'],
                ['name' => 'leads.assign', 'description' => 'Assign leads to users'],
                ['name' => 'leads.import', 'description' => 'Import leads from file'],
                ['name' => 'leads.export', 'description' => 'Export leads'],
            ],
            'contacts' => [
                ['name' => 'contacts.view', 'description' => 'View contacts'],
                ['name' => 'contacts.create', 'description' => 'Create new contacts'],
                ['name' => 'contacts.edit', 'description' => 'Edit existing contacts'],
                ['name' => 'contacts.delete', 'description' => 'Delete contacts'],
                ['name' => 'contacts.export', 'description' => 'Export contacts'],
            ],
            'accounts' => [
                ['name' => 'accounts.view', 'description' => 'View accounts'],
                ['name' => 'accounts.create', 'description' => 'Create new accounts'],
                ['name' => 'accounts.edit', 'description' => 'Edit existing accounts'],
                ['name' => 'accounts.delete', 'description' => 'Delete accounts'],
            ],
            'deals' => [
                ['name' => 'deals.view', 'description' => 'View deals and pipeline'],
                ['name' => 'deals.create', 'description' => 'Create new deals'],
                ['name' => 'deals.edit', 'description' => 'Edit existing deals'],
                ['name' => 'deals.delete', 'description' => 'Delete deals'],
                ['name' => 'deals.move', 'description' => 'Move deals between pipeline stages'],
            ],
            'pipelines' => [
                ['name' => 'pipelines.view', 'description' => 'View pipelines and stages'],
                ['name' => 'pipelines.manage', 'description' => 'Create, edit, and delete pipelines and stages'],
            ],
            'tasks' => [
                ['name' => 'tasks.view', 'description' => 'View tasks'],
                ['name' => 'tasks.create', 'description' => 'Create new tasks'],
                ['name' => 'tasks.edit', 'description' => 'Edit existing tasks'],
                ['name' => 'tasks.delete', 'description' => 'Delete tasks'],
            ],
            'notes' => [
                ['name' => 'notes.view', 'description' => 'View notes'],
                ['name' => 'notes.create', 'description' => 'Create new notes'],
                ['name' => 'notes.edit', 'description' => 'Edit existing notes'],
                ['name' => 'notes.delete', 'description' => 'Delete notes'],
            ],
            'calendar' => [
                ['name' => 'calendar.view', 'description' => 'View calendar events'],
                ['name' => 'calendar.create', 'description' => 'Create new events'],
                ['name' => 'calendar.edit', 'description' => 'Edit existing events'],
                ['name' => 'calendar.delete', 'description' => 'Delete events'],
            ],
            'invoices' => [
                ['name' => 'invoices.view', 'description' => 'View invoices'],
                ['name' => 'invoices.create', 'description' => 'Create new invoices'],
                ['name' => 'invoices.edit', 'description' => 'Edit existing invoices'],
                ['name' => 'invoices.delete', 'description' => 'Delete invoices'],
                ['name' => 'invoices.send', 'description' => 'Send invoices to clients'],
            ],
            'campaigns' => [
                ['name' => 'campaigns.view', 'description' => 'View email campaigns'],
                ['name' => 'campaigns.create', 'description' => 'Create new campaigns'],
                ['name' => 'campaigns.edit', 'description' => 'Edit existing campaigns'],
                ['name' => 'campaigns.delete', 'description' => 'Delete campaigns'],
                ['name' => 'campaigns.send', 'description' => 'Send campaigns'],
            ],
            'whatsapp' => [
                ['name' => 'whatsapp.view', 'description' => 'View WhatsApp conversations'],
                ['name' => 'whatsapp.send', 'description' => 'Send WhatsApp messages'],
                ['name' => 'whatsapp.configure', 'description' => 'Configure WhatsApp integration'],
            ],
            'analytics' => [
                ['name' => 'analytics.view', 'description' => 'View dashboard analytics'],
                ['name' => 'analytics.export', 'description' => 'Export analytics reports'],
            ],
            'settings' => [
                ['name' => 'settings.view', 'description' => 'View tenant settings'],
                ['name' => 'settings.edit', 'description' => 'Edit tenant settings'],
                ['name' => 'roles.manage', 'description' => 'Manage roles and permissions'],
                ['name' => 'users.view', 'description' => 'View team members'],
                ['name' => 'users.manage', 'description' => 'Add, edit, and deactivate team members'],
                ['name' => 'billing.view', 'description' => 'View subscription and billing'],
                ['name' => 'billing.manage', 'description' => 'Manage subscription and billing'],
            ],
        ];

        foreach ($permissionGroups as $group => $permissions) {
            foreach ($permissions as $permissionData) {
                Permission::firstOrCreate(
                    ['name' => $permissionData['name']],
                    [
                        'group' => $group,
                        'description' => $permissionData['description'],
                    ]
                );
            }
        }

        $this->command->info('✓ Seeded ' . Permission::count() . ' permissions across ' . count($permissionGroups) . ' groups.');
    }
}
