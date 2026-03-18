<?php
require_once __DIR__ . '/db.php';
require_login();

$message = '';
$uploaded_file = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $upload_dir = __DIR__ . '/uploads/';

    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $filename = basename($_FILES['file']['name']);
    $target = $upload_dir . $filename;

    // Vulnerable: no extension check, no MIME validation, no content inspection
    if (move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
        $message = "File uploaded successfully: <a href=\"uploads/" . htmlspecialchars($filename) . "\">" . htmlspecialchars($filename) . "</a>";
        $uploaded_file = $filename;
    } else {
        $message = "Upload failed.";
    }
}

// List uploaded files
$files = [];
$upload_dir = __DIR__ . '/uploads/';
if (is_dir($upload_dir)) {
    $files = array_diff(scandir($upload_dir), ['.', '..']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>File Upload — PacketFeeder Lab</title>
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
            <h1>File Upload</h1>
            <p class="mitre">T1505.003 — Server Software Component: Web Shell | CWE-434</p>
        </div>

        <form method="POST" enctype="multipart/form-data">
            <label>Select file to upload</label>
            <input type="file" name="file" style="background:#0f3460;border:1px solid #16213e;color:#e0e0e0;padding:10px 14px;width:100%;margin-bottom:12px;border-radius:4px;">
            <button type="submit">Upload</button>
        </form>

        <?php if ($message !== ''): ?>
            <pre class="result"><?= $message ?></pre>
        <?php endif; ?>

        <?php if (!empty($files)): ?>
            <h3 style="margin-top:24px;">Uploaded Files</h3>
            <table>
                <tr><th>Filename</th><th>Link</th></tr>
                <?php foreach ($files as $f): ?>
                    <tr>
                        <td><?= htmlspecialchars($f) ?></td>
                        <td><a href="uploads/<?= htmlspecialchars($f) ?>">Open</a></td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>
