from backend.utils.validate_file_path import validate_file_path
from flask_smorest import Blueprint
from flask import current_app, request, jsonify
import os

delete_pcap_file_bp = Blueprint("delete_pcap_file", __name__, url_prefix="/api")

@delete_pcap_file_bp.route("delete-pcap-file/", methods=["DELETE"])
@delete_pcap_file_bp.response(200)
def delete_pcap_file():
    """
    Delete a PCAP file from the server.
    
    Args:
        file: Name of the file to delete (form data)
    
    Returns:
        JSON response with deletion status
    
    Raises:
        400: If file is missing or invalid
        404: If file not found
        403: If permission denied
        500: If deletion fails
    """
    current_app.logger.info("Delete request received: %s", request.form)
    
    file = request.form.get('file')
    
    if not file:
        current_app.logger.warning("No file parameter provided")
        return jsonify({"error": "No file specified"}), 400
    
    # Validate file path securely
    file_path, error = validate_file_path(file)
    if error:
        return error

    if not os.path.isfile(file_path):
        current_app.logger.warning("File not found: %s", file_path)
        return jsonify({"error": "File not found"}), 404
    
    try:
        os.remove(file_path)
        current_app.logger.info("File deleted successfully: %s", file_path)
        return jsonify({
            "message": "File deleted successfully",
            "filename": file
        }), 200
    except PermissionError:
        current_app.logger.error("Permission denied deleting file: %s", file_path)
        return jsonify({"error": "Permission denied"}), 403
    except Exception as e:
        current_app.logger.error("Unexpected error deleting file %s: %s", file_path, str(e))
        return jsonify({"error": "Internal server error"}), 500