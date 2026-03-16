<?php

use App\Models\User;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'admin@leadlayer.com';

$users = User::withoutGlobalScopes()->where('email', $email)->get();

echo "Total users found with email '$email': " . $users->count() . "\n";

foreach ($users as $index => $user) {
    echo "User #$index:\n";
    echo "  ID: " . $user->id . "\n";
    echo "  Tenant ID: " . ($user->tenant_id ?? 'NULL') . "\n";
    echo "  Is Super Admin: " . ($user->is_super_admin ? 'TRUE' : 'FALSE') . "\n";
    echo "  Is Active: " . ($user->is_active ? 'TRUE' : 'FALSE') . "\n";
    echo "  Password snippet: " . substr($user->password, 0, 10) . "...\n";
}
