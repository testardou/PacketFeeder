from backend.utils.validate_file_path import validate_file_path_auto
from backend.schemas.packet_details import PacketDetailsSchema
from core.pcap_infos.parse_packet import parse_packet
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
from core.utils.read_pcap import read_pcap
import os

details_packets_pcap_bp = Blueprint("details_packets_pcap", __name__, url_prefix="/api")


@details_packets_pcap_bp.route("detail-packets-pcap/", methods=["GET"])
@details_packets_pcap_bp.response(200, PacketDetailsSchema(many=True))
def details_packets_pcap():
    """
    Get detailed information about all packets in a PCAP file.
    
    Args:
        file: Name of the PCAP file (query parameter)
    
    Returns:
        JSON response with list of packet details
    
    Raises:
        400: If file is missing or invalid
        404: If file not found
        500: If error reading PCAP
    """
    current_app.logger.info("Request received: %s", request.args)
    file = request.args.get("file")

    if not file:
        current_app.logger.warning("No file parameter provided")
        return jsonify({"error": "No file specified"}), 400
    
    # Validate file path securely (handles both UPLOAD_FOLDER files and scenario datasets)
    file_path, error = validate_file_path_auto(file)
    if error:
        return error
    
    try:
        packets = read_pcap(file_path)
    except Exception as e:
        current_app.logger.error("Error reading PCAP file: %s", str(e))
        return jsonify({"error": "Error reading PCAP file"}), 500
    
    if len(packets) == 0:
        current_app.logger.warning("Empty PCAP: %s", file_path)
        return jsonify({"error": "Empty PCAP"}), 400

    packet_details = []
    first_timestamp = packets[0].time
    
    for i, pkt in enumerate(packets):
        parsed = parse_packet(pkt, i)
        if parsed:
            parsed['timestamp'] -= first_timestamp
            packet_details.append(parsed)
    
    return jsonify(packet_details)