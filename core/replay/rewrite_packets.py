def rewrite_packets(packets, ip_map=None, mac_map=None):
    ip_map = ip_map or {}
    mac_map = mac_map or {}

    rewritten = []

    for pkt in packets:
        # Rewrite MAC
        if mac_map and pkt.haslayer("Ether"):
            eth = pkt["Ether"]
            src = eth.src.lower()
            dst = eth.dst.lower()
            if src in mac_map:
                eth.src = mac_map[src]
            if dst in mac_map:
                eth.dst = mac_map[dst]

        # Rewrite IP
        if ip_map and pkt.haslayer("IP"):
            ip = pkt["IP"]
            src = ip.src.lower()
            dst = ip.dst.lower()

            if src in ip_map:
                ip.src = ip_map[src]
            if dst in ip_map:
                ip.dst = ip_map[dst]

            # Scapy recalculation
            for field in ["chksum", "len"]:
                if field in ip.fields:
                    del ip.fields[field]

        rewritten.append(pkt)

    return rewritten
