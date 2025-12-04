from flask import Blueprint, request, jsonify
from core.utils.read_pcap import read_pcap
from flask_socketio import emit
from backend.extension import socketio
import time

replay_realtime_bp = Blueprint("replay_realtime", __name__)

def replay_loop(packets, iface):
    total = len(packets)
    first_timestamp = float(packets[0].time)
    prev_timestamp = first_timestamp

    for i, pkt in enumerate(packets):
        timestamp = float(pkt.time)

        if timestamp > prev_timestamp:
            time.sleep(timestamp - prev_timestamp)
            prev_timestamp = timestamp

        # Ici tu envoies ton vrai paquet sur interface
        # send_pcap(pkt, iface=iface, verbose=False)

        # Emit WebSocket
        progress = int((i + 1) / total * 100)
        socketio.emit("replay_progress", {
            "progress": progress,
            "index": i,
            "timestamp": timestamp,
            "size": len(pkt)
        }, namespace="/realtime")

    socketio.emit("replay_done", {"msg": "Replay terminé"}, namespace="/realtime")


@replay_realtime_bp.route("/api/replay_realtime/", methods=["POST"])
def replay_realtime():
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400

    file = request.files["file"]
    iface = request.form.get("iface")

    # Sauvegarde temporaire
    tmp_path = "/tmp/replay.pcap"
    file.save(tmp_path)

    packets = read_pcap(tmp_path)

    # Lancer le replay sans bloquer la requête HTTP
    socketio.start_background_task(replay_loop, packets, iface)

    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200