def rewrite_packets(packets, ip_map=None, mac_map=None, ipv6_map=None, arp_ip_map=None, dns_domain_map=None):
    ip_map = ip_map or {}
    mac_map = mac_map or {}
    ipv6_map = ipv6_map or {}
    arp_ip_map = arp_ip_map or {}
    dns_domain_map = dns_domain_map or {}

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
            if dns.qr == 0 and hasattr(dns, "qd") and dns.qd:  # DNS query
                for q in dns.qd:
                    if hasattr(q, "qname") and q.qname:
                        try:
                            if isinstance(q.qname, bytes):
                                domain = q.qname.decode("utf-8", errors="ignore").rstrip(".")
                            else:
                                domain = str(q.qname).rstrip(".")
                            if domain in dns_domain_map:
                                new_domain = dns_domain_map[domain]
                                q.qname = (new_domain + ".").encode("utf-8")
                        except (AttributeError, UnicodeDecodeError, UnicodeEncodeError):
                            pass

        rewritten.append(pkt)

    return rewritten
