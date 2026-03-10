<?php
require_once __DIR__ . '/db.php';
require_login();

$result = '';
$id = $_GET['id'] ?? '';

if ($id !== '') {
    // Safe: prepared statement + input validation
    if (!ctype_digit($id)) {
        $result = "Error: ID must be a numeric value.";
    } else {
        $stmt = $db->prepare("SELECT id, username, role FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $result = "<table><tr><th>ID</th><th>Username</th><th>Role</th></tr>";
            $result .= "<tr><td>" . htmlspecialchars($row['id']) . "</td><td>" . htmlspecialchars($row['username']) . "</td><td>" . htmlspecialchars($row['role']) . "</td></tr>";
            $result .= "</table>";
        } else {
            $result = "No user found.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SQL Injection (Safe) — PacketFeeder Lab</title>
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
            <h1 style="color:#4ecca3;">SQL Injection (Safe)</h1>
            <p class="mitre">Prepared statements + input validation + no password leak</p>
        </div>

        <form method="GET">
            <label>User ID (numeric only)</label>
            <input type="text" name="id" value="<?= htmlspecialchars($id) ?>" placeholder="e.g. 1">
            <button type="submit" style="background:#4ecca3;">Lookup</button>
        </form>

        <?php if ($result): ?>
            <pre class="result"><?= $result ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
