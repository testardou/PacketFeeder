from backend.replay.setup_request import setup_request
from flask import request, jsonify
from backend.extension import socketio
from backend.sockets.realtime import should_run
from core.utils.send_pcap import send_pcap
from flask_smorest import Blueprint


replay_fastest_bp = Blueprint("replay_fastest", __name__, url_prefix="/api")

def replay_loop(packets, iface, sid):
    send_pcap(packets, iface)
    socketio.emit("run_status", {"sid": sid, "running": False}, room=sid, namespace="/realtime")


@replay_fastest_bp.route("/replay_fastest/", methods=["POST"])
def replay_fastest():
    packets, iface, sid = setup_request(request)
    socketio.start_background_task(replay_loop, packets, iface, sid)
    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200