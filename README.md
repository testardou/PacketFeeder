# Treat My IDS

**A treat a day keeps false negatives away.**

![Treat My IDS Logo](./assets/logo.png)

Treat My IDS is a tool designed to easily test IDS/IPS systems by replaying PCAP files, modifying IP addresses, running pre‑built scenarios stored in a folder, and even using a step‑by‑step mode that allows reading a PCAP line by line with breakpoints.

This project aims to provide a simple, flexible, and reproducible platform for validating IDS/IPS behavior in different environments.

---

## 🧪 **Testing Lab Used During Development**

To build and validate Treat My IDS, a minimal yet realistic laboratory environment was configured. It runs on a physical server using QEMU/KVM and managed through **virsh**.

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

---

(Next sections may include: project installation, usage examples, scenario structure, step‑by‑step mode, etc.)
