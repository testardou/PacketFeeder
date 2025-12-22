from backend.replay.setup_request import setup_request
from backend.schemas.replay_step import ReplayStepSchema
from core.pcap_infos.parse_packet import parse_packet
from core.pcap_infos.payload_packet import payload_packet
from core.utils.send_pcap import send_pcap
from flask import  request, jsonify
from flask_smorest import Blueprint


replay_step_bp = Blueprint("replay_step", __name__, url_prefix="/api")

def calculate_indexes(index, total):
    WINDOW_SIZE = 6
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

def replay_step():
    packets, iface, _ = setup_request(request)
    index = int(request.form.get("index"))
    total = len(packets)
    progress = float((index + 1) / total * 100.0)
    timestamp = float(packets[index].time)

    start, end = calculate_indexes(index, total)

    parsed_packets = [
        parse_packet(packets[i], i)
    for i in range(start, end)]

    send_pcap(packets[index], iface)
    return jsonify({
        "message": "Replay started",
        "progress": progress,
        "index": index,
        "timestamp": timestamp,
        "size": len(packets[index]),
        "packet_count": len(packets),
        "parsed_packet": parsed_packets,
    }), 200