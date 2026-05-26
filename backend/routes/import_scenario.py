"""
Route for resolving an imported scenario.

Takes a list of items (parsed from an exported scenario JSON file) and returns
each item with its full technique + dataset data resolved from the MITRE files,
so the frontend can rebuild the scenario state in one round trip.
"""
import os
import json
import re
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from backend.config import MITRE_ROOT

import_scenario_bp = Blueprint("import_scenario", __name__, url_prefix="/api")


def _load_technique(technique_id):
    """Load a technique JSON by ID. Returns (data, error_message_or_None)."""
    technique_id = technique_id.upper().strip()
    if not re.match(r'^T\d+(\.\d+)?$', technique_id):
        return None, "Invalid technique ID format"

    techniques_dir = os.path.join(MITRE_ROOT, "techniques")
    if not os.path.isdir(techniques_dir):
        return None, "Techniques directory not found"

    technique_files = [
        f for f in os.listdir(techniques_dir)
        if f.startswith(technique_id + "_") and f.endswith(".json")
    ]

    if not technique_files:
        return None, "Technique not found"

    technique_path = os.path.join(techniques_dir, technique_files[0])

    techniques_dir_real = os.path.realpath(techniques_dir)
    if not os.path.realpath(technique_path).startswith(techniques_dir_real + os.sep):
        return None, "Invalid file path"

    with open(technique_path, "r") as f:
        return json.load(f), None


@import_scenario_bp.route("/import-scenario/", methods=["POST"])
def import_scenario():
    """
    Resolve an imported scenario by loading each technique + matching dataset.

    Expects JSON body:
    {
        "items": [
            {"type": "sleep", "duration": 5},
            {"type": "pcap", "techniqueId": "T1003.001", "tacticId": "TA0006", "pcapFile": "pcaps/..."},
            ...
        ]
    }

    Returns:
    {
        "items": [...resolved items...],
        "missing": [...techniqueIds not found...]
    }
    """
    current_app.logger.info("Import scenario request received")

    data = request.get_json(silent=True)
    if not data or "items" not in data:
        return jsonify({"error": "Missing 'items' in request body"}), 400

    items = data["items"]
    if not isinstance(items, list):
        return jsonify({"error": "'items' must be an array"}), 400

    resolved = []
    missing = []

    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400
            resolved.append({
                "type": "sleep",
                "duration": duration,
            })

        elif item_type == "pcap":
            technique_id = item.get("techniqueId")
            pcap_file = item.get("pcapFile")
            tactic_id = item.get("tacticId")

            if not technique_id or not pcap_file:
                return jsonify({"error": f"Item {i}: missing 'techniqueId' or 'pcapFile'"}), 400

            technique_data, err = _load_technique(technique_id)
            if err:
                missing.append(technique_id)
                continue

            dataset = None
            datasets_section = technique_data.get("datasets", {})
            available_pcaps = datasets_section.get("pcaps", [])
            for candidate in available_pcaps:
                if candidate.get("file") == pcap_file:
                    dataset = candidate
                    break

            resolved.append({
                "type": "pcap",
                "techniqueId": technique_id,
                "tacticId": tactic_id,
                "pcapFile": pcap_file,
                "technique": technique_data,
                "dataset": dataset,
            })

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    current_app.logger.info("Import scenario: %d resolved, %d missing", len(resolved), len(missing))
    return jsonify({"items": resolved, "missing": missing})
