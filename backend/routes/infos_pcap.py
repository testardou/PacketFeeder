from backend.utils.validate_file_path import validate_file_path_auto
from core.pcap.pcap_infos import pcap_infos
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
from core.pcap.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema

infos_pcap_bp = Blueprint("infos_pcap", __name__, url_prefix="/api")

@infos_pcap_bp.route("infos-pcap/", methods=["GET"])
@infos_pcap_bp.response(200, PcapInfoSchema)
def infos_pcap():
    """
    Get general information about a PCAP file.
    
    Args:
        file: Name of the PCAP file (query parameter)
    
    Returns:
        JSON response with PCAP information
    
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
    
    # Validate file path securely (handles both UPLOAD_FOLDER files and mitre datasets)
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
    
    infos = pcap_infos(packets)
    return jsonify(infos)