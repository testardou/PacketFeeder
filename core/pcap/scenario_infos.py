from core.pcap.pcap_infos import pcap_infos
from core.pcap.read_pcap import read_pcap


def scenario_infos(items):
    """Get infos for each pcap in a scenario + aggregated infos.

    items: list of {"type": "pcap", "file_path": "..."} or {"type": "sleep", "duration": N}
    Returns: {"per_pcap": [...], "all": {...}}
    """
    per_pcap = []
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
        if item["type"] == "sleep":
            all_duration += item["duration"]
            continue

        if item["type"] != "pcap":
            continue

        packets = read_pcap(item["file_path"])

        if len(packets) == 0:
            continue

        infos = pcap_infos(packets)
        per_pcap.append({
            "index": i,
            "file_path": item["file_path"],
            "infos": infos,
        })

        all_packets += infos["packet_count"]
        all_bytes += infos["total_bytes"]
        all_duration += float(infos["duration_seconds"])

        if all_min_size is None or infos["min_packet_size"] < all_min_size:
            all_min_size = infos["min_packet_size"]
        if all_max_size is None or infos["max_packet_size"] > all_max_size:
            all_max_size = infos["max_packet_size"]

        for key in all_protocols:
            for val in infos["protocols"].get(key, []):
                if val not in all_protocols[key]:
                    all_protocols[key].append(val)

    all_infos = {
        "packet_count": all_packets,
        "total_bytes": all_bytes,
        "duration_seconds": str(all_duration),
        "min_packet_size": all_min_size or 0,
        "max_packet_size": all_max_size or 0,
        "protocols": all_protocols,
    }

    return {"per_pcap": per_pcap, "all": all_infos}
