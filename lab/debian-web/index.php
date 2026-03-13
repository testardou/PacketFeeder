<?php
require_once __DIR__ . '/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = $_POST['username'] ?? '';
    $p = $_POST['password'] ?? '';

    // Intentionally vulnerable: SQL injection + plaintext password check
    $sql = "SELECT * FROM users WHERE username='$u' AND password='$p'";
    try {
        $row = $db->query($sql)->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $row = false;
    }

    if ($row) {
        $_SESSION['user'] = $row['username'];
        $_SESSION['role'] = $row['role'];
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Invalid username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PacketFeeder Lab — Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="login-box">
        <h1>PacketFeeder Lab</h1>
        <p class="info" style="text-align:center;margin-bottom:20px;">Vulnerable Web Application for Network Traffic Generation</p>
        <?php if ($error): ?>
            <p class="error"><?= $error ?></p>
        <?php endif; ?>
        <form method="POST">
            <label>Username</label>
            <input type="text" name="username" autofocus>
            <label>Password</label>
            <input type="password" name="password">
            <button type="submit" style="width:100%">Login</button>
        </form>
        <p class="info" style="text-align:center;margin-top:16px;">T1110 — Brute Force | CWE-307 | No rate limit</p>
    </div>
</body>
</html>
