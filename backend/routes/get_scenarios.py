"""
Routes for managing MITRE ATT&CK scenarios.
"""
import os
import json
from flask import current_app, jsonify
from flask_smorest import Blueprint
from backend.config import PROJECT_ROOT

get_scenarios_bp = Blueprint("get_scenarios", __name__, url_prefix="/api")

SCENARIOS_ROOT = os.path.join(PROJECT_ROOT, "scenarios")


@get_scenarios_bp.route("/get-tactics/", methods=["GET"])
def get_tactics():
    """
    Get list of available tactics.
    
    Returns:
        JSON response with list of tactic files
    """
    current_app.logger.info("Get tactics request received")
    
    try:
        tactics_dir = os.path.join(SCENARIOS_ROOT, "tactics")
        if not os.path.isdir(tactics_dir):
            return jsonify({"files": []})
        
        tactic_files = [
            f for f in os.listdir(tactics_dir)
            if os.path.isfile(os.path.join(tactics_dir, f)) and f.endswith(".json")
        ]
        current_app.logger.info("Found %d tactic files", len(tactic_files))
        return jsonify({"files": tactic_files})
    except Exception as e:
        current_app.logger.error("Error listing tactics: %s", str(e))
        return jsonify({"error": "Error listing tactics"}), 500


@get_scenarios_bp.route("/get-tactic/<tactic_file>", methods=["GET"])
def get_tactic(tactic_file):
    """
    Get tactic data by filename.
    
    Args:
        tactic_file: Name of the tactic JSON file
    
    Returns:
        JSON response with tactic data
    """
    current_app.logger.info("Get tactic request: %s", tactic_file)
    
    try:
        # Security: ensure filename is safe
        tactic_file = os.path.basename(tactic_file)
        if not tactic_file.endswith(".json"):
            return jsonify({"error": "Invalid file format"}), 400
        
        tactic_path = os.path.join(SCENARIOS_ROOT, "tactics", tactic_file)
        
        if not os.path.isfile(tactic_path):
            return jsonify({"error": "Tactic not found"}), 404
        
        # Ensure file is within tactics directory (prevent path traversal)
        tactics_dir = os.path.realpath(os.path.join(SCENARIOS_ROOT, "tactics"))
        if not os.path.realpath(tactic_path).startswith(tactics_dir + os.sep):
            return jsonify({"error": "Invalid file path"}), 400
        
        with open(tactic_path, "r") as f:
            tactic_data = json.load(f)
        
        return jsonify(tactic_data)
    except json.JSONDecodeError:
        current_app.logger.error("Invalid JSON in tactic file: %s", tactic_file)
        return jsonify({"error": "Invalid JSON file"}), 400
    except Exception as e:
        current_app.logger.error("Error reading tactic: %s", str(e))
        return jsonify({"error": "Error reading tactic"}), 500


@get_scenarios_bp.route("/get-technique/<technique_id>", methods=["GET"])
def get_technique(technique_id):
    """
    Get technique data by ID.
    
    Args:
        technique_id: MITRE technique ID (e.g., T1046)
    
    Returns:
        JSON response with technique data
    """
    current_app.logger.info("Get technique request: %s", technique_id)
    
    try:
        # Security: ensure technique_id is safe
        technique_id = technique_id.upper().strip()
        if not technique_id.startswith("T") or not technique_id[1:].isdigit():
            return jsonify({"error": "Invalid technique ID format"}), 400
        
        techniques_dir = os.path.join(SCENARIOS_ROOT, "techniques")
        if not os.path.isdir(techniques_dir):
            return jsonify({"error": "Techniques directory not found"}), 404
        
        # Find technique file matching the ID
        technique_files = [
            f for f in os.listdir(techniques_dir)
            if f.startswith(technique_id + "_") and f.endswith(".json")
        ]
        
        if not technique_files:
            return jsonify({"error": "Technique not found"}), 404
        
        # Use the first matching file
        technique_file = technique_files[0]
        technique_path = os.path.join(techniques_dir, technique_file)
        
        # Ensure file is within techniques directory
        techniques_dir_real = os.path.realpath(techniques_dir)
        if not os.path.realpath(technique_path).startswith(techniques_dir_real + os.sep):
            return jsonify({"error": "Invalid file path"}), 400
        
        with open(technique_path, "r") as f:
            technique_data = json.load(f)
        
        return jsonify(technique_data)
    except json.JSONDecodeError:
        current_app.logger.error("Invalid JSON in technique file: %s", technique_id)
        return jsonify({"error": "Invalid JSON file"}), 400
    except Exception as e:
        current_app.logger.error("Error reading technique: %s", str(e))
        return jsonify({"error": "Error reading technique"}), 500


@get_scenarios_bp.route("/get-technique-pcaps/<technique_id>", methods=["GET"])
def get_technique_pcaps(technique_id):
    """
    Get PCAP datasets for a specific technique.
    
    Args:
        technique_id: MITRE technique ID
    
    Returns:
        JSON response with list of PCAP datasets (new format) or files (legacy format)
    """
    current_app.logger.info("Get technique PCAPs request: %s", technique_id)
    
    try:
        # Get technique data first
        technique_id = technique_id.upper().strip()
        techniques_dir = os.path.join(SCENARIOS_ROOT, "techniques")
        
        technique_files = [
            f for f in os.listdir(techniques_dir)
            if f.startswith(technique_id + "_") and f.endswith(".json")
        ]
        
        if not technique_files:
            return jsonify({"error": "Technique not found"}), 404
        
        technique_path = os.path.join(techniques_dir, technique_files[0])
        with open(technique_path, "r") as f:
            technique_data = json.load(f)
        
        # Check for new format with datasets
        if "datasets" in technique_data and "pcaps" in technique_data["datasets"]:
            datasets = technique_data["datasets"]["pcaps"]
            current_app.logger.info("Found %d PCAP datasets for technique %s", len(datasets), technique_id)
            return jsonify({"datasets": datasets})
        
        # Legacy format: use pcaps_path
        pcaps_path = technique_data.get("pcaps_path", "")
        if not pcaps_path:
            return jsonify({"files": [], "datasets": []})
        
        # Resolve PCAP path relative to project root
        if pcaps_path.startswith("/"):
            full_pcaps_path = pcaps_path
        else:
            full_pcaps_path = os.path.join(PROJECT_ROOT, pcaps_path)
        
        if not os.path.isdir(full_pcaps_path):
            current_app.logger.warning("PCAP directory not found: %s", full_pcaps_path)
            return jsonify({"files": [], "datasets": []})
        
        # List PCAP files
        from backend.config import ALLOWED_EXTENSIONS
        pcap_files = [
            f for f in os.listdir(full_pcaps_path)
            if os.path.isfile(os.path.join(full_pcaps_path, f))
            and any(f.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)
        ]
        
        current_app.logger.info("Found %d PCAP files for technique %s", len(pcap_files), technique_id)
        return jsonify({"files": pcap_files, "path": pcaps_path, "datasets": []})
    except Exception as e:
        current_app.logger.error("Error getting technique PCAPs: %s", str(e))
        return jsonify({"error": "Error getting technique PCAPs"}), 500

