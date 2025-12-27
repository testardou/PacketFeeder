def pcap_infos(packets):
    first_ts = packets[0].time
    last_ts = packets[-1].time
    duration = last_ts - first_ts if last_ts > first_ts else 0
    sizes = [len(pkt) for pkt in packets]
    total_bytes = sum(sizes)
    macs = []
    ips = []
    ipv6s = []
    tcp_ports = []
    udp_ports = []
    icmp_types = []
    arp_ips = []
    dns_domains = []

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
        if pkt.haslayer("IPv6"):
            if pkt["IPv6"].src not in ipv6s:
                ipv6s.append(pkt["IPv6"].src)
            if pkt["IPv6"].dst not in ipv6s:
                ipv6s.append(pkt["IPv6"].dst)
        if pkt.haslayer("DNS"):
            dns = pkt["DNS"]
            if dns.qr == 0:  # DNS query
                if hasattr(dns, "qd") and dns.qd:
                    for q in dns.qd:
                        if hasattr(q, "qname") and q.qname:
                            try:
                                if isinstance(q.qname, bytes):
                                    domain = q.qname.decode("utf-8", errors="ignore").rstrip(".")
                                else:
                                    domain = str(q.qname).rstrip(".")
                                if domain and domain not in dns_domains:
                                    dns_domains.append(domain)
                            except (AttributeError, UnicodeDecodeError):
                                pass
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
        if pkt.haslayer("ICMP"):
            icmp_type = pkt["ICMP"].type
            if icmp_type not in icmp_types:
                icmp_types.append(icmp_type)
        if pkt.haslayer("ARP"):
            if pkt["ARP"].psrc not in arp_ips:
                arp_ips.append(pkt["ARP"].psrc)
            if pkt["ARP"].pdst not in arp_ips:
                arp_ips.append(pkt["ARP"].pdst)

    infos = {
        "packet_count": len(packets),
        "total_bytes": total_bytes,
        "duration_seconds": str(duration),
        "min_packet_size": min(sizes),
        "max_packet_size": max(sizes),
        "protocols": {
            "macs": macs,
            "ips": ips,
            "ipv6s": ipv6s,
            "tcp_ports": tcp_ports,
            "udp_ports": udp_ports,
            "icmp_types": sorted(icmp_types),
            "arp_ips": arp_ips,
            "dns_domains": dns_domains,
        },
    }
    return infos