import os
from flask import current_app, request, jsonify
from flask_smorest import Blueprint
from scapy.utils import PcapWriter
from werkzeug.utils import secure_filename
from backend.config import UPLOAD_FOLDER
from backend.utils.validate_file_path import validate_file_path, ensure_upload_folder_exists
from backend.utils.parse_rewrite_json import parse_rewrite_json
from core.replay.rewrite_packets import rewrite_packets
from core.utils.read_pcap import read_pcap


rewrite_pcap_file_bp = Blueprint("rewrite_pcap_file", __name__, url_prefix="/api")

ensure_upload_folder_exists()

@rewrite_pcap_file_bp.route("/rewrite-pcap-file/", methods=["POST"])
def rewrite_pcap_file():
    """
    Rewrite a PCAP file with modified network fields.
    
    Args:
        file: Name of the source PCAP file (form data)
        filename: Name for the new rewritten PCAP file (form data)
        rewriteIps, rewriteMacs, etc.: JSON strings with rewrite mappings (form data)
    
    Returns:
        JSON response with rewrite status
    
    Raises:
        400: If parameters are missing or invalid
        404: If source file not found
        500: If rewrite fails
    """
    current_app.logger.info("Rewrite request received")
    
    file = request.form.get("file", "")
    filename = request.form.get('filename', "")
    
    if not file or file == "":
        current_app.logger.warning("Missing file parameter")
        return jsonify({"error": "Missing file"}), 400
    if not filename or filename == "":
        current_app.logger.warning("Empty filename parameter")
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
    
    # Validate source file path securely
    file_path, error = validate_file_path(file)
    if error:
        return error
    
    if not os.path.isfile(file_path):
        current_app.logger.warning("Source file not found: %s", file_path)
        return jsonify({"error": "Source file not found"}), 404
    
    try:
        packets = read_pcap(file_path)
    except Exception as e:
        current_app.logger.error("Error reading PCAP file: %s", str(e))
        return jsonify({"error": "Error reading PCAP file"}), 500
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

    # Secure the output filename
    secure_output_name = secure_filename(filename)
    if not secure_output_name.lower().endswith(".pcap"):
        secure_output_name += ".pcap"
    
    save_path = os.path.join(UPLOAD_FOLDER, secure_output_name)
    
    try:
        writer = PcapWriter(
            save_path,
            append=False,
            sync=False,
            bufsz=8192
        )
        writer.write(packets)
        writer.close()
        
        current_app.logger.info("File rewritten successfully: %s", save_path)
        return jsonify({
            "message": "File modified and uploaded",
            "filename": secure_output_name
        }), 200
    except Exception as e:
        current_app.logger.error("Error writing rewritten PCAP: %s", str(e))
        return jsonify({"error": "Error writing rewritten PCAP file"}), 500