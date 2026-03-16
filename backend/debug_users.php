<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$users = User::withoutGlobalScopes()->get();

foreach ($users as $user) {
    echo "ID: {$user->id} | Email: {$user->email} | Super: " . ($user->is_super_admin ? 'YES' : 'NO') . " | Hash: {$user->password}\n";
    echo "Check 'password': " . (Hash::check('password', $user->password) ? 'MATCH' : 'FAIL') . "\n";
    echo "---------------------------------\n";
}
