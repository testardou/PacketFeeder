from backend.config import UPLOAD_FOLDER
from backend.schemas.pcap_files_schema import PcapFilesSchema
from flask import request, jsonify
from scapy.all import get_if_list, conf
from flask_smorest import Blueprint
from os import listdir
from os.path import isfile, join


get_pcap_files_bp = Blueprint("get_pcap_files", __name__, url_prefix="/api")
@get_pcap_files_bp.route("/get-pcap-files/", methods=["GET"])
@get_pcap_files_bp.response(200, PcapFilesSchema)
def get_pcap_files():
    onlyfiles = [f for f in listdir(UPLOAD_FOLDER) if isfile(join(UPLOAD_FOLDER, f)) and f.endswith(".pcap")]
    return jsonify({"files": onlyfiles})