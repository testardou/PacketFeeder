from backend.config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from flask import request, jsonify
from flask_smorest import Blueprint
from werkzeug.utils import secure_filename
import os
import uuid

upload_pcap_file_bp = Blueprint("upload_pcap_file", __name__, url_prefix="/api")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@upload_pcap_file_bp.route("/upload-pcap-file/", methods=["POST"])
def upload_pcap_file():
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    original_name = secure_filename(file.filename)

    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": "Invalid file type"}), 400
    
    file_path = os.path.realpath(os.path.join(UPLOAD_FOLDER, original_name))

    if os.path.isfile(file_path):
        return {"error": "File already exist"}, 400


    file.save(file_path)

    return jsonify({
        "message": "File uploaded",
        "filename": original_name
    }), 200
