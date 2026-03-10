<?php
http_response_code(404);
$host = htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'unknown', ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
<body>
<h1>Not Found</h1>
<p>The requested virtual host <code><?= $host ?></code> was not found on this server.</p>
<hr>
<address>Apache Server</address>
</body>
</html>
