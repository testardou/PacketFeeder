"""
Route for exporting a scenario as a downloadable JSON file.
"""
import io
import json
import re
from datetime import datetime, timezone
from flask import request, jsonify, send_file, current_app
from flask_smorest import Blueprint

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

    exported_items = []

    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400
            exported_items.append({"type": "sleep", "duration": duration})

        elif item_type == "pcap":
            technique_id = item.get("techniqueId")
            tactic_id = item.get("tacticId")
            pcap_file = item.get("pcapFile")
            if not technique_id or not pcap_file:
                return jsonify({"error": f"Item {i}: missing 'techniqueId' or 'pcapFile'"}), 400
            exported_items.append({
                "type": "pcap",
                "techniqueId": technique_id,
                "tacticId": tactic_id,
                "pcapFile": pcap_file,
            })

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    content = {
        "version": 1,
        "date": datetime.now(timezone.utc).isoformat(),
        "name": name,
        "items": exported_items,
    }

    buffer = io.BytesIO(json.dumps(content, indent=2).encode("utf-8"))
    buffer.seek(0)

    safe_name = re.sub(r"[^a-z0-9\-_]", "_", name, flags=re.IGNORECASE)
    download_name = f"{safe_name}.json"

    current_app.logger.info("Export scenario: %d items, filename=%s", len(exported_items), download_name)

    return send_file(
        buffer,
        mimetype="application/json",
        as_attachment=True,
        download_name=download_name,
    )
