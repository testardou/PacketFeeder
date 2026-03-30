from core.pcap_infos import pcap_infos_table
from core.utils.pcap_infos import pcap_infos
from core.utils.read_pcap import read_pcap


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
    pcap_infos_table(infos)
