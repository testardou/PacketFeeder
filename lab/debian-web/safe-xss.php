<?php
require_once __DIR__ . '/db.php';
require_login();

// Stored XSS: save comment (sanitized)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['comment'])) {
    $username = $_SESSION['user'];
    $comment = strip_tags($_POST['comment']); // Strip HTML tags
    $stmt = $db->prepare("INSERT INTO comments (username, comment) VALUES (?, ?)");
    $stmt->execute([$username, $comment]);
    header('Location: safe-xss.php');
    exit;
}

// Reflected XSS (sanitized)
$q = $_GET['q'] ?? '';

// Fetch all comments
$comments = $db->query("SELECT * FROM comments ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>XSS (Safe) — PacketFeeder Lab</title>
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
            <h1 style="color:#4ecca3;">XSS — Reflected + Stored (Safe)</h1>
            <p class="mitre">htmlspecialchars on output + strip_tags on input + CSP header</p>
        </div>

        <!-- Reflected XSS (safe) -->
        <h3 style="margin-bottom:8px;">Reflected XSS (sanitized)</h3>
        <form method="GET">
            <label>Search query</label>
            <input type="text" name="q" value="<?= htmlspecialchars($q) ?>" placeholder="e.g. <script>alert(1)</script>">
            <button type="submit" style="background:#4ecca3;">Search</button>
        </form>

        <?php if ($q !== ''): ?>
            <pre class="result">Search results for: <?= htmlspecialchars($q, ENT_QUOTES, 'UTF-8') ?></pre>
        <?php endif; ?>

        <hr style="border-color:#0f3460;margin:30px 0;">

        <!-- Stored XSS (safe) -->
        <h3 style="margin-bottom:8px;">Stored XSS — Comments (sanitized)</h3>
        <form method="POST">
            <label>Leave a comment (HTML tags stripped)</label>
            <textarea name="comment" placeholder="e.g. <script>alert('stored')</script>"></textarea>
            <button type="submit" style="background:#4ecca3;">Post Comment</button>
        </form>

        <?php foreach ($comments as $c): ?>
            <div class="comment-box">
                <span class="author"><?= htmlspecialchars($c['username']) ?></span>
                <span class="date"><?= htmlspecialchars($c['created_at']) ?></span>
                <p><?= htmlspecialchars($c['comment'], ENT_QUOTES, 'UTF-8') ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>
