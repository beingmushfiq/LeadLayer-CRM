<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$email = 'admin@leadlayer.com';
$password = 'password';
$hashed = Hash::make($password);

DB::table('users')
    ->where('email', $email)
    ->update([
        'password' => $hashed,
        'is_super_admin' => 1,
        'is_active' => 1,
        'tenant_id' => null
    ]);

echo "Forced update of user '$email' with RAW HASH: $hashed\n";

$verify = DB::table('users')->where('email', $email)->first();
echo "Verified DB value: " . $verify->password . "\n";
echo "Hash check PASSED: " . (Hash::check($password, $verify->password) ? 'YES' : 'NO') . "\n";
