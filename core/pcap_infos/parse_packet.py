from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.l2 import ARP

def tcp_flags_to_str(flags):
    return ",".join(TCP_FLAG_MAP.get(f, f) for f in str(flags))

def parse_tcp_packet(pkt, index=None):
    ip = pkt.getlayer(IP)
    tcp = pkt.getlayer(TCP)

    if not ip or not tcp:
        return None

    payload = bytes(tcp.payload)
    has_payload = len(payload) > 0

    return {
        "id": index,
        "timestamp": pkt.time,
        "proto": "TCP",
        "src": ip.src,
        "dst": ip.dst,
        "sport": tcp.sport,
        "dport": tcp.dport,
        "length": len(pkt),
        "has_payload": has_payload,
        "payload_len": len(payload),
    }

def parse_udp_packet(pkt, index=None):
    ip = pkt.getlayer(IP)
    udp = pkt.getlayer(UDP)

    if not ip or not udp:
        return None

    payload = bytes(udp.payload)
    has_payload = len(payload) > 0

    return {
        "id": index,
        "timestamp": pkt.time,
        "proto": "UDP",
        "src": ip.src,
        "dst": ip.dst,
        "sport": udp.sport,
        "dport": udp.dport,
        "length": len(pkt),
        "has_payload": has_payload,
        "payload_len": len(payload),
    }

def parse_icmp_packet(pkt, index=None):
    ip = pkt.getlayer(IP)
    icmp = pkt.getlayer(ICMP)

    if not ip or not icmp:
        return None

    payload = bytes(icmp.payload)
    has_payload = len(payload) > 0

    return {
        "id": index,
        "timestamp": pkt.time,
        "proto": "ICMP",
        "src": ip.src,
        "dst": ip.dst,
        "sport": None,
        "dport": None,
        "length": len(pkt),
        "has_payload": has_payload,
        "payload_len": len(payload),
    }

def parse_arp_packet(pkt, index=None):
    arp = pkt.getlayer(ARP)

    if not arp:
        return None

    return {
        "id": index,
        "timestamp": pkt.time,
        "proto": "ARP",
        "src": arp.psrc,
        "dst": arp.pdst,
        "sport": None,
        "dport": None,
        "length": len(pkt),
        "has_payload": False,
        "payload_len": 0,
    }

def parse_ip_other(pkt, index=None):
    ip = pkt.getlayer(IP)
    if not ip:
        return None

    return {
        "id": index,
        "timestamp": pkt.time,
        "proto": f"IP({ip.proto})",
        "src": ip.src,
        "dst": ip.dst,
        "sport": None,
        "dport": None,
        "length": len(pkt),
        "has_payload": False,
        "payload_len": 0,
    }

def parse_packet(pkt, index):
    if pkt.haslayer(TCP):
        return parse_tcp_packet(pkt, index)
    if pkt.haslayer(UDP):
        return parse_udp_packet(pkt, index)
    if pkt.haslayer(ICMP):
        return parse_icmp_packet(pkt, index)
    if pkt.haslayer(ARP):
        return parse_arp_packet(pkt, index)
    if pkt.haslayer(IP):
        return parse_ip_other(pkt, index)
    return None