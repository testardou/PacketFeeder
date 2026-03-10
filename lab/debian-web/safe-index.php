<?php
require_once __DIR__ . '/db.php';

$error = '';
$attempts_file = __DIR__ . '/login_attempts.json';

function get_attempts($ip, $file) {
    if (!file_exists($file)) return ['count' => 0, 'locked_until' => 0];
    $data = json_decode(file_get_contents($file), true) ?: [];
    return $data[$ip] ?? ['count' => 0, 'locked_until' => 0];
}

function set_attempts($ip, $info, $file) {
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) ?: [] : [];
    $data[$ip] = $info;
    file_put_contents($file, json_encode($data));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip = $_SERVER['REMOTE_ADDR'];
    $att = get_attempts($ip, $attempts_file);

    // Rate limit: lock after 5 failures for 60 seconds
    if ($att['locked_until'] > time()) {
        http_response_code(429);
        $error = 'Too many attempts. Try again in ' . ($att['locked_until'] - time()) . 's.';
    } else {
        $u = $_POST['username'] ?? '';
        $p = $_POST['password'] ?? '';

        // CSRF token check
        if (!isset($_POST['csrf']) || $_POST['csrf'] !== ($_SESSION['csrf'] ?? '')) {
            http_response_code(403);
            $error = 'Invalid CSRF token.';
        } else {
            // Prepared statement — no SQL injection
            $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$u]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Password verified with hash (simulated: plaintext compare but via prepared stmt)
            if ($row && $row['password'] === $p) {
                set_attempts($ip, ['count' => 0, 'locked_until' => 0], $attempts_file);
                $_SESSION['user'] = $row['username'];
                $_SESSION['role'] = $row['role'];
                header('Location: dashboard.php');
                exit;
            } else {
                http_response_code(401);
                $att['count']++;
                if ($att['count'] >= 5) {
                    $att['locked_until'] = time() + 60;
                }
                set_attempts($ip, $att, $attempts_file);
                // Generic error — no username enumeration
                $error = 'Invalid credentials.';
            }
        }
    }
}

// Generate CSRF token
$_SESSION['csrf'] = bin2hex(random_bytes(32));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PacketFeeder Lab — Login (Safe)</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="login-box">
        <h1>PacketFeeder Lab <span style="color:#4ecca3;">(Safe)</span></h1>
        <p class="info" style="text-align:center;margin-bottom:20px;">Hardened — Rate limit, CSRF, prepared statements</p>
        <?php if ($error): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <form method="POST">
            <input type="hidden" name="csrf" value="<?= $_SESSION['csrf'] ?>">
            <label>Username</label>
            <input type="text" name="username" autofocus>
            <label>Password</label>
            <input type="password" name="password">
            <button type="submit" style="width:100%">Login</button>
        </form>
        <p class="info" style="text-align:center;margin-top:16px;">Brute force mitigated — 5 attempts then 60s lockout</p>
    </div>
</body>
</html>
