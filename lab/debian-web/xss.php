<?php
require_once __DIR__ . '/db.php';
require_login();

// Stored XSS: save comment
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['comment'])) {
    $username = $_SESSION['user'];
    $comment = $_POST['comment']; // No sanitization
    $stmt = $db->prepare("INSERT INTO comments (username, comment) VALUES (?, ?)");
    $stmt->execute([$username, $comment]);
    header('Location: xss.php');
    exit;
}

// Reflected XSS
$q = $_GET['q'] ?? '';

// Fetch all comments for stored XSS display
$comments = $db->query("SELECT * FROM comments ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>XSS — PacketFeeder Lab</title>
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
            <h1>XSS — Reflected + Stored</h1>
            <p class="mitre">T1059.007 — JavaScript | CWE-79 — Cross-site Scripting</p>
        </div>

        <!-- Reflected XSS -->
        <h3 style="margin-bottom:8px;">Reflected XSS</h3>
        <form method="GET">
            <label>Search query</label>
            <input type="text" name="q" value="<?= htmlspecialchars($q) ?>" placeholder="e.g. <script>alert(1)</script>">
            <button type="submit">Search</button>
        </form>

        <?php if ($q !== ''): ?>
            <pre class="result">Search results for: <?= $q ?></pre>
        <?php endif; ?>

        <p class="info">Try: <code>?q=&lt;script&gt;alert(1)&lt;/script&gt;</code> or <code>?q=&lt;img src=x onerror=alert(1)&gt;</code></p>

        <hr style="border-color:#0f3460;margin:30px 0;">

        <!-- Stored XSS -->
        <h3 style="margin-bottom:8px;">Stored XSS — Comments</h3>
        <form method="POST">
            <label>Leave a comment</label>
            <textarea name="comment" placeholder="e.g. <script>alert('stored')</script>"></textarea>
            <button type="submit">Post Comment</button>
        </form>

        <?php foreach ($comments as $c): ?>
            <div class="comment-box">
                <span class="author"><?= $c['username'] ?></span>
                <span class="date"><?= $c['created_at'] ?></span>
                <p><?= $c['comment'] ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>
