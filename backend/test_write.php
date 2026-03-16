<?php
$res = file_put_contents('storage/logs/test_write.log', "TEST WRITE AT ".date('Y-m-d H:i:s'));
echo $res ? "SUCCESS: Wrote $res bytes" : "FAILURE: Could not write";
echo "\n";
