from backend.config import TCP_FLAG_MAP, UPLOAD_FOLDER
from backend.schemas.packet_details import PacketDetailsSchema
from core.utils.pcap_infos import pcap_infos
from flask_smorest import Blueprint
from flask import request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema
from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.l2 import ARP

PACKETS_OFFSET = 100

details_packets_pcap_bp = Blueprint("details_packets_pcap", __name__, url_prefix="/api")

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


@details_packets_pcap_bp.route("detail-packets-pcap/", methods=["POST"])
@details_packets_pcap_bp.response(200, PacketDetailsSchema(many=True))
def details_packets_pcap():
    file = request.form.get('file')
    offset = int(request.form.get('offset'))
    packet_details = []
    packets = read_pcap(UPLOAD_FOLDER + file)

    first_timestamp = packets[0].time
    
    for i, pkt in enumerate(packets):
        parsed = parse_packet(pkt, i)
        if parsed:
            parsed['timestamp'] -= first_timestamp
            packet_details.append(parsed)
    print(packet_details)
    return jsonify(packet_details)