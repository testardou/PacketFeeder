from backend.config import ALLOWED_EXTENSIONS,  UPLOAD_FOLDER
from backend.schemas.packet_details import PacketDetailsSchema
from core.pcap_infos.parse_packet import parse_packet
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema

import os

details_packets_pcap_bp = Blueprint("details_packets_pcap", __name__, url_prefix="/api")


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