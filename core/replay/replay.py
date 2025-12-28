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
    
    # Validate index/range options
    if args.index is not None and args.range is not None:
        print(f"[Replay] Error: Cannot use both --index and --range options")
        return
    
    # Filter packets by index or range
    if args.index is not None:
        if args.index < 0 or args.index >= total_packets:
            print(f"[Replay] Error: Index {args.index} is out of range (0-{total_packets-1})")
            return
        packets = [packets[args.index]]
        print(f"[Replay] Filtering: replaying only packet at index {args.index}")
    elif args.range is not None:
        try:
            start_str, end_str = args.range.split("-", 1)
            start = int(start_str.strip())
            end = int(end_str.strip())
            
            if start < 0 or end >= total_packets:
                print(f"[Replay] Error: Range {start}-{end} is out of bounds (0-{total_packets-1})")
                return
            if start > end:
                print(f"[Replay] Error: Start index {start} must be <= end index {end}")
                return
            
            packets = packets[start:end+1]
            print(f"[Replay] Filtering: replaying packets from index {start} to {end} ({len(packets)} packets)")
        except ValueError:
            print(f"[Replay] Error: Invalid range format '{args.range}'. Use format: start-end (e.g., 5-10)")
            return
    
    print(f"[Replay] Number of packets to replay: {len(packets)}")
    
    if not packets:
        print(f"[Replay] No packets to replay")
        return
    
    first_timestamp = float(packets[0].time)
    prev_timestamp = first_timestamp
    ts = float(packets[-1].time) - first_timestamp
    d = int(ts // 86400)
    h = int((ts % 86400) // 3600)
    m = int((ts % 3600) // 60)
    s = int(ts % 60)
    ms = int((ts % 1) * 1000)

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
                if timestamp > prev_timestamp:
                    time.sleep(timestamp - prev_timestamp)
                send_pcap(pkt, iface=args.iface)
                prev_timestamp = timestamp

        elif args.speed == 1:
            for pkt in tqdm(packets, desc="Replaying PCAP"):
                send_pcap(pkt, iface=args.iface)
        else:
            print("Replaying PCAP...")
            send_pcap(packets, iface=args.iface)
    
    except KeyboardInterrupt:
        print("\nOUCH !!!!!! Interrupted by user, stopping replay :'(")