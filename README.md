# Packet Feeder

![Packet Feeder Logo](./assets/packetfeeder_logo_256.png)

Packet Feeder is a PCAP-based traffic replay platform designed for security research and IDS/NDR testing.

It combines a CLI and a web-based GUI to inspect, rewrite, and replay network traffic, supporting multiple replay modes, scenario-based attack simulations, and realistic lab environments.

---

## Features

### 1. PCAP File Management & Inspection

- Browse, upload, and delete PCAP files
- Inspect packet metadata and payload-related data
- Generate and upload rewritten PCAP copies with modified network fields (IPs, MACs, ports, DNS)

### 2. PCAP Replay & Live Editing

- Select, upload, and delete PCAP files
- Global traffic overview (IPs, TCP/UDP ports, DNS)
- On-the-fly traffic rewriting (IPs, ports, DNS)
- Packet and payload inspection

Replay modes:

- **Real-time** (timestamps respected)
- **Faster** (no timestamps, live progress)
- **Fastest** (full injection, tcpreplay-like)
- **Step-by-step** (packet-by-packet)

### 3. Scenario-Based Attack Simulation

- PCAP-based scenarios aligned with the MITRE ATT&CK matrix
- Replay predefined attack patterns for security testing
- Designed to simulate simple and repeatable attack scenarios

### 4. Live Network Interaction (Experimental)

- Real traffic exchange between multiple systems
- Advanced lab-oriented IDS/NDR testing

## Architecture Overview

Packet Feeder follows a modular client-server architecture designed to support both interactive and automated workflows.

- **Frontend (GUI)**  
  A web-based interface built with React, providing PCAP management, traffic inspection, replay control, and live status updates.

- **CLI**  
  A command-line interface for automation, scripting, and headless execution of replays and scenarios.

- **Backend API**  
  A Python backend based on Flask, exposing REST endpoints for PCAP management and control operations.

- **Replay Engine**  
  A Scapy-based packet injection engine responsible for replaying and rewriting traffic on a real network interface.

- **Real-Time Communication**  
  WebSocket (Socket.IO) channels used to stream replay progress, status, and control events between the backend and the GUI.

  ## Installation

Packet Feeder is composed of a Python backend and a web-based frontend.

### Backend and CLI

```bash
# Create virtual environment
python3 -m venv venv --copies
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Allow raw packet injection without running as root
sudo setcap cap_net_raw,cap_net_admin=eip ./venv/bin/python3
```

### Frontend

```bash
npm install
npm run dev
```

## KVM/libvirt + Open vSwitch Lab (PacketFeeder)

### Goal

This lab generates/replays traffic on an isolated network (lab-ovs) and captures it via a dedicated broker (no IDS engine installed). Traffic is copied with a persistent OVS mirror from lab-ovs to ids-ovs (via patch ports), then duplicated to the broker and ClearNDR using OpenFlow fanout on ids-ovs, with anti-return drop rules to prevent reinjection into the lab.

### Host components

- Debian host: KVM/libvirt + Open vSwitch.
- Bridges:
  - `br0`: **MGMT/Internet** (home LAN `192.168.1.0/24`, gateway `192.168.1.254`)
  - `lab-ovs`: **LAB** network (scenario traffic `10.10.10.0/24`)
  - `wan-ovs`: **EXTERNAL** network (simulated attacker subnet `172.16.10.0/24`)
  - `ids-ovs`: **IDS feed** network (mirrored lab traffic distribution to sensors/engines)

### VMs and NICs

- **pfSense**
  - WAN: `br0`
  - LAN: `lab-ovs` (`10.10.10.1/24`)
  - OPT1 (External): `wan-ovs` (`172.16.10.1/24`)
- **attacker-ext** (simulated external attacker)
  - MGMT: `br0`
  - EXTERNAL: `wan-ovs` (**DHCP reservation** `172.16.10.40/24`)
- **attacker**
  - MGMT: `br0`
  - LAB: `lab-ovs` (**DHCP reservation** `10.10.10.10`)
- **debian-ssh**
  - LAB: `lab-ovs` (**DHCP reservation** `10.10.10.20`)
- **debian-web**
  - LAB: `lab-ovs` (**DHCP reservation** `10.10.10.40`)
- **winsrv**
  - LAB: `lab-ovs` (Windows Server 2025 target host / Domain Controller / **DHCP reservation** `10.10.10.30`)
- **win11**
  - LAB: `lab-ovs` (Windows 11 target host / **DHCP reservation** `10.10.10.50`)
- **broker**
  - MGMT: `br0`
  - CAPTURE: `ids-ovs` (`tap-brk-ids`,UP + PROMISC, **no IP**) — PCAP capture interface (receives mirrored lab traffic via `patch-ids2lab` fan-out)
- **clearndr**
  - MGMT: `br0`
  - SENSOR: `ids-ovs` (`tap-clear-ids`, UP + PROMISC, **no IP**) — NDR engine (receives mirrored lab traffic via fan-out)
- **snort**
  - MGMT: `br0`
  - SENSOR: `ids-ovs` (`tap-snort-ids`, UP + PROMISC, **no IP**) — Snort 3 IDS engine (receives mirrored lab traffic via fan-out, 4875 rules loaded)

### DNS / Domain

- Lab domain: `packetfeeder.lab`
- DNS is provided by pfSense (Unbound) with DHCP lease registration.
  - Examples: `attacker.packetfeeder.lab` → `10.10.10.10`, `debian-ssh.packetfeeder.lab` → `10.10.10.20`

### Capture (lab-ovs -> ids-ovs)

- `lab-ovs` uses an **OVS Mirror** to copy lab traffic to the IDS bus:
  - Mirror name: `mir-lab-to-ids`
  - `select_all=true` (mirrors all traffic on `lab-ovs`)
  - `output-port`: the `lab-ovs` patch interface toward `ids-ovs` (e.g., `patch-lab2ids`)
- The copied stream crosses the patch pair:
  - `patch-lab2ids` (on `lab-ovs`) <=> `patch-ids2lab` (on `ids-ovs`)

### Distribution (ids-ovs -> sensors)

- `ids-ovs` does **explicit fan-out** using OpenFlow (no generic `FLOOD`):
  - `in_port=patch-ids2lab` -> `output:tap-bkr-ids,output:tap-clear-ids`
  - `in_port=tap-bkr-ids` -> `drop` (anti-injection)
  - `in_port=tap-clear-ids` -> `drop` (anti-injection)
  - default -> `drop` (fail-closed)

### Schema

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        MGMT / HOME LAN (192.168.1.0/24)   GW/Internet: 192.168.1.254                              │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


===================================================== br0  (MGMT bridge) =========================================================
                     |                          |                         |                            |
                     |                          |                         |                            |
        ┌────────────▼─────────────┐  ┌─────────▼─────────────┐  ┌────────▼────────────────┐  ┌────────▼─────────────────┐
        │        pfSense VM        │  │      attacker VM      │  │       broker VM         │  │     attacker-ext VM      │
        │--------------------------│  │-----------------------│  │-------------------------│  │--------------------------│
        │ WAN NIC (br0) : DHCP     │  │ MGMT NIC (br0) : DHCP │  │ MGMT NIC (br0) : DHCP   │  │ MGMT NIC (br0) : DHCP    │
        └──────────────────────────┘  └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘


==================================================== wan-ovs  (EXTERNAL bridge) ====================================================
                     |                          |
                     |                          |
        ┌────────────▼─────────────┐  ┌─────────▼────────────────┐
        │        pfSense VM        │  │     attacker-ext VM      │
        │--------------------------│  │--------------------------│
        │ OPT1 (wan-ovs):          │  │ EXTERNAL (wan-ovs):      │
        │ 172.16.10.1/24           │  │ 172.16.10.40/24          │
        └──────────────────────────┘  └──────────────────────────┘



======================================================================= lab-ovs  (LAB bridge) ==================================================================
                     |                          |                         |                            |                            |                       |
                     |                          |                         |                            |                            |                       |
        ┌────────────▼─────────────┐  ┌─────────▼─────────────┐  ┌────────▼────────────────┐  ┌────────▼────────────────┐  ┌────────▼───────────┐  ┌────────▼───────────┐
        │        pfSense VM        │  │      attacker VM      │  │     debian-ssh VM       │  │     debian-web VM       │  │   winsrv VM (DC)   │  │      win 11 VM     │
        │--------------------------│  │-----------------------│  │-------------------------│  │-------------------------│  │--------------------│  │--------------------│
        │ LAN NIC (lab-ovs):       │  │ LAB NIC (lab-ovs):    │  │ LAB NIC (lab-ovs):      │  │ LAB NIC (lab-ovs):      │  │ LAB NIC (lab-ovs): │  │ LAB NIC (lab-ovs): │
        │ 10.10.10.1/24            │  │ 10.10.10.10/24        │  │ 10.10.10.20/24          │  │ 10.10.10.40/24          │  │ 10.10.10.30/24     │  │ 10.10.10.50/24     │
        └──────────────────────────┘  └───────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  └────────────────────┘  └────────────────────┘



==================================================== ids-ovs  (IDS FEED BUS) ========================================================
                     |                             |                            |
                     |                             |                            |
        ┌────────────▼─────────────┐  ┌────────────▼────────────┐  ┌────────────▼─────────────┐
        │       broker VM          │  │       ClearNDR VM       │  │           Snort          │
        │--------------------------│  │-------------------------│  │--------------------------│
        │ SENSOR NIC (ids-ovs):    │  │ SENSOR NIC (ids-ovs):   │  │ SENSOR NIC (ids-ovs):    │
        │ tap-bkr-ids              │  │ tap-clear-ids           │  │ tap-snort-ids            │
        │ NO IP / promisc / PCAP   │  │ NO IP / promisc         │  │ NO IP / promisc          │
        └──────────────────────────┘  └─────────────────────────┘  └──────────────────────────┘

```

## Roadmap

### Lab

- [x] KVM/libvirt + Open vSwitch host (bridges: `lab-ovs`, `ids-ovs`)
- [x] pfSense routing/NAT on `lab-ovs` (`10.10.10.1/24`)
- [x] DHCP/DNS on pfSense (`packetfeeder.lab`) with reservations
- [x] Broker VM up
- [x] Selective OVS mirroring on `lab-ovs` (attacker/victims → broker CAPTURE)
- [x] Add more victims/workloads and expand mirror selection
- [x] IDS engines on `ids-ovs`
  - [x] ClearNDR
  - [x] Snort
  - [ ] Zeek

### PCAP File Management

- [x] PCAP upload, listing, and deletion
- [x] PCAP inspection and metadata extraction
- [x] Generation of rewritten PCAP copies
- [x] Traffic field rewriting (IPs, MACs, ports, DNS)

### Replay Engine

- [x] PCAP replay through real network interfaces
- [x] Multiple replay modes:
  - [x] real-time (timestamps respected)
  - [x] accelerated replay (with progress)
  - [x] full-speed injection
  - [x] step-by-step execution
- [x] Replay progress tracking and status reporting

### Scenario Mode

- [x] PCAP-based scenario definitions
- [x] Frontend scenario mode
- [ ] CLI scenario mode
- [ ] MITRE ATT&CK–aligned attack scenarios
  - [ ] Discovery (TA0007)
    - [x] T1046 — Network Service Discovery
    - [x] T1018 — Remote System Discovery
    - [x] T1087.002 — Account Discovery: Domain Account
    - [x] T1135 — Network Share Discovery
    - [ ] T1595.002 — Active Scanning: Vulnerability Scanning
      - [ ] vuln_scan_web (nikto)
      - [ ] vuln_scan_nse (nmap)
    - [ ] T1595.003 — Active Scanning: Vulnerability Scanning
      - [ ] dir_enum (ffuf / gobuster)
      - [ ] vhost_enum (ffuf)
      - [ ] param_fuzz (ffuf)
  - [ ] Credential Access (TA0006)
    - [x] T1110.001 — Brute Force: Password Guessing
    - [x] T1110.003 — Brute Force: Password Spraying
    - [x] T1110.004 — Brute Force: Credential Stuffing
    - [ ] T1110.001 — Brute Force: Password Guessing (HTTP)
    - [ ] T1110.003 — Brute Force: Password Spraying (HTTP)
    - [x] T1003 — OS Credential Dumping
    - [x] T1003.003 — OS Credential Dumping: NTDS
  - [ ] Lateral Movement (TA0008)
    - [x] T1021.001 — Remote Services: Remote Desktop Protocol
    - [x] T1021.002 — Remote Services: SMB/Windows Admin Shares
    - [x] T1021.004 — Remote Services: SSH
    - [x] T1021.006 — Remote Services: Windows Remote Management
  - [ ] Defense Evasion (TA0005)
    - [ ] T1550 — Use Alternate Authentication Material
  - [ ] Initial Access (TA0001)
    - [ ] T1190 — Exploit Public-Facing Application
      - [x] SQL Injection (error-based)
      - [x] SQL Injection (union-based)
      - [ ] Command Injection
      - [ ] XML External Entity (XXE)
      - [ ] Local File Inclusion (LFI)
      - [ ] Remote File Inclusion (RFI)
      - [ ] XSS Reflected
      - [ ] XSS Stored
  - [ ] Persistence (TA0003)
    - [ ] T1505.003 — Server Software: Web Shell Upload
    - [ ] T1505.003 — Server Software: Web Shell Execution

### Attack Builder

- [x] Compose attack chains from event PCAPs
- [x] Reorder / duplicate / remove steps
- [x] Basic pacing (delays between steps)
- [x] Build a single PCAP (merged timeline)
- [ ] Export chain config
- [x] Simple builder UI (timeline / drag-and-drop)

### Live Network Interaction

- [ ] Real traffic exchange between multiple systems
- [ ] Hybrid replay and live traffic execution
- [ ] Advanced lab-oriented workflows
