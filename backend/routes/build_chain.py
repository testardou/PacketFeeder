"""
Route for building and validating a PCAP chain with sleep instructions.
"""
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from backend.utils.validate_file_path import validate_file_path_auto

build_chain_bp = Blueprint("build_chain", __name__, url_prefix="/api")


@build_chain_bp.route("/build-chain/", methods=["POST"])
def build_chain():
    """
    Validate and resolve a chain of PCAP items and sleep instructions.

    Expects a JSON body:
    {
        "items": [
            {"type": "pcap", "pcap_file": "path/to/file.pcap", "technique_id": "T1234", "tactic_id": "..."},
            {"type": "sleep", "duration": 5},
            ...
        ]
    }

    Returns the chain with validated/resolved PCAP paths, or an error
    indicating which item failed validation.
    """
    current_app.logger.info("Build chain request received")

    data = request.get_json(silent=True)
    if not data or "items" not in data:
        return jsonify({"error": "Missing 'items' in request body"}), 400

    items = data["items"]
    if not isinstance(items, list):
        return jsonify({"error": "'items' must be an array"}), 400

    resolved = []

    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "pcap":
            pcap_file = item.get("pcap_file")
            if not pcap_file:
                return jsonify({"error": f"Item {i}: missing 'pcap_file'"}), 400

            file_path, err = validate_file_path_auto(pcap_file)
            if err:
                response, status = err
                current_app.logger.warning("Item %d: invalid pcap_file '%s'", i, pcap_file)
                return jsonify({"error": f"Item {i}: {response.get_json().get('error', 'invalid file')}"}), status

            resolved.append({
                "type": "pcap",
                "pcap_file": file_path,
                "technique_id": item.get("technique_id"),
                "tactic_id": item.get("tactic_id"),
            })

        elif item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400

            resolved.append({
                "type": "sleep",
                "duration": duration,
            })

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    current_app.logger.info("Chain validated: %d items", len(resolved))
    return jsonify({"items": resolved})
