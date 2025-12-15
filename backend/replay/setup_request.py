from backend.config import UPLOAD_FOLDER
from backend.replay.parse_rewrite_json import parse_rewrite_json
from core.replay.rewrite_packets import rewrite_packets
from core.utils.read_pcap import read_pcap
from backend.sockets.realtime import should_run
from backend.extension import socketio


def setup_request(request):
    file = request.form.get('file')
    iface = request.form.get("iface")
    sid = request.form.get("sid")
    rewrite_ips = request.form.get("rewriteIps")
    rewrite_macs = request.form.get("rewriteMacs")

    if len(rewrite_ips) > 0:
        mapped_rewrite_ips = parse_rewrite_json(rewrite_ips)
    if len(rewrite_macs) > 0:
        mapped_rewrite_macs = parse_rewrite_json(rewrite_macs)

    packets = read_pcap(UPLOAD_FOLDER + file)
    packets = rewrite_packets(packets, ip_map=mapped_rewrite_ips, mac_map=mapped_rewrite_macs)
    print('FILE',file, " iface", iface," sid", sid)
    should_run[sid] = True
    socketio.emit("run_status", {"sid": sid, "running": True}, room=sid, namespace="/realtime")
    return packets, iface, sid