<?php
header('Content-Type: text/plain');
echo "Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'nginx') . "\n";
echo "PHP: " . phpversion() . "\n";
echo "Uptime: " . shell_exec('uptime -p') . "\n";
echo "Hostname: " . gethostname() . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Remote Addr: " . $_SERVER['REMOTE_ADDR'] . "\n";
