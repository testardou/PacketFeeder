"""
Route for exporting a scenario as a downloadable JSON file.
"""
import io
import json
from flask import request, jsonify, send_file, current_app
from flask_smorest import Blueprint
from core.pcap.export_scenario import build_scenario_export, safe_export_filename

export_scenario_bp = Blueprint("export_scenario", __name__, url_prefix="/api")


@export_scenario_bp.route("/export-scenario/", methods=["POST"])
def export_scenario():
    """
    Build and return a scenario JSON file as a download.

    Expects JSON body:
    {
        "name": "my-scenario",
        "items": [
            {"type": "sleep", "duration": 5},
            {"type": "pcap", "techniqueId": "T1003.001", "tacticId": "TA0006", "pcapFile": "pcaps/..."},
            ...
        ]
    }
    """
    current_app.logger.info("Export scenario request received")

    data = request.get_json(silent=True)
    if not data or "items" not in data:
        return jsonify({"error": "Missing 'items' in request body"}), 400

    items = data["items"]
    name = data.get("name") or "scenario"

    if not isinstance(items, list):
        return jsonify({"error": "'items' must be an array"}), 400

    try:
        content = build_scenario_export(name, items)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    download_name = safe_export_filename(name)
    buffer = io.BytesIO(json.dumps(content, indent=2).encode("utf-8"))
    buffer.seek(0)

    current_app.logger.info("Export scenario: %d items, filename=%s", len(content["items"]), download_name)

    return send_file(
        buffer,
        mimetype="application/json",
        as_attachment=True,
        download_name=download_name,
    )
