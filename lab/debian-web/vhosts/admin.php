<?php
header('X-Powered-By: PHP/' . phpversion());
$php_version = phpversion();
$server_software = $_SERVER['SERVER_SOFTWARE'] ?? 'nginx';
$os_info = php_uname();
?>
<!DOCTYPE html>
<html>
<head>
<title>Admin Panel — PacketFeeder</title>
<style>
    body { font-family: Arial, sans-serif; background: #1a1a2e; color: #e0e0e0; margin: 0; padding: 0; }
    .header { background: #16213e; padding: 15px 30px; border-bottom: 2px solid #e94560; }
    .header h1 { margin: 0; color: #e94560; font-size: 1.4em; }
    .container { max-width: 500px; margin: 60px auto; padding: 30px; }
    .login-box { background: #16213e; border: 1px solid #333; border-radius: 8px; padding: 30px; }
    .login-box h2 { margin-top: 0; color: #e94560; }
    label { display: block; margin: 12px 0 4px; color: #aaa; font-size: 0.9em; }
    input[type="text"], input[type="password"] {
        width: 100%; padding: 10px; box-sizing: border-box;
        background: #0f3460; border: 1px solid #444; color: #e0e0e0; border-radius: 4px;
    }
    button { margin-top: 18px; width: 100%; padding: 10px; background: #e94560; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
    button:hover { background: #c73652; }
    .server-info { margin-top: 30px; font-size: 0.75em; color: #555; text-align: center; }
</style>
</head>
<body>
<div class="header">
    <h1>PacketFeeder Admin Panel</h1>
</div>
<div class="container">
    <div class="login-box">
        <h2>Administrator Login</h2>
        <form method="POST" action="#">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="admin">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Password">
            <button type="submit">Sign In</button>
        </form>
    </div>
    <!-- Debug: server info leak -->
    <div class="server-info">
        Server: <?= htmlspecialchars($server_software) ?> |
        PHP: <?= htmlspecialchars($php_version) ?> |
        OS: <?= htmlspecialchars($os_info) ?>
    </div>
</div>
<!-- Build: packetfeeder-admin v2.1.4 -->
<!-- Internal build, do not expose to public -->
</body>
</html>
