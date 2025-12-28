from backend.replay.setup_request import setup_request
from backend.replay.replay_loop import replay_loop_common
from flask import request, jsonify
from backend.extension import socketio
from flask_smorest import Blueprint


replay_fastest_bp = Blueprint("replay_fastest", __name__, url_prefix="/api")

def replay_loop(packets, iface, sid):
    """Replay loop for fastest mode - sends packets as fast as possible."""
    replay_loop_common(packets, iface, sid, mode="fastest", emit_progress=True)


@replay_fastest_bp.route("/replay_fastest/", methods=["POST"])
def replay_fastest():
    packets, iface, sid = setup_request(request)
    socketio.start_background_task(replay_loop, packets, iface, sid)
    return jsonify({
        "message": "Replay started",
        "packet_count": len(packets)
    }), 200