<?php
require_once __DIR__ . '/db.php';
require_login();

$result = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if ($raw) {
        // Safe: disable external entities entirely
        libxml_disable_entity_loader(true);
        $xml = simplexml_load_string($raw, 'SimpleXMLElement', LIBXML_NONET);
        if ($xml === false) {
            $result = "XML Parse Error:\n";
            foreach (libxml_get_errors() as $err) {
                $result .= htmlspecialchars($err->message);
            }
            libxml_clear_errors();
        } else {
            $result = htmlspecialchars($xml->asXML());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>XXE Injection (Safe) — PacketFeeder Lab</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <span class="brand">PacketFeeder Lab <span style="color:#4ecca3;">(Safe)</span></span>
        <span class="links">
            <a href="dashboard.php">Dashboard</a>
            <a href="logout.php">Logout</a>
        </span>
    </nav>
    <div class="container">
        <div class="module-banner" style="border-left-color:#4ecca3;">
            <h1 style="color:#4ecca3;">XXE Injection (Safe)</h1>
            <p class="mitre">libxml_disable_entity_loader(true) + LIBXML_NONET — external entities blocked</p>
        </div>

        <p class="info">External entity loading is disabled. DOCTYPE declarations with ENTITY are rejected.</p>

        <div class="example">
            <strong>This XXE payload will fail:</strong><br>
<pre>&lt;?xml version="1.0"?&gt;
&lt;!DOCTYPE foo [
  &lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;
]&gt;
&lt;user&gt;&lt;name&gt;&amp;xxe;&lt;/name&gt;&lt;/user&gt;</pre>
        </div>

        <form id="xxe-form">
            <label>XML Payload</label>
            <textarea id="xml-input" rows="8">&lt;user&gt;&lt;name&gt;test&lt;/name&gt;&lt;/user&gt;</textarea>
            <button type="submit" style="background:#4ecca3;">Send XML</button>
        </form>

        <pre class="result" id="xxe-result"><?= $result ?></pre>

        <script>
        document.getElementById('xxe-form').addEventListener('submit', function(e) {
            e.preventDefault();
            var xml = document.getElementById('xml-input').value;
            fetch('safe-xxe.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/xml'},
                body: xml
            })
            .then(r => r.text())
            .then(html => {
                var tmp = document.createElement('div');
                tmp.innerHTML = html;
                var pre = tmp.querySelector('#xxe-result');
                document.getElementById('xxe-result').textContent = pre ? pre.textContent : 'No result';
            });
        });
        </script>
    </div>
</body>
</html>
