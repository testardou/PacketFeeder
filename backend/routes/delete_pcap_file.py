from backend.config import UPLOAD_FOLDER
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
    
    file_path = os.path.join(UPLOAD_FOLDER, file)
    
    # Security check: ensure the file is within UPLOAD_FOLDER
    if not os.path.abspath(file_path).startswith(os.path.abspath(UPLOAD_FOLDER)):
        return jsonify({"error": "Invalid file path"}), 400
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    try:
        os.remove(file_path)
        return jsonify({"message": f"File '{file}' deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500