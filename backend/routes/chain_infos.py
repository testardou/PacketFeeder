"""
Route for fetching infos of all PCAPs in a chain, plus aggregated "all" infos.
"""
from flask import request, jsonify, current_app
from flask_smorest import Blueprint
from backend.utils.validate_file_path import validate_file_path_auto
from core.utils.read_pcap import read_pcap
from core.utils.pcap_infos import pcap_infos

chain_infos_bp = Blueprint("chain_infos", __name__, url_prefix="/api")


@chain_infos_bp.route("/chain-infos/", methods=["POST"])
def chain_infos():
    """
    Return pcap_infos for each PCAP in the chain, plus an aggregated "all" result.

    Expects JSON body:
    {
        "items": [
            {"type": "pcap", "pcap_file": "path/to/file.pcap"},
            {"type": "sleep", "duration": 5},
            ...
        ]
    }
    """
    current_app.logger.info("Chain infos request received")

    data = request.get_json(silent=True)
    if not data or "items" not in data:
        return jsonify({"error": "Missing 'items' in request body"}), 400

    items = data["items"]
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "'items' must be a non-empty array"}), 400
    per_pcap = []
    # Aggregated values
    all_packets = 0
    all_bytes = 0
    all_min_size = None
    all_max_size = None
    all_protocols = {
        "macs": [],
        "ips": [],
        "ipv6s": [],
        "tcp_ports": [],
        "udp_ports": [],
        "icmp_types": [],
        "arp_ips": [],
        "dns_domains": [],
    }
    all_duration = 0.0

    for i, item in enumerate(items):
        item_type = item.get("type")

        if item_type == "sleep":
            duration = item.get("duration")
            if duration is None or not isinstance(duration, (int, float)) or duration < 0:
                return jsonify({"error": f"Item {i}: 'duration' must be a non-negative number"}), 400
            all_duration += duration
            continue
        
        if item_type == "pcap":
            pcap_file = item.get("pcap_file")
            if not pcap_file:
                return jsonify({"error": f"Item {i}: missing 'pcap_file'"}), 400

            print('OLALALALA',pcap_file)
            file_path, err = validate_file_path_auto(pcap_file)
            if err:
                response, status = err
                return jsonify({"error": f"Item {i}: {response.get_json().get('error', 'invalid file')}"}), status

            try:
                packets = read_pcap(file_path)
            except Exception as e:
                current_app.logger.error("Item %d: failed to read PCAP: %s", i, str(e))
                return jsonify({"error": f"Item {i}: failed to read PCAP file"}), 500

            if len(packets) == 0:
                continue

            infos = pcap_infos(packets)
            per_pcap.append({
                "index": i,
                "pcap_file": pcap_file,
                "infos": infos,
            })

            # Aggregate
            all_packets += infos["packet_count"]
            all_bytes += infos["total_bytes"]
            pcap_duration = float(infos["duration_seconds"])
            all_duration += pcap_duration

            if all_min_size is None or infos["min_packet_size"] < all_min_size:
                all_min_size = infos["min_packet_size"]
            if all_max_size is None or infos["max_packet_size"] > all_max_size:
                all_max_size = infos["max_packet_size"]

            # Union protocols
            for key in all_protocols:
                for val in infos["protocols"].get(key, []):
                    if val not in all_protocols[key]:
                        all_protocols[key].append(val)

        else:
            return jsonify({"error": f"Item {i}: unknown type '{item_type}'"}), 400

    if len(per_pcap) == 0:
        return jsonify({"error": "No valid PCAPs found in the chain"}), 400

    all_infos = {
        "packet_count": all_packets,
        "total_bytes": all_bytes,
        "duration_seconds": str(all_duration),
        "min_packet_size": all_min_size or 0,
        "max_packet_size": all_max_size or 0,
        "protocols": all_protocols,
    }
    print('PCAP INFOS:', per_pcap)
    print('ALL INFOS:', all_infos)

    return jsonify({
        "per_pcap": per_pcap,
        "all": all_infos,
    })
