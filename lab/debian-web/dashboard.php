<?php
require_once __DIR__ . '/db.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard — PacketFeeder Lab</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <span class="brand">PacketFeeder Lab</span>
        <span class="links">
            <a href="dashboard.php">Dashboard</a>
            <a href="logout.php">Logout (<?= htmlspecialchars($_SESSION['user']) ?>)</a>
        </span>
    </nav>
    <div class="container">
        <h2 style="margin-bottom:20px;">Vulnerable Modules</h2>
        <div class="card-grid">

            <a href="sqli.php" class="card">
                <h3>SQL Injection</h3>
                <span class="tag">T1190</span>
                <span class="tag">CWE-89</span>
                <p>3 modes: Union-based, Error-based, Blind (boolean + time-based) — switch via tabs.</p>
            </a>

            <a href="lfi.php" class="card">
                <h3>Local File Inclusion</h3>
                <span class="tag">T1005</span>
                <span class="tag">CWE-98</span>
                <p>Data from Local System — Include arbitrary local files via path traversal.</p>
            </a>

            <a href="rfi.php" class="card">
                <h3>Remote File Inclusion</h3>
                <span class="tag">T1059.004</span>
                <span class="tag">CWE-98</span>
                <p>Unix Shell — Include remote files when allow_url_include is enabled.</p>
            </a>

            <a href="cmdi.php" class="card">
                <h3>Command Injection</h3>
                <span class="tag">T1059</span>
                <span class="tag">CWE-78</span>
                <p>Command and Scripting Interpreter — Execute arbitrary OS commands via ping or direct exec.</p>
            </a>

            <a href="xss.php" class="card">
                <h3>XSS (Reflected + Stored)</h3>
                <span class="tag">T1059.007</span>
                <span class="tag">CWE-79</span>
                <p>JavaScript — Reflected XSS via search parameter and stored XSS via comments.</p>
            </a>

            <a href="xxe.php" class="card">
                <h3>XXE Injection</h3>
                <span class="tag">T1059</span>
                <span class="tag">CWE-611</span>
                <p>XML External Entity processing — Parse untrusted XML with external entity resolution.</p>
            </a>

        </div>
    </div>
</body>
</html>
