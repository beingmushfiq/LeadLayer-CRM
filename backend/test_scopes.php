<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;

// Mock session check
$user = User::where('email', 'admin@leadlayer.com')->first();
echo "User search result (with scopes): " . ($user ? "FOUND (ID: {$user->id})" : "NOT FOUND") . "\n";

if ($user) {
    echo "Is Super Admin: " . ($user->is_super_admin ? 'YES' : 'NO') . "\n";
    echo "Tenant ID: " . ($user->tenant_id ?? 'NULL') . "\n";
}
