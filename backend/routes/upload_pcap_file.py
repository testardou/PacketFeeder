from backend.config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from backend.utils.validate_file_path import ensure_upload_folder_exists
from flask import current_app, request, jsonify
from flask_smorest import Blueprint
from werkzeug.utils import secure_filename
import os

upload_pcap_file_bp = Blueprint("upload_pcap_file", __name__, url_prefix="/api")

ensure_upload_folder_exists()

@upload_pcap_file_bp.route("/upload-pcap-file/", methods=["POST"])
def upload_pcap_file():
    """
    Upload a PCAP file to the server.
    
    Args:
        file: PCAP file to upload (multipart/form-data)
    
    Returns:
        JSON response with upload status and filename
    
    Raises:
        400: If file is missing, empty, or invalid type
        409: If file already exists
        500: If upload fails
    """
    current_app.logger.info("Upload request received")
    
    if "file" not in request.files:
        current_app.logger.warning("No file in request")
        return jsonify({"error": "Missing file"}), 400

    file = request.files["file"]

    if file.filename == "":
        current_app.logger.warning("Empty filename in upload request")
        return jsonify({"error": "Empty filename"}), 400

    original_name = secure_filename(file.filename)

    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        current_app.logger.warning("Invalid file type: %s", ext)
        return jsonify({"error": "Invalid file type"}), 400
    
    file_path = os.path.realpath(os.path.join(UPLOAD_FOLDER, original_name))

    if os.path.isfile(file_path):
        current_app.logger.warning("File already exists: %s", file_path)
        return jsonify({"error": "File already exists"}), 409

    try:
        file.save(file_path)
        current_app.logger.info("File uploaded successfully: %s", file_path)
        return jsonify({
            "message": "File uploaded successfully",
            "filename": original_name
        }), 200
    except Exception as e:
        current_app.logger.error("Error saving file: %s", str(e))
        return jsonify({"error": "Error saving file"}), 500
