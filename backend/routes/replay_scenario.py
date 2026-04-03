"""
Route for replaying a scenario of PCAPs with per-pcap and global rewrites.
Merges, rewrites, and replays in memory — no file written.
"""
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from scapy.all import rdpcap
from backend.utils.validate_file_path import validate_file_path_auto
from backend.replay.merge_rewrites import merge_rewrite_maps
from backend.replay.replay_loop import replay_loop_common
from backend.sockets.realtime import should_run, running_status
from backend.extension import socketio
from core.replay.rewrite_packets import rewrite_packets

replay_scenario_bp = Blueprint("replay_scenario", __name__, url_prefix="/api")


@replay_scenario_bp.route("/replay-scenario/", methods=["POST"])
def replay_scenario():
    """
    Replay a scenario of PCAPs with per-pcap and global rewrites.

    Expects JSON body:
    {
        "items": [...],
        "iface": "eth0",
        "sid": "...",
        "mode": "realtime",
        "global_rewrites": { "ip": [{old, new}], ... },
        "per_pcap_rewrites": { "0": { "ip": [...], ... } },
        "index": null,
        "range": null
    }
    """
    current_app.logger.info("Replay scenario request received")

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    items = data.get("items")
    if not items or not isinstance(items, list):
        return jsonify({"error": "'items' must be a non-empty array"}), 400

    iface = data.get("iface")
    sid = data.get("sid")
    mode = data.get("mode", "realtime")
    global_rewrites = data.get("global_rewrites", {})
    per_pcap_rewrites = data.get("per_pcap_rewrites", {})
    index_val = data.get("index")
    range_val = data.get("range")

    if not iface:
        return jsonify({"error": "Missing 'iface'"}), 400
    if not sid:
        return jsonify({"error": "Missing 'sid'"}), 400

    mode_map = {
        "realTime": "realtime",
        "realtime": "realtime",
        "fast": "faster",
        "faster": "faster",
        "fastest": "fastest",
    }
    replay_mode = mode_map.get(mode, "realtime")

    # --- Phase 1: validate all items ---
    validated = []
    pcap_index = 0

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

            validated.append({
                "type": "pcap",
                "file_path": file_path,
                "item_index": i,
                "pcap_index": pcap_index,
            })
            pcap_index += 1

        elif item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400
            validated.append({"type": "sleep", "duration": duration})

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    # --- Phase 2: read PCAPs, apply rewrites, re-timestamp, merge ---
    merged_packets = []
    current_offset = 0.0

    for entry in validated:
        if entry["type"] == "sleep":
            current_offset += entry["duration"]
            continue

        try:
            packets = rdpcap(entry["file_path"])
        except Exception as e:
            current_app.logger.error("Failed to read PCAP %s: %s", entry["file_path"], str(e))
            return jsonify({"error": f"Failed to read PCAP file at index {entry['item_index']}"}), 500

        if len(packets) == 0:
            continue

        # Merge rewrites: per-pcap + global (global wins)
        item_idx_str = str(entry["item_index"])
        per_pcap_rw = per_pcap_rewrites.get(item_idx_str, {})
        maps = merge_rewrite_maps(per_pcap_rw, global_rewrites)

        # Apply rewrites
        packets = rewrite_packets(packets, **maps)

        # Re-timestamp
        first_ts = float(packets[0].time)
        for pkt in packets:
            pkt.time = current_offset + (float(pkt.time) - first_ts)
            merged_packets.append(pkt)

        current_offset = float(merged_packets[-1].time)

    if len(merged_packets) == 0:
        return jsonify({"error": "No packets found in the provided PCAPs"}), 400

    # --- Phase 3: apply index/range filter ---
    total_packets = len(merged_packets)

    if index_val is not None and index_val != "":
        try:
            idx = int(index_val)
            if idx < 0 or idx >= total_packets:
                return jsonify({"error": f"Index {idx} out of range (0-{total_packets - 1})"}), 400
            merged_packets = [merged_packets[idx]]
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid index value"}), 400

    elif range_val is not None and range_val != "":
        try:
            start_str, end_str = str(range_val).split("-", 1)
            start = int(start_str.strip())
            end = int(end_str.strip())
            if start < 0 or end >= total_packets or start > end:
                return jsonify({"error": f"Range {start}-{end} out of bounds (0-{total_packets - 1})"}), 400
            merged_packets = merged_packets[start:end + 1]
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid range value"}), 400

    # --- Phase 4: launch replay ---
    should_run[sid] = True
    running_status[sid] = True
    socketio.emit("run_status", {"sid": sid, "running": True}, room=sid, namespace="/realtime")

    def do_replay():
        replay_loop_common(merged_packets, iface, sid, mode=replay_mode, emit_progress=True)

    try:
        socketio.start_background_task(do_replay)
        current_app.logger.info(
            "scenario replay started: %d packets on %s (mode=%s)",
            len(merged_packets), iface, replay_mode,
        )
        return jsonify({
            "message": "scenario replay started",
            "packet_count": len(merged_packets),
            "mode": replay_mode,
        }), 200
    except Exception as e:
        current_app.logger.error("Error starting scenario replay: %s", str(e))
        running_status[sid] = False
        socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")
        return jsonify({"error": "Error starting scenario replay"}), 500
