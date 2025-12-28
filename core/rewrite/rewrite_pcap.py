import os
from scapy.utils import PcapWriter
from core.utils.parse_mapping import parse_mapping
from core.replay.rewrite_packets import rewrite_packets
from core.utils.read_pcap import read_pcap


def add_parser(subparsers):
    parser = subparsers.add_parser(
        "rewrite",
        help="Rewrite a PCAP file with modified network fields"
    )
    parser.add_argument("--pcap", required=True, help="Input PCAP file path")
    parser.add_argument("--output", required=True, help="Output PCAP file path")
    
    parser.add_argument(
        "--rewrite-ip",
        nargs="+",
        help="Rewrite IPv4 addresses. Format: old=new ... Example: --rewrite-ip 10.0.0.1=1.1.1.1 10.0.0.2=2.2.2.2"
    )
    parser.add_argument(
        "--rewrite-mac",
        nargs="+",
        help="Rewrite MAC addresses. Format: old=new ... Example: --rewrite-mac aa:bb:cc:dd:ee:ff=00:11:22:33:44:55"
    )
    parser.add_argument(
        "--rewrite-ipv6",
        nargs="+",
        help="Rewrite IPv6 addresses. Format: old=new ... Example: --rewrite-ipv6 2001:db8::1=2001:db8::2"
    )
    parser.add_argument(
        "--rewrite-arp-ip",
        nargs="+",
        help="Rewrite ARP IP addresses. Format: old=new ... Example: --rewrite-arp-ip 10.0.0.1=1.1.1.1"
    )
    parser.add_argument(
        "--rewrite-dns-domain",
        nargs="+",
        help="Rewrite DNS domains. Format: old=new ... Example: --rewrite-dns-domain example.com=test.com"
    )
    parser.add_argument(
        "--rewrite-tcp-port",
        nargs="+",
        help="Rewrite TCP ports. Format: old=new ... Example: --rewrite-tcp-port 80=8080 443=8443"
    )
    parser.add_argument(
        "--rewrite-udp-port",
        nargs="+",
        help="Rewrite UDP ports. Format: old=new ... Example: --rewrite-udp-port 53=5353 67=1067"
    )
    
    parser.set_defaults(func=run)


def run(args):
    print(f"[Rewrite] Input PCAP: {args.pcap}")
    print(f"[Rewrite] Output PCAP: {args.output}")
    
    # Check if input file exists
    if not os.path.exists(args.pcap):
        print(f"[Rewrite] Error: Input file '{args.pcap}' does not exist")
        return
    
    # Read packets
    print(f"[Rewrite] Reading packets...")
    packets = read_pcap(args.pcap)
    print(f"[Rewrite] Number of packets: {len(packets)}")
    
    if not packets:
        print(f"[Rewrite] Error: No packets found in PCAP file")
        return
    
    # Parse all rewrite mappings
    # Note: parse_mapping converts to lowercase, which is fine for IPs and MACs
    # but we need special handling for IPv6, DNS domains, and ports
    ip_map = parse_mapping(args.rewrite_ip) if args.rewrite_ip else {}
    mac_map = parse_mapping(args.rewrite_mac) if args.rewrite_mac else {}
    
    # IPv6, ARP IPs, DNS domains, and ports need case-sensitive or numeric handling
    def parse_mapping_case_sensitive(rules_list):
        mapping = {}
        if not rules_list:
            return mapping
        for rule in rules_list:
            if "=" not in rule:
                raise ValueError(f"Invalid mapping '{rule}'. Use old=new format.")
            old, new = rule.split("=", 1)
            mapping[old.strip()] = new.strip()
        return mapping
    
    ipv6_map = parse_mapping_case_sensitive(args.rewrite_ipv6) if args.rewrite_ipv6 else {}
    arp_ip_map = parse_mapping_case_sensitive(args.rewrite_arp_ip) if args.rewrite_arp_ip else {}
    dns_domain_map = parse_mapping_case_sensitive(args.rewrite_dns_domain) if args.rewrite_dns_domain else {}
    tcp_port_map = parse_mapping_case_sensitive(args.rewrite_tcp_port) if args.rewrite_tcp_port else {}
    udp_port_map = parse_mapping_case_sensitive(args.rewrite_udp_port) if args.rewrite_udp_port else {}
    
    # Check if any rewrite is specified
    has_rewrite = any([
        ip_map, mac_map, ipv6_map, arp_ip_map,
        dns_domain_map, tcp_port_map, udp_port_map
    ])
    
    if not has_rewrite:
        print(f"[Rewrite] Warning: No rewrite rules specified. Copying original file...")
    
    # Apply rewrites
    if has_rewrite:
        print(f"[Rewrite] Applying rewrites...")
        if ip_map:
            print(f"[Rewrite]   - IPv4 mappings: {len(ip_map)}")
        if mac_map:
            print(f"[Rewrite]   - MAC mappings: {len(mac_map)}")
        if ipv6_map:
            print(f"[Rewrite]   - IPv6 mappings: {len(ipv6_map)}")
        if arp_ip_map:
            print(f"[Rewrite]   - ARP IP mappings: {len(arp_ip_map)}")
        if dns_domain_map:
            print(f"[Rewrite]   - DNS domain mappings: {len(dns_domain_map)}")
        if tcp_port_map:
            print(f"[Rewrite]   - TCP port mappings: {len(tcp_port_map)}")
        if udp_port_map:
            print(f"[Rewrite]   - UDP port mappings: {len(udp_port_map)}")
        
        packets = rewrite_packets(
            packets,
            ip_map=ip_map,
            mac_map=mac_map,
            ipv6_map=ipv6_map,
            arp_ip_map=arp_ip_map,
            dns_domain_map=dns_domain_map,
            tcp_port_map=tcp_port_map,
            udp_port_map=udp_port_map
        )
        print(f"[Rewrite] Rewrites applied successfully")
    
    # Ensure output directory exists
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"[Rewrite] Created output directory: {output_dir}")
    
    # Ensure .pcap extension
    output_path = args.output
    if not output_path.lower().endswith(".pcap"):
        output_path = output_path + ".pcap"
    
    # Write output file
    print(f"[Rewrite] Writing output file: {output_path}")
    writer = PcapWriter(
        output_path,
        append=False,
        sync=False,
        bufsz=8192
    )
    
    writer.write(packets)
    writer.close()
    
    print(f"[Rewrite] Successfully created rewritten PCAP file: {output_path}")

