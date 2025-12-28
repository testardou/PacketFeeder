"""
Utility functions for secure file path validation.
"""
import os
from flask import jsonify
from backend.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS


def validate_file_path(filename):
    """
    Validate a file path securely to prevent path traversal attacks.
    
    Args:
        filename: The filename to validate
        
    Returns:
        tuple: (file_path, error_response) where error_response is None if valid,
               or (jsonify_response, status_code) if invalid
    """
    if not filename:
        return None, (jsonify({"error": "No file specified"}), 400)
    
    # Normalize the filename to prevent path traversal
    filename = os.path.basename(filename)
    
    # Validate file extension
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return None, (jsonify({"error": "Invalid file type"}), 400)
    
    # Build absolute paths
    file_path = os.path.realpath(os.path.join(UPLOAD_FOLDER, filename))
    upload_path = os.path.realpath(UPLOAD_FOLDER)
    
    # Ensure the file path is within the upload directory (prevent path traversal)
    if not file_path.startswith(upload_path + os.sep) and file_path != upload_path:
        return None, (jsonify({"error": "Invalid file path"}), 400)
    
    return file_path, None


def ensure_upload_folder_exists():
    """
    Ensure the upload folder exists, creating it if necessary.
    """
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

