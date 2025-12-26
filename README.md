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

## Roadmap

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

- [ ] PCAP-based scenario definitions
- [ ] MITRE ATT&CK–aligned attack scenarios
- [ ] Repeatable and deterministic scenario execution

### Live Network Interaction

- [ ] Real traffic exchange between multiple systems
- [ ] Hybrid replay and live traffic execution
- [ ] Advanced lab-oriented workflows
