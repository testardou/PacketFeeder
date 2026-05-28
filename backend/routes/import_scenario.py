"""
Route for resolving an imported scenario.
"""
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from core.pcap.import_scenario import resolve_scenario_import

import_scenario_bp = Blueprint("import_scenario", __name__, url_prefix="/api")


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

    try:
        result = resolve_scenario_import(items)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    current_app.logger.info("Import scenario: %d resolved, %d missing", len(result["items"]), len(result["missing"]))
    return jsonify(result)
