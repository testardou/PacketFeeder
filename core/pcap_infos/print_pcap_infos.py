from core.utils.pcap_infos import pcap_infos
from core.utils.read_pcap import read_pcap
from rich.table import Table
from rich.console import Console


def add_parser(subparsers):
    parser = subparsers.add_parser(
        "infos_pcap",
        help="Get pcap file infos"
    )
    parser.add_argument("--pcap", required=True)
    parser.set_defaults(func=run)

def run(args):
    print(f"[PCAP Infos] PCAP: {args.pcap}")
    packets = read_pcap(args.pcap)
    infos = pcap_infos(packets)
    table = Table(title="PCAP Information")

    table.add_column("Field", style="cyan", no_wrap=True)
    table.add_column("Value", style="magenta")

    protocols = infos.get("protocols", {})
    
    table.add_row("Packet Count", str(infos["packet_count"]))
    table.add_row("Total Bytes", str(infos["total_bytes"]))
    table.add_row("Duration (s)", infos["duration_seconds"])
    table.add_row("Min Packet Size", str(infos["min_packet_size"]))
    table.add_row("Max Packet Size", str(infos["max_packet_size"]))
    
    # MACs
    macs = protocols.get("macs", [])
    table.add_row("MACs", ", ".join(macs) if macs else "None")
    
    # IPs
    ips = protocols.get("ips", [])
    table.add_row("IPs", ", ".join(ips) if ips else "None")
    
    # IPv6s
    ipv6s = protocols.get("ipv6s", [])
    table.add_row("IPv6s", ", ".join(ipv6s) if ipv6s else "None")
    
    # TCP Ports
    tcp_ports = protocols.get("tcp_ports", [])
    table.add_row("TCP Ports", ", ".join(map(str, tcp_ports)) if tcp_ports else "None")
    
    # UDP Ports
    udp_ports = protocols.get("udp_ports", [])
    table.add_row("UDP Ports", ", ".join(map(str, udp_ports)) if udp_ports else "None")
    
    # ICMP Types
    icmp_types = protocols.get("icmp_types", [])
    table.add_row("ICMP Types", ", ".join(map(str, icmp_types)) if icmp_types else "None")
    
    # ARP IPs
    arp_ips = protocols.get("arp_ips", [])
    table.add_row("ARP IPs", ", ".join(arp_ips) if arp_ips else "None")
    
    # DNS Domains
    dns_domains = protocols.get("dns_domains", [])
    table.add_row("DNS Domains", ", ".join(dns_domains) if dns_domains else "None")

    console = Console()
    console.print(table)
