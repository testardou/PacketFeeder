<?php
$env_vars = [
    'APP_ENV' => 'development',
    'APP_DEBUG' => 'true',
    'DB_HOST' => '127.0.0.1',
    'DB_NAME' => 'packetfeeder_dev',
    'DB_USER' => 'pf_admin',
    'DB_PASS' => 'dev_s3cret_2024',
    'REDIS_HOST' => '127.0.0.1:6379',
    'API_KEY' => 'sk-dev-a8f3e2b1c9d4e5f6a7b8c9d0e1f2a3b4',
    'SECRET_KEY' => 'changeme_in_production',
];

$git_config = "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n[remote \"origin\"]\n\turl = git@gitlab.internal.packetfeeder.lab:packetfeeder/webapp.git\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n[branch \"develop\"]\n\tremote = origin\n\tmerge = refs/heads/develop\n[user]\n\tname = dev-deployer\n\temail = deployer@packetfeeder.lab";
?>
<!DOCTYPE html>
<html>
<head>
<title>DEV — PacketFeeder Staging</title>
<style>
    body { font-family: 'Courier New', monospace; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }
    .warning { background: #f0ad4e; color: #000; padding: 12px 20px; border-radius: 4px; font-weight: bold; margin-bottom: 20px; }
    h1 { color: #58a6ff; }
    h2 { color: #f0ad4e; border-bottom: 1px solid #333; padding-bottom: 6px; }
    pre { background: #161b22; border: 1px solid #30363d; padding: 15px; border-radius: 6px; overflow-x: auto; }
    a { color: #58a6ff; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    td, th { border: 1px solid #30363d; padding: 8px 12px; text-align: left; }
    th { background: #161b22; }
</style>
</head>
<body>
<div class="warning">WARNING: Development environment — DO NOT expose to production</div>

<h1>PacketFeeder — Development Environment</h1>
<p>Branch: <code>develop</code> | Last deploy: 2024-11-15 14:32:07 UTC</p>

<h2>Debug Tools</h2>
<ul>
    <li><a href="?action=phpinfo">View phpinfo()</a></li>
    <li><a href="?action=gitconfig">View .git/config</a></li>
</ul>

<?php if (isset($_GET['action']) && $_GET['action'] === 'phpinfo'): ?>
    <?php phpinfo(); exit; ?>
<?php elseif (isset($_GET['action']) && $_GET['action'] === 'gitconfig'): ?>
    <h2>.git/config</h2>
    <pre><?= htmlspecialchars($git_config) ?></pre>
<?php endif; ?>

<h2>Environment Variables</h2>
<table>
    <tr><th>Variable</th><th>Value</th></tr>
    <?php foreach ($env_vars as $key => $value): ?>
    <tr><td><?= htmlspecialchars($key) ?></td><td><?= htmlspecialchars($value) ?></td></tr>
    <?php endforeach; ?>
</table>

<h2>.git/config</h2>
<pre><?= htmlspecialchars($git_config) ?></pre>

<!-- TODO: remove debug endpoints before prod release -->
<!-- Deploy key: /home/deployer/.ssh/id_ed25519 -->
</body>
</html>
