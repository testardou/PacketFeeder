from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.l2 import ARP

def payload_packet(pkt):
    """
    Extract payload from packet based on protocol layer.
    Returns hex string of payload, or empty string if no payload.
    """
    # Try to get payload from the appropriate protocol layer
    if pkt.haslayer(TCP):
        tcp = pkt.getlayer(TCP)
        if tcp:
            raw_payload = bytes(tcp.payload)
            return raw_payload.hex()
    elif pkt.haslayer(UDP):
        udp = pkt.getlayer(UDP)
        if udp:
            raw_payload = bytes(udp.payload)
            return raw_payload.hex()
    elif pkt.haslayer(ICMP):
        icmp = pkt.getlayer(ICMP)
        if icmp:
            raw_payload = bytes(icmp.payload)
            return raw_payload.hex()
    elif pkt.haslayer(IP):
        # For other IP protocols, try to get payload from IP layer
        ip = pkt.getlayer(IP)
        if ip and ip.payload:
            raw_payload = bytes(ip.payload)
            return raw_payload.hex()
    
    # Fallback: try to get payload from packet directly
    if hasattr(pkt, 'payload') and pkt.payload:
        try:
            raw_payload = bytes(pkt.payload)
            return raw_payload.hex()
        except Exception:
            pass
    
    # No payload found
    return ""