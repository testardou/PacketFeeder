<?php
require_once __DIR__ . '/db.php';
require_login();

$output = '';

$q = $_GET['q'] ?? '';
$category = $_GET['category'] ?? '';
$year = $_GET['year'] ?? '';
$sort = $_GET['sort'] ?? '';
$debug = $_GET['debug'] ?? '';
$export = $_GET['export'] ?? '';

if ($q !== '') {
    $output .= "<p>Search results for: <strong>" . htmlspecialchars($q) . "</strong></p>";
    $output .= "<ul><li>Report_Q1_2024.pdf</li><li>Report_Q2_2024.pdf</li><li>Audit_log_march.csv</li></ul>";
}

if ($category !== '') {
    $output .= "<p>Filtered by category: <strong>" . htmlspecialchars($category) . "</strong></p>";
    $output .= "<ul><li>network-scan-01.pcap</li><li>network-scan-02.pcap</li></ul>";
}

if ($year !== '') {
    $output .= "<p>Filtered by year: <strong>" . htmlspecialchars($year) . "</strong></p>";
    $output .= "<ul><li>Archive_" . htmlspecialchars($year) . "_01.tar.gz</li></ul>";
}

if ($sort !== '') {
    $output .= "<p>Sort order: <strong>" . htmlspecialchars($sort) . "</strong></p>";
}

if ($debug !== '') {
    $output .= "<div class='result'><pre>";
    $output .= "PHP Version: " . phpversion() . "\n";
    $output .= "Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'N/A') . "\n";
    $output .= "Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "\n";
    $output .= "Session ID: " . session_id() . "\n";
    $output .= "</pre></div>";
}

if ($export !== '') {
    $output .= "<p>Export format: <strong>" . htmlspecialchars($export) . "</strong> — <a href='#'>Download</a></p>";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Search — PacketFeeder Lab</title>
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
            <h1>Search Reports</h1>
            <p class="mitre">Internal report search engine</p>
        </div>

        <form method="GET">
            <label>Search</label>
            <input type="text" name="q" value="<?= htmlspecialchars($q) ?>" placeholder="Search reports...">
            <button type="submit">Search</button>
        </form>

        <?php if ($output !== ''): ?>
            <div style="margin-top:20px;">
                <?= $output ?>
            </div>
        <?php else: ?>
            <p style="color:#888;margin-top:20px;">Enter a search term to find reports.</p>
        <?php endif; ?>
    </div>
</body>
</html>
