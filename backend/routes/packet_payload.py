from backend.config import UPLOAD_FOLDER
from backend.schemas.packet_details import PacketDetailsSchema
from backend.schemas.packet_payload import PacketPayloadSchema
from core.pcap_infos.payload_packet import payload_packet
from flask_smorest import Blueprint
from flask import request, jsonify
from core.utils.read_pcap import read_pcap
from backend.schemas.infos_pcap import PcapInfoSchema


packet_payload_bp = Blueprint("packet_payload", __name__, url_prefix="/api")


@packet_payload_bp.route("packet-payload/", methods=["GET"])
@packet_payload_bp.response(200, PacketPayloadSchema)
def packet_payload():
    file = request.args.get("file")
    packet_id = request.args.get("id", type=int)

    if not file or packet_id is None:
        return {"message": "Missing file or id"}, 400

    packets = read_pcap(UPLOAD_FOLDER + file)

    index = packet_id

    if index < 0 or index >= len(packets):
        return {"message": "Packet index out of range"}, 404

    pkt = packets[index]
    hex_payload = payload_packet(pkt)

    return {
        "payload": hex_payload,
    }
