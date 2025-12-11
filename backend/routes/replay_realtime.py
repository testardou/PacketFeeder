from backend.config import UPLOAD_FOLDER
from flask import  request, jsonify
from core.utils.send_pcap import send_pcap
from core.utils.read_pcap import read_pcap
from flask_socketio import emit
from backend.extension import socketio
from backend.sockets.realtime import should_run
import time
from flask_smorest import Blueprint


replay_realtime_bp = Blueprint("replay_realtime", __name__)

def replay_loop(packets, iface, sid):
    total = len(packets)
    first_timestamp = float(packets[0].time)
    last_timestamp = float(packets[-1].time)
    prev_timestamp = first_timestamp

    for i, pkt in enumerate(packets):
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
            time.sleep(timestamp - prev_timestamp)
            prev_timestamp = timestamp
    socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")
    socketio.emit("replay_done", {"msg": "Replay terminé"}, namespace="/realtime")


@replay_realtime_bp.route("/api/replay_realtime/", methods=["POST"])
def replay_realtime():
    file = request.form.get('file')
    iface = request.form.get("iface")
    sid = request.form.get("sid")
    print('FILE',file, " iface", iface," sid", sid)
    packets = read_pcap(UPLOAD_FOLDER + file)
    should_run[sid] = True
    socketio.emit("run_status", {"sid": sid, "running": True}, room=sid, namespace="/realtime")

    # Lancer le replay sans bloquer la requête HTTP
    socketio.start_background_task(replay_loop, packets, iface, sid)

    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200