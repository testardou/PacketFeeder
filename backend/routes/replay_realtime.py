from backend.replay.setup_request import setup_request
from backend.replay.replay_loop import replay_loop_common
from flask import request, jsonify
from backend.extension import socketio
from flask_smorest import Blueprint


replay_realtime_bp = Blueprint("replay_realtime", __name__, url_prefix="/api")

def replay_loop(packets, iface, sid):
    """Replay loop for real-time mode with timestamp respect."""
    replay_loop_common(packets, iface, sid, mode="realtime", emit_progress=True)


@replay_realtime_bp.route("/replay_realtime/", methods=["POST"])
def replay_realtime():
    packets, iface, sid = setup_request(request)
    socketio.start_background_task(replay_loop, packets, iface, sid)
    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200