from backend.config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from core.utils.pcap_infos import pcap_infos
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema
import os
import logging

infos_pcap_bp = Blueprint("infos_pcap", __name__, url_prefix="/api")
logging.basicConfig(level=logging.INFO)

@infos_pcap_bp.route("infos-pcap/", methods=["GET"])
@infos_pcap_bp.response(200, PcapInfoSchema)
def infos_pcap():
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
        return {"error": "Invalid file path"}, 400

    if not os.path.isfile(file_path):
        return {"error": "File not found"}, 404
    packets = read_pcap(file_path)
    if len(packets) == 0:
        return {"error": "Empty PCAP"}
    infos = pcap_infos(packets)
    return jsonify(infos)