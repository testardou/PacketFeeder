<?php
session_start();

$db_host = '127.0.0.1';
$db_name = 'packetfeeder_lab';
$db_user = 'packetfeeder';
$db_pass = 'packetfeeder';

$db = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create tables
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user'
)");

$db->exec("CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
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
