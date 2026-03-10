<?php
require_once __DIR__ . '/db.php';
require_login();

$ip = $_GET['ip'] ?? '';
$cmd = $_GET['cmd'] ?? '';
$output = '';
$mode = '';

if ($cmd !== '') {
    // Direct command execution
    $mode = 'exec';
    $output = shell_exec($cmd);
} elseif ($ip !== '') {
    // Ping with injection
    $mode = 'ping';
    $output = shell_exec("ping -c 2 " . $ip);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Command Injection — PacketFeeder Lab</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <span class="brand">PacketFeeder Lab</span>
        <span class="links">
            <a href="dashboard.php">Dashboard</a>
            <a href="logout.php">Logout</a>
        </span>
    </nav>
    <div class="container">
        <div class="module-banner">
            <h1>Command Injection</h1>
            <p class="mitre">T1059 — Command and Scripting Interpreter | CWE-78 — OS Command Injection</p>
        </div>

        <h3 style="margin-bottom:8px;">Mode 1: Ping (injectable)</h3>
        <form method="GET">
            <label>IP Address</label>
            <input type="text" name="ip" value="<?= htmlspecialchars($ip) ?>" placeholder="e.g. 127.0.0.1 or ;id or |cat /etc/passwd">
            <button type="submit">Ping</button>
        </form>
        <p class="info">Try: <code>?ip=;id</code> or <code>?ip=127.0.0.1;cat /etc/passwd</code></p>

        <h3 style="margin:20px 0 8px;">Mode 2: Direct execution</h3>
        <form method="GET">
            <label>Command</label>
            <input type="text" name="cmd" value="<?= htmlspecialchars($cmd) ?>" placeholder="e.g. whoami, ls -la, cat /etc/shadow">
            <button type="submit">Execute</button>
        </form>

        <?php if ($output !== ''): ?>
            <p class="info">Mode: <?= $mode ?></p>
            <pre class="result"><?= htmlspecialchars($output) ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
