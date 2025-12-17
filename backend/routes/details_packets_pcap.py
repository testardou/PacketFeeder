from backend.config import TCP_FLAG_MAP, UPLOAD_FOLDER
from backend.schemas.packet_details import PacketDetailsSchema
from core.utils.pcap_infos import pcap_infos
from flask_smorest import Blueprint
from flask import request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema
from scapy.layers.inet import IP, TCP

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
        "proto": "TCP",
        "src": ip.src,
        "dst": ip.dst,
        "sport": tcp.sport,
        "dport": tcp.dport,
        "flags": tcp_flags_to_str(tcp.flags),
        "seq": tcp.seq,
        "ack": tcp.ack,
        "length": len(pkt),
        "has_payload": has_payload,
        "payload_len": len(payload),
    }

@details_packets_pcap_bp.route("detail-packets-pcap/", methods=["POST"])
@details_packets_pcap_bp.response(200, PacketDetailsSchema)
def details_packets_pcap():
    file = request.form.get('file')
    offset = int(request.form.get('offset'))
    packet_details = []
    packets = read_pcap(UPLOAD_FOLDER + file)
    
    for i, pkt in enumerate(packets):
        if i >= offset:
            break
        parsed = parse_tcp_packet(pkt, i + 1)
        if parsed:
            packet_details.append(parsed)
    print(packet_details)
    return jsonify(packet_details)