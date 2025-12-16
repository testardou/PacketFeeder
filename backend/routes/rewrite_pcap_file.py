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
    rewrite_ips = request.form.get("rewriteIps", "")
    rewrite_macs = request.form.get("rewriteMacs", "")
    if len(rewrite_ips) > 0:
        mapped_rewrite_ips = parse_rewrite_json(rewrite_ips)
    if len(rewrite_macs) > 0:
        mapped_rewrite_macs = parse_rewrite_json(rewrite_macs)
    file_path = os.path.join(UPLOAD_FOLDER, file)
    packets = read_pcap(file_path)
    packets = rewrite_packets(packets, ip_map=mapped_rewrite_ips, mac_map=mapped_rewrite_macs)

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