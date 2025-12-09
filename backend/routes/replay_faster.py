from flask import request, jsonify
from core.utils.read_pcap import read_pcap
from flask_socketio import emit
from backend.extension import socketio
from backend.sockets.realtime import should_run
from core.utils.send_pcap import send_pcap
from flask_smorest import Blueprint


replay_faster_bp = Blueprint("replay_faster", __name__)

def replay_loop(packets, iface, sid):
    print("SID "+sid)
    total = len(packets)
    first_timestamp = float(packets[0].time)
    last_timestamp = float(packets[-1].time)
    prev_timestamp = first_timestamp

    for i, pkt in enumerate(packets):
        print('SARUN ',should_run.get(sid, False))
        if not should_run.get(sid, False):
            print(f"Replay halted for SID {sid}")
            break
        timestamp = float(pkt.time)
        if timestamp > prev_timestamp:
            progress = float((i + 1) / total * 100.0)
            socketio.emit("replay_progress", {
                "progress": progress,
                "index": i,
                "timestamp": timestamp,
                "size": len(pkt),
                "remaining_time": last_timestamp - prev_timestamp,
                "next_packet": timestamp - prev_timestamp
            }, namespace="/realtime")
            send_pcap(pkt, iface)
            prev_timestamp = timestamp
    socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")


@replay_faster_bp.route("/api/replay_faster/", methods=["POST"])
def replay_faster():
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400
    file = request.files["file"]
    iface = request.form.get("iface")
    sid = request.form.get("sid")
    print("PRESID "+sid)

    print('FILE',file, " iface", iface," sid", sid)
    packets = read_pcap(file)
    should_run[sid] = True
    socketio.emit("run_status", {"sid": sid, "running": True}, room=sid, namespace="/realtime")

    # Lancer le replay sans bloquer la requête HTTP
    socketio.start_background_task(replay_loop, packets, iface, sid)

    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200