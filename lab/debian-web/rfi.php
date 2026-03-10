<?php
require_once __DIR__ . '/db.php';
require_login();

$file = $_GET['file'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Remote File Inclusion — PacketFeeder Lab</title>
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
            <h1>Remote File Inclusion</h1>
            <p class="mitre">T1059.004 — Unix Shell | CWE-98 — Improper Control of Filename</p>
        </div>

        <p class="info">Requires <code>allow_url_include=On</code> in php.ini</p>

        <form method="GET">
            <label>Remote URL to include</label>
            <input type="text" name="file" value="<?= htmlspecialchars($file) ?>" placeholder="e.g. http://attacker.com/shell.txt">
            <button type="submit">Include</button>
        </form>

        <?php if ($file !== ''): ?>
            <pre class="result"><?php include($file); ?></pre>
        <?php else: ?>
            <p class="info">Provide a <code>?file=</code> parameter with a remote URL to include.</p>
        <?php endif; ?>
    </div>
</body>
</html>
