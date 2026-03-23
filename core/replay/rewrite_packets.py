def rewrite_packets(packets, ip_map=None, mac_map=None, ipv6_map=None, arp_ip_map=None, dns_domain_map=None, tcp_port_map=None, udp_port_map=None):
    ip_map = ip_map or {}
    mac_map = mac_map or {}
    ipv6_map = ipv6_map or {}
    arp_ip_map = arp_ip_map or {}
    dns_domain_map = dns_domain_map or {}
    tcp_port_map = tcp_port_map or {}
    udp_port_map = udp_port_map or {}

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

        # Rewrite IPv6
        if ipv6_map and pkt.haslayer("IPv6"):
            ipv6 = pkt["IPv6"]
            src = ipv6.src
            dst = ipv6.dst

            if src in ipv6_map:
                ipv6.src = ipv6_map[src]
            if dst in ipv6_map:
                ipv6.dst = ipv6_map[dst]

            # Scapy recalculation
            for field in ["chksum", "len"]:
                if field in ipv6.fields:
                    del ipv6.fields[field]

        # Rewrite ARP IPs
        if arp_ip_map and pkt.haslayer("ARP"):
            arp = pkt["ARP"]
            if arp.psrc in arp_ip_map:
                arp.psrc = arp_ip_map[arp.psrc]
            if arp.pdst in arp_ip_map:
                arp.pdst = arp_ip_map[arp.pdst]

        # Rewrite DNS domains
        if dns_domain_map and pkt.haslayer("DNS"):
            dns = pkt["DNS"]
            for section in ("qd", "an", "ns", "ar"):
                records = getattr(dns, section, None)
                if not records:
                    continue
                for r in records:
                    for attr in ("qname", "rrname", "rdata"):
                        val = getattr(r, attr, None)
                        if not val:
                            continue
                        try:
                            if isinstance(val, bytes):
                                decoded = val.decode("utf-8", errors="ignore").rstrip(".")
                            else:
                                decoded = str(val).rstrip(".")
                            if decoded in dns_domain_map:
                                new_val = (dns_domain_map[decoded] + ".").encode("utf-8")
                                setattr(r, attr, new_val)
                        except (AttributeError, UnicodeDecodeError, UnicodeEncodeError):
                            pass

        # Rewrite TCP ports
        if tcp_port_map and pkt.haslayer("TCP"):
            tcp = pkt["TCP"]
            sport = str(tcp.sport)
            dport = str(tcp.dport)
            if sport in tcp_port_map:
                tcp.sport = int(tcp_port_map[sport])
            if dport in tcp_port_map:
                tcp.dport = int(tcp_port_map[dport])
            # Scapy recalculation
            for field in ["chksum"]:
                if field in tcp.fields:
                    del tcp.fields[field]

        # Rewrite UDP ports
        if udp_port_map and pkt.haslayer("UDP"):
            udp = pkt["UDP"]
            sport = str(udp.sport)
            dport = str(udp.dport)
            if sport in udp_port_map:
                udp.sport = int(udp_port_map[sport])
            if dport in udp_port_map:
                udp.dport = int(udp_port_map[dport])
            # Scapy recalculation
            for field in ["chksum"]:
                if field in udp.fields:
                    del udp.fields[field]

        rewritten.append(pkt)

    return rewritten
