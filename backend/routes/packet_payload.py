from backend.schemas.packet_payload import PacketPayloadSchema
from backend.utils.validate_file_path import validate_file_path_auto
from core.pcap_infos.payload_packet import payload_packet
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
from core.utils.read_pcap import read_pcap
import os


packet_payload_bp = Blueprint("packet_payload", __name__, url_prefix="/api")


@packet_payload_bp.route("packet-payload/", methods=["GET"])
@packet_payload_bp.response(200, PacketPayloadSchema)
def packet_payload():
    """
    Get the payload of a specific packet from a PCAP file.
    
    Args:
        file: Name of the PCAP file (query parameter)
        id: Packet index (0-based, query parameter)
    
    Returns:
        JSON response with packet payload in hex format
    
    Raises:
        400: If file or id is missing or invalid
        404: If file not found or packet index out of range
    """
    current_app.logger.info("Request received: %s", request.args)
    
    file = request.args.get("file")
    packet_id = request.args.get("id", type=int)

    if not file or packet_id is None:
        current_app.logger.warning("Missing file or id parameter")
        return jsonify({"error": "Missing file or id"}), 400

    # Validate file path securely (handles both UPLOAD_FOLDER files and scenario datasets)
    file_path, error = validate_file_path_auto(file)
    if error:
        return error

    try:
        packets = read_pcap(file_path)
    except Exception as e:
        current_app.logger.error("Error reading PCAP file: %s", str(e))
        return jsonify({"error": "Error reading PCAP file"}), 500

    index = packet_id

    if index < 0 or index >= len(packets):
        current_app.logger.warning("Packet index out of range: %d (total: %d)", index, len(packets))
        return jsonify({"error": "Packet index out of range"}), 404

    pkt = packets[index]
    hex_payload = payload_packet(pkt)

    return jsonify({
        "payload": hex_payload,
    })
