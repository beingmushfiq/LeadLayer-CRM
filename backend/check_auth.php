<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'admin@leadlayer.com';
$password = 'password';

$user = User::withoutGlobalScopes()->where('email', $email)->first();

if (!$user) {
    echo "User NOT found in database.\n";
} else {
    echo "User found: " . $user->first_name . " " . $user->last_name . " (" . $user->email . ")\n";
    echo "Is Super Admin (Flag): " . ($user->is_super_admin ? 'TRUE' : 'FALSE') . "\n";
    echo "Hashed password in DB: " . $user->password . "\n";
    
    $check = Hash::check($password, $user->password);
    echo "Password check for 'password': " . ($check ? 'PASSED' : 'FAILED') . "\n";
}
