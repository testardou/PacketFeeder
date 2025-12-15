from backend.config import UPLOAD_FOLDER
from flask import request, jsonify
from flask_smorest import Blueprint
import os
from werkzeug.utils import secure_filename

upload_pcap_file_bp = Blueprint("upload_pcap_file", __name__, url_prefix="/api")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@upload_pcap_file_bp.route("/upload-pcap-file/", methods=["POST"])
def upload_pcap_file():
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)
    return jsonify({"message": "File uploaded", "filename": filename}), 200