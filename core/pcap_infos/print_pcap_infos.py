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

    table.add_row("Packet Count", str(infos["packet_count"]))
    table.add_row("Total Bytes", str(infos["total_bytes"]))
    table.add_row("Duration (s)", infos["duration_seconds"])
    table.add_row("Min Packet Size", str(infos["min_packet_size"]))
    table.add_row("Max Packet Size", str(infos["max_packet_size"]))
    table.add_row("MACs", ", ".join(infos.get("macs", [])))
    table.add_row("IPs", ", ".join(infos["ips"]))
    table.add_row("TCP Ports", ", ".join(map(str, infos["tcp_ports"])))
    table.add_row("UDP Ports", ", ".join(map(str, infos["udp_ports"])))

    console = Console()
    console.print(table)
