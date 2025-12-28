from backend.replay.setup_request import setup_request
from backend.replay.replay_loop import replay_loop_common
from flask import request, jsonify
from backend.extension import socketio
from flask_smorest import Blueprint


replay_faster_bp = Blueprint("replay_faster", __name__)

def replay_loop(packets, iface, sid):
    """Replay loop for faster mode without timestamp delays."""
    replay_loop_common(packets, iface, sid, mode="faster", emit_progress=True)


@replay_faster_bp.route("/api/replay_faster/", methods=["POST"])
def replay_faster():
    packets, iface, sid = setup_request(request)
    socketio.start_background_task(replay_loop, packets, iface, sid)
    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200