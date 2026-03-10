<?php
$uptime = '47 days, 3:21:44';
$load = '0.42, 0.31, 0.28';
$memory_used = '1.2 GB';
$memory_total = '4.0 GB';
$disk_used = '18.3 GB';
$disk_total = '50.0 GB';
$cpu_usage = '12%';

$services = [
    ['name' => 'apache2',    'status' => 'running', 'pid' => 1247,  'uptime' => '47d'],
    ['name' => 'mysql',      'status' => 'running', 'pid' => 1389,  'uptime' => '47d'],
    ['name' => 'redis',      'status' => 'running', 'pid' => 1412,  'uptime' => '47d'],
    ['name' => 'ssh',        'status' => 'running', 'pid' => 892,   'uptime' => '47d'],
    ['name' => 'cron',       'status' => 'running', 'pid' => 934,   'uptime' => '47d'],
    ['name' => 'snmpd',      'status' => 'stopped', 'pid' => null,  'uptime' => '-'],
    ['name' => 'postfix',    'status' => 'stopped', 'pid' => null,  'uptime' => '-'],
];
?>
<!DOCTYPE html>
<html>
<head>
<title>Monitoring — PacketFeeder</title>
<style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0; }
    .header { background: #111; padding: 15px 30px; border-bottom: 2px solid #00c853; }
    .header h1 { margin: 0; color: #00c853; font-size: 1.3em; }
    .container { max-width: 900px; margin: 20px auto; padding: 0 20px; }
    .card { background: #151515; border: 1px solid #2a2a2a; border-radius: 6px; padding: 20px; margin: 15px 0; }
    .card h2 { margin-top: 0; color: #00c853; font-size: 1.1em; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
    .metric { background: #1a1a1a; padding: 15px; border-radius: 4px; text-align: center; }
    .metric .value { font-size: 1.6em; color: #00c853; font-weight: bold; }
    .metric .label { font-size: 0.85em; color: #888; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 8px 12px; border-bottom: 1px solid #222; text-align: left; }
    th { color: #888; font-size: 0.85em; text-transform: uppercase; }
    .status-running { color: #00c853; }
    .status-stopped { color: #ff5252; }
</style>
</head>
<body>
<div class="header">
    <h1>PacketFeeder System Monitor</h1>
</div>
<div class="container">
    <div class="card">
        <h2>System Metrics</h2>
        <div class="metrics">
            <div class="metric"><div class="value"><?= $uptime ?></div><div class="label">Uptime</div></div>
            <div class="metric"><div class="value"><?= $cpu_usage ?></div><div class="label">CPU Usage</div></div>
            <div class="metric"><div class="value"><?= $load ?></div><div class="label">Load Average</div></div>
            <div class="metric"><div class="value"><?= $memory_used ?> / <?= $memory_total ?></div><div class="label">Memory</div></div>
            <div class="metric"><div class="value"><?= $disk_used ?> / <?= $disk_total ?></div><div class="label">Disk Usage</div></div>
        </div>
    </div>
    <div class="card">
        <h2>Services</h2>
        <table>
            <tr><th>Service</th><th>Status</th><th>PID</th><th>Uptime</th></tr>
            <?php foreach ($services as $svc): ?>
            <tr>
                <td><?= htmlspecialchars($svc['name']) ?></td>
                <td class="status-<?= $svc['status'] ?>"><?= $svc['status'] ?></td>
                <td><?= $svc['pid'] ?? '-' ?></td>
                <td><?= $svc['uptime'] ?></td>
            </tr>
            <?php endforeach; ?>
        </table>
    </div>
    <div class="card">
        <h2>Network</h2>
        <table>
            <tr><th>Interface</th><th>IP Address</th><th>RX</th><th>TX</th></tr>
            <tr><td>eth0</td><td>10.10.10.40</td><td>2.4 GB</td><td>1.1 GB</td></tr>
            <tr><td>lo</td><td>127.0.0.1</td><td>48 MB</td><td>48 MB</td></tr>
        </table>
    </div>
</div>
<!-- Monitoring agent v0.3.1 — internal use only -->
</body>
</html>
