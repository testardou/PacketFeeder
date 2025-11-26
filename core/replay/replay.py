from core.utils.play_pcap import play_pcap
from core.utils.read_pcap import read_pcap


def add_parser(subparsers):
    parser = subparsers.add_parser(
        "replay",
        help="Replay a PCAP like tcpreplay"
    )
    parser.add_argument("--pcap", required=True)
    parser.add_argument("--iface", default="eth0")
    parser.add_argument("--speed", type=int, default=1)

    parser.set_defaults(func=run)


def run(args):
    print(f"[Replay] PCAP: {args.pcap}")
    print(f"[Replay] Interface: {args.iface}")
    print(f"[Replay] Speed: {args.speed}x")
    packets = read_pcap(args.pcap)
    play_pcap(packets, args.iface)
    
    # TODO: call utils.pcap.replay(...)