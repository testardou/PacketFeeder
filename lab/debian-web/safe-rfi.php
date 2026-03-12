<?php
require_once __DIR__ . '/db.php';
require_login();

$file = $_GET['file'] ?? '';
$error = '';

if ($file !== '') {
    // Safe: block any remote URL or path traversal
    http_response_code(403);
    if (preg_match('#^(https?://|ftp://|php://|data://|expect://|phar://)#i', $file)) {
        $error = "Blocked: remote URLs are not allowed.";
    } elseif (strpos($file, '..') !== false) {
        $error = "Blocked: path traversal detected.";
    } else {
        $error = "Blocked: file inclusion is disabled in safe mode.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Remote File Inclusion (Safe) — PacketFeeder Lab</title>
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
            <h1 style="color:#4ecca3;">Remote File Inclusion (Safe)</h1>
            <p class="mitre">URL scheme blocklist + path traversal check + allow_url_include=Off</p>
        </div>

        <form method="GET">
            <label>Remote URL to include</label>
            <input type="text" name="file" value="<?= htmlspecialchars($file) ?>" placeholder="e.g. http://attacker.com/shell.txt">
            <button type="submit" style="background:#4ecca3;">Include</button>
        </form>

        <?php if ($error): ?>
            <pre class="result"><?= htmlspecialchars($error) ?></pre>
        <?php elseif ($file === ''): ?>
            <p class="info">File inclusion is disabled. All remote URLs and traversal paths are blocked.</p>
        <?php endif; ?>
    </div>
</body>
</html>
