<?php
require_once __DIR__ . '/db.php';
require_login();

$file = $_GET['file'] ?? 'welcome.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Local File Inclusion — PacketFeeder Lab</title>
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
            <h1>Local File Inclusion</h1>
            <p class="mitre">T1005 — Data from Local System | CWE-98 — Improper Control of Filename</p>
        </div>

        <form method="GET">
            <label>File to include</label>
            <input type="text" name="file" value="<?= htmlspecialchars($file) ?>" placeholder="e.g. welcome.php, ../../../etc/passwd">
            <button type="submit">Include</button>
        </form>

        <p class="info">Try: <code>?file=../../../etc/passwd</code> or <code>?file=php://filter/convert.base64-encode/resource=db.php</code></p>

        <pre class="result"><?php include($file); ?></pre>
    </div>
</body>
</html>
