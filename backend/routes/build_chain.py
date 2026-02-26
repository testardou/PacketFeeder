"""
Route for building a merged PCAP from a chain of PCAPs and sleep instructions.
"""
import os
import time
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from scapy.all import rdpcap, wrpcap
from backend.utils.validate_file_path import validate_file_path_auto
from backend.config import PROJECT_ROOT

build_chain_bp = Blueprint("build_chain", __name__, url_prefix="/api")

CHAINS_DIR = os.path.join(PROJECT_ROOT, "pcaps", "chains")


@build_chain_bp.route("/build-chain/", methods=["POST"])
def build_chain():
    """
    Build a merged PCAP from a chain of PCAP items and sleep instructions.

    Each PCAP's packets are re-timestamped to follow the previous one.
    Sleep items add a delay offset between PCAPs.
    The merged PCAP starts at timestamp 0.

    Expects a JSON body:
    {
        "items": [
            {"type": "pcap", "pcap_file": "path/to/file.pcap", "technique_id": "T1234", "tactic_id": "..."},
            {"type": "sleep", "duration": 5},
            ...
        ]
    }

    Returns JSON with the relative path to the merged PCAP file.
    """
    current_app.logger.info("Build chain request received")

    data = request.get_json(silent=True)
    if not data or "items" not in data:
        return jsonify({"error": "Missing 'items' in request body"}), 400

    items = data["items"]
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "'items' must be a non-empty array"}), 400

    # --- Phase 1: validate all items before reading any file ---
    validated = []

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

            validated.append({"type": "pcap", "file_path": file_path})

        elif item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400

            validated.append({"type": "sleep", "duration": duration})

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    # --- Phase 2: read PCAPs and merge with adjusted timestamps ---
    merged_packets = []
    current_offset = 0.0

    for i, entry in enumerate(validated):
        if entry["type"] == "sleep":
            current_offset += entry["duration"]
            continue

        try:
            packets = rdpcap(entry["file_path"])
        except Exception as e:
            current_app.logger.error("Item %d: failed to read PCAP: %s", i, str(e))
            return jsonify({"error": f"Item {i}: failed to read PCAP file"}), 500

        if len(packets) == 0:
            continue

        first_ts = float(packets[0].time)

        for pkt in packets:
            pkt.time = current_offset + (float(pkt.time) - first_ts)
            merged_packets.append(pkt)

        # Advance offset past the last packet of this PCAP
        current_offset = float(merged_packets[-1].time)

    if len(merged_packets) == 0:
        return jsonify({"error": "No packets found in the provided PCAPs"}), 400

    # --- Phase 3: write the merged PCAP ---
    os.makedirs(CHAINS_DIR, exist_ok=True)
    filename = f"chain_{int(time.time())}_{os.getpid()}.pcap"
    out_path = os.path.join(CHAINS_DIR, filename)
    relative_path = os.path.join("pcaps", "chains", filename)

    try:
        wrpcap(out_path, merged_packets)
    except Exception as e:
        current_app.logger.error("Failed to write merged PCAP: %s", str(e))
        return jsonify({"error": "Failed to write merged PCAP"}), 500

    current_app.logger.info(
        "Chain built: %d packets, %.2fs total duration -> %s",
        len(merged_packets),
        current_offset,
        out_path,
    )

    return jsonify({
        "file": relative_path,
        "packet_count": len(merged_packets),
        "duration": round(current_offset, 3),
    })
