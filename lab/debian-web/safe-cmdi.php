<?php
require_once __DIR__ . '/db.php';
require_login();

$ip = $_GET['ip'] ?? '';
$cmd = $_GET['cmd'] ?? '';
$output = '';
$error = '';

if ($cmd !== '') {
    // Safe: direct command execution is completely blocked
    $error = "Blocked: direct command execution is disabled.";
} elseif ($ip !== '') {
    // Safe: validate IP format, use escapeshellarg
    if (filter_var($ip, FILTER_VALIDATE_IP)) {
        $output = shell_exec("ping -c 2 " . escapeshellarg($ip));
    } else {
        $error = "Blocked: invalid IP address format. Only valid IPs accepted (e.g. 127.0.0.1).";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Command Injection (Safe) — PacketFeeder Lab</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <span class="brand">PacketFeeder Lab <span style="color:#4ecca3;">(Safe)</span></span>
        <span class="links">
            <a href="dashboard.php">Dashboard</a>
            <a href="logout.php">Logout</a>
        </span>
    </nav>
    <div class="container">
        <div class="module-banner" style="border-left-color:#4ecca3;">
            <h1 style="color:#4ecca3;">Command Injection (Safe)</h1>
            <p class="mitre">IP validation (FILTER_VALIDATE_IP) + escapeshellarg + no direct exec</p>
        </div>

        <h3 style="margin-bottom:8px;">Mode 1: Ping (sanitized)</h3>
        <form method="GET">
            <label>IP Address (validated)</label>
            <input type="text" name="ip" value="<?= htmlspecialchars($ip) ?>" placeholder="e.g. 127.0.0.1">
            <button type="submit" style="background:#4ecca3;">Ping</button>
        </form>

        <h3 style="margin:20px 0 8px;">Mode 2: Direct execution (disabled)</h3>
        <form method="GET">
            <label>Command</label>
            <input type="text" name="cmd" value="<?= htmlspecialchars($cmd) ?>" placeholder="Disabled in safe mode">
            <button type="submit" style="background:#4ecca3;">Execute</button>
        </form>

        <?php if ($error): ?>
            <pre class="result"><?= htmlspecialchars($error) ?></pre>
        <?php elseif ($output): ?>
            <pre class="result"><?= htmlspecialchars($output) ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
