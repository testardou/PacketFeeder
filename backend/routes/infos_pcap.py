from backend.config import UPLOAD_FOLDER
from core.utils.pcap_infos import pcap_infos
from flask_smorest import Blueprint
from flask import request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema


infos_pcap_bp = Blueprint("infos_pcap", __name__, url_prefix="/api")

@infos_pcap_bp.route("infos-pcap/", methods=["POST"])
@infos_pcap_bp.response(200, PcapInfoSchema)
def infos_pcap():
    file = request.form.get('file')
    packets = read_pcap(UPLOAD_FOLDER + file)
    if len(packets) == 0:
        return {"error": "Empty PCAP"}
    infos = pcap_infos(packets)
    return jsonify(infos)