import logging
import sys
from core.pcap.filter_packets import filter_packets
from core.utils.parse_mapping import  parse_mapping
from core.pcap.rewrite_packets import rewrite_packets
from scapy.all import conf

from core.pcap.read_pcap import read_pcap
from core.replay.replay_with_speed import replay_with_speed

logger = logging.getLogger(__name__)

def add_parser(subparsers):
    parser = subparsers.add_parser(
        "replay",
        help="Replay a PCAP like tcpreplay"
    )
    parser.add_argument("--pcap", required=True)
    parser.add_argument("--iface", default=conf.iface)
    parser.add_argument(
        "--speed",
        type=int,
        choices=[0, 1, 2],
        default=0,
        help="0=Real time, 1=Fullspeed with progress bar, 2=Fullspeed without progress bar (fastest)"
    )
    parser.add_argument(
        "--rewrite-ip",
        nargs="+",
        help="Rewrite IPs. Format: old:new ... Example: --rewrite-ip 10.0.0.1=1.1.1.1 10.0.0.2=2.2.2.2"
    )
    parser.add_argument(
        "--rewrite-mac",
        nargs="+",
        help="Rewrite MAC addresses. Format: old:new ... Example: --rewrite-mac aa:bb:cc:dd:ee:ff:11:22:33 00:11:22:33:44:55:aa:bb:cc"
    )
    parser.add_argument(
        "--index",
        type=int,
        help="Replay only a specific packet by index (0-based). Example: --index 5"
    )
    parser.add_argument(
        "--range",
        help="Replay a range of packets by index (0-based). Format: start-end. Example: --range 5-10"
    )
    parser.set_defaults(func=run)


def run(args):
    print(f"[Replay] PCAP: {args.pcap}")
    print(f"[Replay] Interface: {args.iface}")
    print(f"[Replay] Speed: {args.speed}")
    packets = read_pcap(args.pcap)
    total_packets = len(packets)
    print(f"[Replay] Total packets in PCAP: {total_packets}")
    if not packets:
        return
    packets = filter_packets(packets=packets, pkt_index=args.index, pkt_range=args.range)
    print(f"[Replay] Number of packets to replay: {len(packets)}")
    
    if not packets:
        print(f"[Replay] No packets to replay")
        return
    try:
        ip_map = parse_mapping(args.rewrite_ip) if args.rewrite_ip else {}
        mac_map = parse_mapping(args.rewrite_mac) if args.rewrite_mac else {}
        if args.rewrite_ip or args.rewrite_mac:
            print(f"[Replay] Rewriting packets...")
            packets = rewrite_packets(packets, ip_map=ip_map, mac_map=mac_map)
            print(f"[Replay] Packets rewritten.")
        replay_with_speed(packets, args.iface, args.speed)
    except KeyboardInterrupt:
        print("\n[Replay] Interrupted by user, stopping replay")
        logger.info("Replay interrupted by user")
        sys.exit(0)