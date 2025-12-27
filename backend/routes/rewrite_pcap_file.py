import os
from flask import request, jsonify
from flask_smorest import Blueprint
from scapy.utils import PcapWriter
from werkzeug.utils import secure_filename
from backend.config import UPLOAD_FOLDER
from backend.utils.parse_rewrite_json import parse_rewrite_json
from core.replay.rewrite_packets import rewrite_packets
from core.utils.read_pcap import read_pcap


rewrite_pcap_file_bp = Blueprint("rewrite_pcap_file", __name__, url_prefix="/api")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@rewrite_pcap_file_bp.route("/rewrite-pcap-file/", methods=["POST"])
def rewrite_pcap_file():
    print(request.form.get("file", ""))
    file = request.form.get("file", "")
    filename = request.form.get('filename')
    if len(file) == "":
        return jsonify({"error": "Missing file"}), 400
    if filename == "":
        return jsonify({"error": "Empty filename"}), 400
    
    # Parse all rewrite mappings
    rewrite_ips = request.form.get("rewriteIps", "")
    rewrite_macs = request.form.get("rewriteMacs", "")
    rewrite_ipv6s = request.form.get("rewriteIpv6s", "")
    rewrite_arp_ips = request.form.get("rewriteArpIps", "")
    rewrite_dns_domains = request.form.get("rewriteDnsDomains", "")
    rewrite_tcp_ports = request.form.get("rewriteTcpPorts", "")
    rewrite_udp_ports = request.form.get("rewriteUdpPorts", "")
    
    mapped_rewrite_ips = {}
    mapped_rewrite_macs = {}
    mapped_rewrite_ipv6s = {}
    mapped_rewrite_arp_ips = {}
    mapped_rewrite_dns_domains = {}
    mapped_rewrite_tcp_ports = {}
    mapped_rewrite_udp_ports = {}
    
    if len(rewrite_ips) > 0:
        mapped_rewrite_ips = parse_rewrite_json(rewrite_ips)
    if len(rewrite_macs) > 0:
        mapped_rewrite_macs = parse_rewrite_json(rewrite_macs)
    if len(rewrite_ipv6s) > 0:
        mapped_rewrite_ipv6s = parse_rewrite_json(rewrite_ipv6s)
    if len(rewrite_arp_ips) > 0:
        mapped_rewrite_arp_ips = parse_rewrite_json(rewrite_arp_ips)
    if len(rewrite_dns_domains) > 0:
        mapped_rewrite_dns_domains = parse_rewrite_json(rewrite_dns_domains)
    if len(rewrite_tcp_ports) > 0:
        mapped_rewrite_tcp_ports = parse_rewrite_json(rewrite_tcp_ports)
    if len(rewrite_udp_ports) > 0:
        mapped_rewrite_udp_ports = parse_rewrite_json(rewrite_udp_ports)
    
    file_path = os.path.join(UPLOAD_FOLDER, file)
    packets = read_pcap(file_path)
    packets = rewrite_packets(
        packets,
        ip_map=mapped_rewrite_ips,
        mac_map=mapped_rewrite_macs,
        ipv6_map=mapped_rewrite_ipv6s,
        arp_ip_map=mapped_rewrite_arp_ips,
        dns_domain_map=mapped_rewrite_dns_domains,
        tcp_port_map=mapped_rewrite_tcp_ports,
        udp_port_map=mapped_rewrite_udp_ports
    )

    save_path = os.path.join(UPLOAD_FOLDER, filename + ("" if filename.lower().endswith(".pcap") else ".pcap"))
    writer = PcapWriter(
    save_path,
    append=False,
    sync=False,
    bufsz=8192
)

    writer.write(packets)

    writer.close()
    return jsonify({"message": "File modified and uploaded", "filename": filename}), 200