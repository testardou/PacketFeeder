import logging
from backend.replay.setup_request import setup_request
from backend.schemas.replay_step import ReplayStepSchema
from backend.schemas.replay_response import ErrorSchema
from core.pcap.parse_packet import parse_packet
from core.pcap.payload_packet import payload_packet
from core.replay.send_pcap import send_pcap
from flask import request, jsonify, current_app
from flask_smorest import Blueprint

logger = logging.getLogger(__name__)


replay_step_bp = Blueprint("replay_step", __name__, url_prefix="/api")

def calculate_indexes(index, total):
    WINDOW_SIZE = 5
    OFFSET = 2

    start = index - OFFSET
    if start < 0:
        start = 0
    if start + WINDOW_SIZE > total:
        start = max(0, total - WINDOW_SIZE)

    end = start + WINDOW_SIZE
    return start, end

@replay_step_bp.route("/replay-step/", methods=["POST"])
@replay_step_bp.response(200, ReplayStepSchema)
@replay_step_bp.response(400, ErrorSchema)
@replay_step_bp.response(500, ErrorSchema)

def replay_step():
    # Don't apply filter in step mode, as index is used for step-by-step navigation
    packets, iface, _ = setup_request(request, apply_filter=False)
    index = int(request.form.get("index"))
    total = len(packets)
    progress = float((index + 1) / total * 100.0)
    timestamp = float(packets[index].time)

    start, end = calculate_indexes(index, total)

    parsed_packets = [
        parse_packet(packets[i], i)
    for i in range(start, end)]

    try:
        send_pcap(packets[index], iface)
        current_app.logger.info(f"Successfully sent packet {index} on interface {iface}")
    except OSError as e:
        error_msg = f"Failed to send packet {index} on interface {iface}: {e}"
        current_app.logger.error(error_msg)
        return jsonify({
            "error": "Failed to send packet",
            "message": str(e),
            "index": index,
            "iface": iface
        }), 500
    except ValueError as e:
        error_msg = f"Invalid parameters for sending packet {index}: {e}"
        current_app.logger.error(error_msg)
        return jsonify({
            "error": "Invalid parameters",
            "message": str(e),
            "index": index,
            "iface": iface
        }), 400
    except Exception as e:
        error_msg = f"Unexpected error sending packet {index}: {e}"
        current_app.logger.error(error_msg, exc_info=True)
        return jsonify({
            "error": "Unexpected error",
            "message": str(e),
            "index": index
        }), 500
    
    return jsonify({
        "message": "Replay started",
        "progress": progress,
        "index": index,
        "timestamp": timestamp,
        "size": len(packets[index]),
        "packet_count": len(packets),
        "parsed_packet": parsed_packets,
    }), 200