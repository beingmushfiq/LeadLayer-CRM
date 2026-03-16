<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use DB;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create a system-level role
        $systemRoleId = DB::table('roles')->where('name', 'Super Admin')->value('id');
        
        if (!$systemRoleId) {
            $systemRoleId = DB::table('roles')->insertGetId([
                'tenant_id' => null, // Global role
                'name' => 'Super Admin',
                'display_name' => 'Global system administrator',
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create or update Super Admin
        User::withoutGlobalScopes()->updateOrCreate(
            ['email' => 'admin@leadlayer.com'],
            [
                'tenant_id' => null,
                'role_id' => $systemRoleId,
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => 'password', // Auto-hashed by Model cast
                'is_super_admin' => true,
                'is_active' => true,
            ]
        );

        $this->command->info('Super Admin created/updated successfully (admin@leadlayer.com / password).');
    }
}
