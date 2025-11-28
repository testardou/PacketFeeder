import time
from scapy.all import conf, rdpcap, sendp
from tqdm import tqdm

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
    parser.set_defaults(func=run)


def run(args):
    print(f"[Replay] PCAP: {args.pcap}")
    print(f"[Replay] Interface: {args.iface}")
    print(f"[Replay] Speed: {args.speed}")
    packets = rdpcap(args.pcap)
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
        if args.speed == 0:
            print(f"[Replay] Total replay time: {d}d {h:02d}h {m:02d}m {s:02d}s {ms:03d}ms")
            for pkt in tqdm(packets, desc="Replaying PCAP"):
                timestamp = float(pkt.time)
                if timestamp > first_timestamp:
                    time.sleep(timestamp - prev_timestamp)
                    prev_timestamp = timestamp
                sendp(pkt, iface=args.iface, verbose=False)

        elif args.speed == 1:
            for pkt in tqdm(packets, desc="Replaying PCAP"):
                sendp(pkt, iface=args.iface, verbose=False)
        else:
            print("Replaying PCAP...")
            sendp(packets, iface=args.iface, verbose=False)
    
    except KeyboardInterrupt:
        print("\nOUCH !!!!!! Interrupted by user, stopping replay :'(")