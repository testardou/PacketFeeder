from backend.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from backend.schemas.pcap_files_schema import PcapFilesSchema
from flask import current_app, jsonify
from flask_smorest import Blueprint
from os import listdir
from os.path import isfile, join


get_pcap_files_bp = Blueprint("get_pcap_files", __name__, url_prefix="/api")

@get_pcap_files_bp.route("/get-pcap-files/", methods=["GET"])
@get_pcap_files_bp.response(200, PcapFilesSchema)
def get_pcap_files():
    """
    Get list of all PCAP files available on the server.
    
    Returns:
        JSON response with list of PCAP filenames
    
    Raises:
        500: If error reading directory
    """
    current_app.logger.info("Get PCAP files request received")
    
    try:
        pcap_files = [
            f for f in listdir(UPLOAD_FOLDER)
            if isfile(join(UPLOAD_FOLDER, f))
            and any(f.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)
        ]
        current_app.logger.info("Found %d PCAP files", len(pcap_files))
        return jsonify({"files": pcap_files})
    except Exception as e:
        current_app.logger.error("Error listing PCAP files: %s", str(e))
        return jsonify({"error": "Error listing PCAP files"}), 500