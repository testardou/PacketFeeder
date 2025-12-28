from backend.replay.setup_request import setup_request
from backend.replay.replay_loop import replay_loop_common
from backend.schemas.replay_response import ReplayResponseSchema, ErrorSchema
from flask import current_app, request, jsonify
from backend.extension import socketio
from flask_smorest import Blueprint


replay_fastest_bp = Blueprint("replay_fastest", __name__, url_prefix="/api")

def replay_loop(packets, iface, sid):
    """Replay loop for fastest mode - sends packets as fast as possible."""
    replay_loop_common(packets, iface, sid, mode="fastest", emit_progress=True)


@replay_fastest_bp.route("/replay_fastest/", methods=["POST"])
@replay_fastest_bp.response(200, ReplayResponseSchema)
@replay_fastest_bp.response(400, ErrorSchema)
@replay_fastest_bp.response(500, ErrorSchema)
def replay_fastest():
    """
    Start a fastest replay - sends packets as fast as possible.
    
    Returns:
        JSON response with replay status
    
    Raises:
        400: If request parameters are invalid
        404: If file not found
        500: If replay setup fails
    """
    current_app.logger.info("Fastest replay request received")
    
    try:
        packets, iface, sid = setup_request(request)
        socketio.start_background_task(replay_loop, packets, iface, sid)
        current_app.logger.info("Fastest replay started: %d packets on %s", len(packets), iface)
        return jsonify({
            "message": "Replay started",
            "packet_count": len(packets),
            "mode": "fastest"
        }), 200
    except ValueError as e:
        current_app.logger.warning("Invalid replay request: %s", str(e))
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error("Error starting replay: %s", str(e))
        return jsonify({"error": "Error starting replay"}), 500