# Packet Feeder

**A treat a day keeps false negatives away.**

![Packet Feeder Logo](./assets/logo.png)

Packet Feeder is a tool designed to easily test IDS/IPS systems by replaying PCAP files, modifying IP addresses, running pre‑built scenarios stored in a folder, and even using a step‑by‑step mode that allows reading a PCAP line by line with breakpoints.

This project aims to provide a simple, flexible, and reproducible platform for validating IDS/IPS behavior in different environments.

---

## 🧰 **Project Modes**

Packet Feeder provides multiple operating modes to cover a wide range of IDS/IPS testing needs:

### **1. Classic Replay Mode (tcpreplay‑like)**

Replays a PCAP directly on a chosen network interface, similar to `tcpreplay`. Ideal for:

- Simple tests
- Checking Suricata/Snort rule matches
- Replaying attack PCAPs at full speed or throttled

### **2. Two‑Host Interactive Replay Mode**

In this mode, two VMs (client/server) exchange real packets while the tool replays the PCAP:

- Packets are rebuilt and re‑sent live
- Both machines actually communicate during the replay
- Useful for testing detections that depend on real TCP handshakes, timing, or multi‑step flows

### **3. Scenario Mode (Simple Attack Simulations)**

A collection of small, predefined scenarios, each stored as a folder:

- Single HTTP request
- SSH brute‑force attempt
- DNS or ICMP probes
- Small attack chains

These scenarios allow quick validation of IDS coverage without handling large PCAP files.

### **4. Step‑by‑Step Mode (Breakpoint/Line‑by‑Line)**

Provides complete control over the replay process:

- Process a PCAP packet‑by‑packet
- Add breakpoints at specific packets or protocol layers
- Inspect or modify the live replay sequence
- Useful for debugging, teaching, or reverse engineering detection behavior

---

---

## 🧪 **Testing Lab Used During Development**

To build and validate Packet Feeder, a minimal yet realistic laboratory environment was configured. It runs on a physical server using QEMU/KVM and managed through **virsh**.

### **Lab Architecture**

- **Hypervisor:** QEMU/KVM
- **Management:** virsh
- **Number of VMs:** 2

### **Virtual Machines**

1. **ClearNDR**

   - Role: IDS/IPS (Suricata‑based)
   - Network interface connected to the host's bridge

2. **“Enterprise PC” VM**

   - Role: a simulated workstation inside a corporate network
   - Used as the source to replay PCAP files

### **Lab Network**

- Linux **bridge** on the host (br0)
- Both VMs attached to this bridge
- **Port mirroring** configured:

  - **Ingress + Egress** traffic from the Enterprise PC VM is mirrored to the ClearNDR VM
  - Allows capturing all traffic produced by the PCAP replays

This creates a realistic environment for validating IDS detection capabilities.

## 🏗️ Project Architecture Overview

Packet Feeder is composed of three main parts that work together to provide a full PCAP replay and IDS testing environment.

---

## 🎨 Frontend — React Application

The frontend is built using **React**, providing an intuitive and interactive interface for controlling replay operations.

### **Main Responsibilities**

- Uploading PCAP files
- Selecting interfaces and replay modes
- Controlling the replay in real time (Start / Stop / Pause / Step)
- Displaying replay progress, statistics, and upcoming features such as:
  - Live packet timeline
  - Protocol layers decoding
  - Scenario configuration

### ⚡ **Communication Layer**

- Uses **Socket.IO client** for real-time communication
- Uses **REST endpoints** for file upload and metadata extraction

React manages all user interactions while the backend executes the replay logic.

---

## ⚙️ Backend — Flask + Flask-SocketIO

The backend is implemented with **Flask**, with **Flask-SocketIO** providing real-time capabilities.

### **Backend Responsibilities**

- Provide REST API endpoints:

  - Upload PCAP files
  - Extract metadata
  - Trigger replay modes

- Provide a WebSocket control channel:

  - Manage session IDs (`sid`)
  - Events like `start_replay`, `stop_replay`
  - Maintain per-client replay state (`should_run[sid]`)
  - Future: live updates during replay (packet index, timestamps…)

- Interface with the packet replay engine located inside the `core/` directory.

---

## 🖥️ Command-Line Tool (CLI)

A Python-based CLI is included to allow packet replay without the web interface.

### **CLI Capabilities**

- Classic PCAP replay on any interface
- Scenario replay mode
- Speed selection (Real Time, Faster, Fastest)
- Verbose and debug output
- Step-by-step replay or breakpoints

This is ideal for automation, CI pipelines, or local testing.

---

## 🚀 Replay Speeds

Packet Feeder provides three replay speeds, each optimized for a different use case.

### **1. Real-Time Mode**

Replay follows the **original timestamps** from the PCAP:

- Respects inter-packet delays
- Produces realistic traffic pacing
- Allows IDS/IPS to behave as if the traffic were live

**Ideal for:**  
Testing Suricata/Snort accuracy under real-world timing.

---

### **2. Faster Mode (Packet-by-Packet)**

Replay sends packets **one by one**, but **ignores timestamps**:

- No inter-packet wait
- Still passes each packet through Python logic
- Allows precise tracking, logging and control

**Ideal for:**  
Debugging, step-by-step replay, teaching.

---

### **3. Fastest Mode (Bulk Replay)**

The entire PCAP is replayed **as fast as the system allows**:

- Avoids Python per-packet loops
- Sends traffic in bulk
- Maximum throughput

**Ideal for:**  
Stress testing or quickly generating alerts on large PCAPs.

---

## 🧬 Core Engine — Scapy-Based PCAP Processing

At the core of Packet Feeder lies a replay engine powered by **Scapy**.

### **Why Scapy?**

- Flexible PCAP parsing
- Easy packet modification
- Timestamp accuracy when needed
- Native packet sending (`sendp`)
- Protocol introspection
- Automatic checksum recalculation

## 🐍 Python Environment & Permissions

Packet Feeder includes Python components (CLI + core replay engine).  
To run them correctly, you must first install dependencies and allow Python to send raw packets.

### **1. Create a Virtual Environment**

```bash
python3 -m venv venv --copies
source venv/bin/activate
```

### **2. Install Requirements\***

```bash
pip install -r requirements.txt
```

### **3. Grant Permissions to Send Packets\***

Scapy requires raw socket capabilities to replay traffic on an interface.
Instead of running Python as root, Packet Feeder uses Linux capabilities:

```bash
sudo setcap cap_net_raw,cap_net_admin=eip ./venv/bin/python3
```
