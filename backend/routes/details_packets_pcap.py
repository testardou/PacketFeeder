from backend.config import ALLOWED_EXTENSIONS, TCP_FLAG_MAP, UPLOAD_FOLDER
from backend.schemas.packet_details import PacketDetailsSchema
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema
from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.l2 import ARP
import os

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


@details_packets_pcap_bp.route("detail-packets-pcap/", methods=["GET"])
@details_packets_pcap_bp.response(200, PacketDetailsSchema(many=True))
def details_packets_pcap():
    current_app.logger.info("Request received: %s", request.args)
    file = request.args.get("file")

    if not file:
        current_app.logger.warning("No file parameter provided")
        return jsonify({"error": "No file specified"}), 400
    
    filename = os.path.basename(file)
    
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        current_app.logger.warning("Invalid extension: %s", ext)
        return {"error": "Invalid file type"}, 400
    
    file_path = os.path.realpath(os.path.join(UPLOAD_FOLDER, filename))
    upload_path = os.path.realpath(UPLOAD_FOLDER)

    if not file_path.startswith(upload_path + os.sep):
        current_app.logger.warning("Invalid file path: %s", file_path)
        return {"error": "Invalid file path"}, 400

    if not os.path.isfile(file_path):
        current_app.logger.warning("File not found : %s", file_path)
        return {"error": "File not found"}, 404
    
    packet_details = []
    packets = read_pcap(file_path)

    first_timestamp = packets[0].time
    
    for i, pkt in enumerate(packets):
        parsed = parse_packet(pkt, i)
        if parsed:
            parsed['timestamp'] -= first_timestamp
            packet_details.append(parsed)
    return jsonify(packet_details)