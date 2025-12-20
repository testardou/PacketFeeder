from backend.config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from flask_smorest import Blueprint
from flask import request, jsonify
import os

delete_pcap_file_bp = Blueprint("delete_pcap_file", __name__, url_prefix="/api")

@delete_pcap_file_bp.route("delete-pcap-file/", methods=["DELETE"])
@delete_pcap_file_bp.response(200)
def delete_pcap_file():
    file = request.form.get('file')
    
    if not file:
        return jsonify({"error": "No file specified"}), 400
    
    filename = os.path.basename(file)
    
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return {"error": "Invalid file type"}, 400
    
    file_path = os.path.realpath(os.path.join(UPLOAD_FOLDER, filename))
    upload_path = os.path.realpath(UPLOAD_FOLDER)

    if not file_path.startswith(upload_path + os.sep):
        return {"error": "Invalid file path"}, 400

    if not os.path.isfile(file_path):
        return {"error": "File not found"}, 404
    
    try:
        os.remove(file_path)
        return jsonify({"message": f"File '{filename}' deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500