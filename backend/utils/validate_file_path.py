"""
Utility functions for secure file path validation.
"""
import os
from flask import jsonify
from backend.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS, PROJECT_ROOT


def validate_file_path(filename):
    """
    Validate a file path securely to prevent path traversal attacks.
    Validates files in UPLOAD_FOLDER only.
    
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


def validate_scenario_file_path(file_path):
    """
    Validate a scenario PCAP file path (can be relative to PROJECT_ROOT).
    Used for datasets that may be in pcaps/techniques/ directories.
    
    Args:
        file_path: The file path (can be relative or absolute)
        
    Returns:
        tuple: (file_path, error_response) where error_response is None if valid,
               or (jsonify_response, status_code) if invalid
    """
    if not file_path:
        return None, (jsonify({"error": "No file specified"}), 400)
    
    # Validate file extension
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return None, (jsonify({"error": "Invalid file type"}), 400)
    
    # Resolve path relative to PROJECT_ROOT if not absolute
    if os.path.isabs(file_path):
        full_path = os.path.realpath(file_path)
    else:
        full_path = os.path.realpath(os.path.join(PROJECT_ROOT, file_path))
    
    project_root_real = os.path.realpath(PROJECT_ROOT)
    
    # Ensure the file path is within the project root (prevent path traversal)
    if not full_path.startswith(project_root_real + os.sep) and full_path != project_root_real:
        return None, (jsonify({"error": "Invalid file path"}), 400)
    
    if not os.path.isfile(full_path):
        return None, (jsonify({"error": "File not found"}), 404)
    
    return full_path, None


def validate_file_path_auto(file_input):
    """
    Automatically detect and validate file path.
    If file contains '/' or starts with 'pcaps/', treat as scenario path.
    Otherwise, treat as simple filename in UPLOAD_FOLDER.
    
    Args:
        file_input: The file path or filename
        
    Returns:
        tuple: (file_path, error_response) where error_response is None if valid,
               or (jsonify_response, status_code) if invalid
    """
    if not file_input:
        return None, (jsonify({"error": "No file specified"}), 400)
    
    # Check if file is a dataset path (contains '/' or starts with 'pcaps/')
    if "/" in file_input or file_input.startswith("pcaps/"):
        # This is a dataset path, use scenario validation
        return validate_scenario_file_path(file_input)
    else:
        # This is a simple filename in UPLOAD_FOLDER
        return validate_file_path(file_input)


def ensure_upload_folder_exists():
    """
    Ensure the upload folder exists, creating it if necessary.
    """
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

