def filter_packets(packets, pkt_index=None, pkt_range=None):
    if pkt_index is not None and pkt_range is not None:
        print(f"[Replay] Error: Cannot use both index and range options")
        return packets
    total_packets = len(packets)
    if pkt_index is not None:
        pkt_index = int(pkt_index)
        if pkt_index < 0 or pkt_index >= total_packets:
            print(f"[Replay] Error: Index {pkt_index} is out of range (0-{total_packets-1})")
            return packets
        packets = [packets[pkt_index]]
        print(f"[Replay] Filtering: replaying only packet at index {pkt_index}")
    if pkt_range is not None:
        try:
            start_str, end_str = pkt_range.split("-", 1)
            start = int(start_str.strip())
            end = int(end_str.strip())
            
            if start < 0 or end >= total_packets:
                print(f"[Replay] Error: Range {start}-{end} is out of bounds (0-{total_packets-1})")
                return packets
            if start > end:
                print(f"[Replay] Error: Start index {start} must be <= end index {end}")
                return packets
            
            packets = packets[start:end+1]
            print(f"[Replay] Filtering: replaying packets from index {start} to {end} ({len(packets)} packets)")
        except ValueError:
            print(f"[Replay] Error: Invalid range format '{pkt_range}'. Use format: start-end (e.g., 5-10)")
            return packets
    return packets