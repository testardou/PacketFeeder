import time
from core.utils.parse_mapping import  parse_mapping
from core.replay.rewrite_packets import rewrite_packets
from scapy.all import conf
from tqdm import tqdm

from core.utils.read_pcap import read_pcap
from core.utils.send_pcap import  send_pcap

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
    parser.set_defaults(func=run)


def run(args):
    print(f"[Replay] PCAP: {args.pcap}")
    print(f"[Replay] Interface: {args.iface}")
    print(f"[Replay] Speed: {args.speed}")
    packets = read_pcap(args.pcap)
    print(f"[Replay] Number of packets: {len(packets)}")
    first_timestamp = float(packets[0].time)
    prev_timestamp = first_timestamp
    ts = float(packets[-1].time) - first_timestamp
    d = int(ts // 86400)
    h = int((ts % 86400) // 3600)
    m = int((ts % 3600) // 60)
    s = int(ts % 60)
    ms = int((ts % 1) * 1000)

    if not packets:
        return
    try:
        ip_map = parse_mapping(args.rewrite_ip) if args.rewrite_ip else {}
        mac_map = parse_mapping(args.rewrite_mac) if args.rewrite_mac else {}
        if args.rewrite_ip or args.rewrite_mac:
            print(f"[Replay] Rewriting packets...")
            packets = rewrite_packets(packets, ip_map=ip_map, mac_map=mac_map)
            print(f"[Replay] Packets rewritten.")
        if args.speed == 0:
            print(f"[Replay] Total replay time: {d}d {h:02d}h {m:02d}m {s:02d}s {ms:03d}ms")
            for pkt in tqdm(packets, desc="Replaying PCAP"):
                timestamp = float(pkt.time)
                if timestamp > first_timestamp:
                    time.sleep(timestamp - prev_timestamp)
                    prev_timestamp = timestamp
                send_pcap(pkt, iface=args.iface)

        elif args.speed == 1:
            for pkt in tqdm(packets, desc="Replaying PCAP"):
                send_pcap(pkt, iface=args.iface)
        else:
            print("Replaying PCAP...")
            send_pcap(packets, iface=args.iface)
    
    except KeyboardInterrupt:
        print("\nOUCH !!!!!! Interrupted by user, stopping replay :'(")