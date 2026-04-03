"""
Route for fetching infos of all PCAPs in a scenario, plus aggregated "all" infos.
"""
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from backend.utils.validate_file_path import validate_file_path_auto
from core.utils.scenario_infos import scenario_infos

scenario_infos_bp = Blueprint("scenario_infos", __name__, url_prefix="/api")


@scenario_infos_bp.route("/scenario-infos/", methods=["POST"])
def get_scenario_infos():
    """
    Return pcap_infos for each PCAP in the scenario, plus an aggregated "all" result.

    Expects JSON body:
    {
        "items": [
            {"type": "pcap", "pcap_file": "path/to/file.pcap"},
            {"type": "sleep", "duration": 5},
            ...
        ]
    }
    """
    current_app.logger.info("Scenario infos request received")

    data = request.get_json(silent=True)
    if not data or "items" not in data:
        return jsonify({"error": "Missing 'items' in request body"}), 400

    items = data["items"]
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "'items' must be a non-empty array"}), 400
    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "pcap":
            pcap_file = item.get("pcap_file")
            if not pcap_file:
                return jsonify({"error": f"Item {i}: missing 'pcap_file'"}), 400
            file_path, err = validate_file_path_auto(pcap_file)
            if err:
                response, status = err
                return jsonify({"error": f"Item {i}: {response.get_json().get('error', 'invalid file')}"}), status
            item["file_path"] = file_path

        elif item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    result = scenario_infos(items)

    if not result["per_pcap"]:
        return jsonify({"error": "No valid PCAPs found in the scenario"}), 400

    return jsonify(result)
