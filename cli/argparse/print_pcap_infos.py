from core.pcap.pcap_infos_table import pcap_infos_table
from core.pcap.pcap_infos import pcap_infos
from core.pcap.read_pcap import read_pcap


def add_parser(subparsers):
    parser = subparsers.add_parser(
        "infos",
        help="Get pcap file infos"
    )
    parser.add_argument("--pcap", required=True)
    parser.set_defaults(func=run)

def run(args):
    print(f"[PCAP Infos] PCAP: {args.pcap}")
    packets = read_pcap(args.pcap)
    infos = pcap_infos(packets)
    pcap_infos_table(infos)
