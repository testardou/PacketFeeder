<?php
require_once __DIR__ . '/db.php';
require_login();

$file = $_GET['file'] ?? 'welcome.php';

// Safe: whitelist of allowed files
$allowed = ['welcome.php'];
$is_allowed = in_array($file, $allowed);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Local File Inclusion (Safe) — PacketFeeder Lab</title>
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
            <h1 style="color:#4ecca3;">Local File Inclusion (Safe)</h1>
            <p class="mitre">Whitelist-based include — only allowed files can be loaded</p>
        </div>

        <form method="GET">
            <label>File to include</label>
            <input type="text" name="file" value="<?= htmlspecialchars($file) ?>" placeholder="e.g. welcome.php">
            <button type="submit" style="background:#4ecca3;">Include</button>
        </form>

        <?php if (!$is_allowed) http_response_code(403); ?>
        <?php if ($is_allowed): ?>
            <pre class="result"><?php include($file); ?></pre>
        <?php else: ?>
            <pre class="result">Access denied: '<?= htmlspecialchars($file) ?>' is not in the allowed file list.
Allowed files: <?= implode(', ', $allowed) ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
