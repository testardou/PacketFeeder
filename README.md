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

This lab is designed to generate/replay traffic on an isolated network and capture it via a dedicated **broker** (no IDS engine installed on it). Traffic is duplicated using **selective OVS mirroring** (attacker + victims) to the broker, and will later be redistributed to detection engines (Suricata/Zeek/Snort) on a dedicated network.

### Host components

- Debian host: KVM/libvirt + Open vSwitch.
- Bridges:
  - `br0`: **MGMT/Internet** (home LAN `192.168.1.0/24`, gateway `192.168.1.254`)
  - `lab-ovs`: **LAB** network (scenario traffic `10.10.10.0/24`)
  - `ids-ovs`: **IDS feed** network (broker output to engines)

### VMs and NICs

- **pfSense**
  - WAN: `br0` (Internet access via `192.168.1.254`)
  - LAN: `lab-ovs` (`10.10.10.1/24`) + NAT
- **attacker**
  - MGMT: `br0` (administration)
  - LAB: `lab-ovs` (**DHCP reservation** `10.10.10.10`, default route via pfSense)
- **victim (debian-1)**
  - LAB only: `lab-ovs` (**DHCP reservation** `10.10.10.20`, no MGMT; reachable via SSH jump from attacker)
- **broker**
  - MGMT: `br0`
  - CAPTURE: `lab-ovs` (UP + PROMISC, **no IP**)
  - FEED: `ids-ovs` (traffic redistribution to IDS engines)

### DNS / Domain

- Lab domain: `packetfeeder.lab`
- DNS is provided by pfSense (Unbound) with DHCP lease registration.
  - Examples: `attacker.packetfeeder.lab` → `10.10.10.10`, `victim.packetfeeder.lab` → `10.10.10.20`

### Capture (OVS mirroring)

- A **selective OVS mirror** is configured on `lab-ovs`:
  - `select-src-port` / `select-dst-port`: ports of the VMs to observe (attacker + victim)
  - `output-port`: broker `lab-ovs` port (CAPTURE NIC)
- Validation: run `tcpdump` on the broker capture interface.

### Schema

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          MGMT / HOME LAN  (192.168.1.0/24)    GW/Internet: 192.168.1.254                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

============================================== br0  (host bridge / MGMT) ======================================
          |                                   |                                   |
          |                                   |                                   |
┌─────────▼────────────────────┐      ┌─────────▼─────────────────────┐      ┌─────────▼──────────────────┐
│          pfSense VM          │      │         attacker VM           │      │          broker VM         │
│------------------------------│      │-------------------------666---│      │----------------------------│
│ WAN NIC  (br0) : DHCP        │      │ MGMT NIC (br0): 192.168…      │      │ MGMT NIC (br0): DHCP       │
│ LAN NIC (lab-ovs): 10.10.10.1│      │ LAB  NIC (lab-ovs):10.10.10.10│      │ CAP  NIC (lab-ovs): NO IP  │
│ NAT: LAN -> WAN -> br0       │      │ default -> 10.10.10.1         │      │ FEED NIC (ids-ovs): (future)│
└─────────┬────────────────────┘      └─────────┬─────────────────────┘      └─────────┬──────────────────┘
          |                                     |                                      |
          |                                     |                                      |

============================= lab-ovs  (OVS bridge / LAB 10.10.10.0/24 / packetfeeder.lab) =============================
          |                                     |                                      |
          |                                     |                                      |
          |                                     |                                      |
          |                            ┌────────▼──────────────────┐                   |
          |                            │     victim VM (debian-1)  │                   |
          |                            │---------------------------│                   |
          |                            │ LAB NIC (lab-ovs):10.10.10.20│                |
          |                            │ default -> 10.10.10.1      │                  |
          |                            └────────────────────────────┘                  |
          |                                     |                                      |
          |                                     |                                      |
          |                                     |                                      |

============================================== ids-ovs  (OVS bridge / IDS FEED) ===============================================
                                                                         |
                                                                         |
                                                               ┌─────────▼──────────────────┐
                                                               │     IDS engines (future)   │
                                                               │  Suricata / Zeek / Snort   │
                                                               └────────────────────────────┘


OVS MIRROR (on lab-ovs):
  attacker(LAB) + victim(LAB)  ----------------------------------------------->  broker(CAP NIC)
  (select-src-port/select-dst-port)                                               (output-port)

```

## Roadmap

### Lab

- [x] KVM/libvirt + Open vSwitch host (bridges: `lab-ovs`, `ids-ovs`)
- [x] pfSense routing/NAT on `lab-ovs` (`10.10.10.1/24`)
- [x] DHCP/DNS on pfSense (`packetfeeder.lab`) with reservations
  - attacker: `10.10.10.10`
  - victim: `10.10.10.20`
- [x] Broker VM up (MGMT + CAPTURE + FEED)
- [x] Selective OVS mirroring on `lab-ovs` (attacker/victims → broker CAPTURE)
- [ ] Add more victims/workloads and expand mirror selection
- [ ] IDS engines on `ids-ovs` (Suricata/Zeek/Snort) + broker fan-out/redistribution

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
