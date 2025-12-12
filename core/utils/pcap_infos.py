def pcap_infos(packets):
    first_ts = packets[0].time
    last_ts = packets[-1].time
    duration = last_ts - first_ts if last_ts > first_ts else 0
    sizes = [len(pkt) for pkt in packets]
    total_bytes = sum(sizes)
    macs = []
    ips = []
    tcp_ports = []
    udp_ports = []

    for pkt in packets:
        if pkt.haslayer("Ether"):
            if pkt["Ether"].src not in macs:
                macs.append(pkt["Ether"].src.lower())
            if pkt["Ether"].dst not in macs:
                macs.append(pkt["Ether"].dst.lower())
        if pkt.haslayer("IP"):
            if pkt["IP"].src not in ips:
                ips.append(pkt["IP"].src)
            if pkt["IP"].dst not in ips:
                ips.append(pkt["IP"].dst)
        if pkt.haslayer("TCP"):
            if pkt["TCP"].sport not in tcp_ports:
                tcp_ports.append(pkt["TCP"].sport)
            if pkt["TCP"].dport not in tcp_ports:
                tcp_ports.append(pkt["TCP"].dport)
        elif pkt.haslayer("UDP"):
            if pkt["UDP"].sport not in udp_ports:
                udp_ports.append(pkt["UDP"].sport)
            if pkt["UDP"].dport not in udp_ports:
                udp_ports.append(pkt["UDP"].dport)


    infos = {
        "packet_count": len(packets),
        "total_bytes": total_bytes,
        "duration_seconds": str(duration),

        "min_packet_size": min(sizes),
        "max_packet_size": max(sizes),

        "macs": macs,
        "ips": ips,
        "tcp_ports": tcp_ports,
        "udp_ports": udp_ports,
    }
    return infos