<?php
require_once __DIR__ . '/db.php';
require_login();

$result = '';
$id = $_GET['id'] ?? '';

if ($id !== '') {
    // Intentionally vulnerable: no prepared statement, no quotes
    $sql = "SELECT * FROM users WHERE id = $id";
    try {
        $rows = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            $result = "<table><tr><th>ID</th><th>Username</th><th>Password</th><th>Role</th></tr>";
            foreach ($rows as $row) {
                $result .= "<tr><td>{$row['id']}</td><td>{$row['username']}</td><td>{$row['password']}</td><td>{$row['role']}</td></tr>";
            }
            $result .= "</table>";
        } else {
            $result = "No user found with id = $id";
        }
    } catch (Exception $e) {
        $result = "SQL Error: " . $e->getMessage() . "\n\nQuery: $sql";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SQL Injection — PacketFeeder Lab</title>
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
            <h1>SQL Injection</h1>
            <p class="mitre">T1190 — Exploit Public-Facing Application | CWE-89 — SQL Injection</p>
        </div>

        <form method="GET">
            <label>User ID</label>
            <input type="text" name="id" value="<?= htmlspecialchars($id) ?>" placeholder="e.g. 1, 1 OR 1=1, 1 UNION SELECT 1,username,password,role FROM users--">
            <button type="submit">Lookup</button>
        </form>

        <p class="info">Try: <code>1 UNION SELECT 1,username,password,role FROM users--</code></p>

        <?php if ($result): ?>
            <pre class="result"><?= $result ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
