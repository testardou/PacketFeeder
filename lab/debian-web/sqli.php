<?php
require_once __DIR__ . '/db.php';
require_login();

$id = $_GET['id'] ?? '';
$username = $_GET['username'] ?? '';
$result_union = '';
$result_error = '';
$result_blind = '';

if ($id !== '') {
    // Union-based: full query results displayed
    $sql = "SELECT * FROM users WHERE id = $id";
    try {
        $rows = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        if ($rows) {
            $result_union = "<table><tr><th>ID</th><th>Username</th><th>Password</th><th>Role</th></tr>";
            foreach ($rows as $row) {
                $result_union .= "<tr><td>{$row['id']}</td><td>{$row['username']}</td><td>{$row['password']}</td><td>{$row['role']}</td></tr>";
            }
            $result_union .= "</table>";
        } else {
            $result_union = "No user found with id = $id";
        }
    } catch (Exception $e) {
        $result_union = "SQL Error: " . $e->getMessage() . "\n\nQuery: $sql";
    }

    // Blind: boolean only
    $sql3 = "SELECT id FROM users WHERE id = $id";
    try {
        $row = $db->query($sql3)->fetch(PDO::FETCH_ASSOC);
        $result_blind = $row ? '<span style="color:#4ecca3;">User exists.</span>' : '<span style="color:#e94560;">User not found.</span>';
    } catch (Exception $e) {
        $result_blind = '<span style="color:#e94560;">User not found.</span>';
    }
}

if ($username !== '') {
    // Error-based: string injection, error messages exposed, no data reflected
    $sql2 = "SELECT id FROM users WHERE username = '$username'";
    try {
        $row = $db->query($sql2)->fetch(PDO::FETCH_ASSOC);
        $result_error = $row ? "User found." : "User not found.";
    } catch (Exception $e) {
        $result_error = "Database error: " . $e->getMessage();
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
            <p class="mitre">T1190 — Exploit Public-Facing Application | CWE-89</p>
        </div>

        <h3>Union-Based & Blind</h3>
        <form method="GET">
            <label>User ID</label>
            <input type="text" name="id" value="<?= htmlspecialchars($id) ?>" placeholder="e.g. 1, 1 UNION SELECT 1,username,password,role FROM users--, 1 AND 1=1">
            <button type="submit">Lookup</button>
        </form>

        <?php if ($id !== ''): ?>
            <p class="info">Union: <code>1 UNION SELECT 1,username,password,role FROM users--</code></p>
            <pre class="result"><?= $result_union ?></pre>

            <p class="info">Blind: <code>1 AND 1=1</code> vs <code>1 AND 1=2</code></p>
            <pre class="result"><?= $result_blind ?></pre>
        <?php endif; ?>

        <hr style="border-color:#333;margin:30px 0;">

        <h3>Error-Based</h3>
        <form method="GET">
            <label>Username</label>
            <input type="text" name="username" value="<?= htmlspecialchars($username) ?>" placeholder="e.g. admin, '">
            <button type="submit">Lookup</button>
        </form>

        <?php if ($username !== ''): ?>
            <p class="info">Try: <code>'</code> to trigger SQL error | <code>' AND extractvalue(1,concat(0x7e,version()))-- -</code></p>
            <pre class="result"><?= $result_error ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
