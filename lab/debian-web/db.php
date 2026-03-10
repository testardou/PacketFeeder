<?php
session_start();

$db_path = __DIR__ . '/packetfeeder_lab.db';
$db = new PDO("sqlite:$db_path");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create tables
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
)");

$db->exec("CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// Seed users if table is empty
$count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
if ($count == 0) {
    $users = [
        ['admin',       'admin123',     'admin'],
        ['operator',    'operator1',    'operator'],
        ['analyst',     'analyst2024',  'analyst'],
        ['guest',       'guest',        'guest'],
        ['john',        'password',     'user'],
        ['jane',        'letmein',      'user'],
        ['bob',         'qwerty',       'user'],
        ['alice',       '123456',       'user'],
        ['charlie',     'charlie1',     'user'],
        ['dave',        'welcome1',     'user'],
        ['eve',         'shadow',       'user'],
        ['frank',       'master',       'user'],
        ['grace',       'dragon',       'user'],
        ['heidi',       'monkey',       'user'],
        ['ivan',        'iloveyou',     'user'],
        ['judy',        'trustno1',     'user'],
        ['ftpuser',     'ftp1234',      'service'],
        ['smbuser',     'smb1234',      'service'],
    ];
    $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    foreach ($users as $u) {
        $stmt->execute($u);
    }
}

function is_logged_in() {
    return isset($_SESSION['user']);
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: index.php');
        exit;
    }
}
