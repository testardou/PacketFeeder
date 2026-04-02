from scapy.utils import rdpcap

from core.replay.rewrite_packets import rewrite_packets


def merge_pcaps(scenario, global_rewrite=None, specifics_rewrite=None):
    """Merge multiple PCAPs with sleep offsets into a single packet list.
    items: list of {"type": "pcap", "path": "..."} or {"type": "sleep", "duration": N}
    Returns: (merged_packets, total_duration)
    """
    merged_packets = []
    current_offset = 0
    for i, entry in enumerate(scenario):
        if entry["type"] == "sleep":
            current_offset += entry["duration"]
            continue
        try: 
            packets = rdpcap(entry["file_path"])
        except Exception as error:
            print(f"Error: Failed to read PCAP file {entry['file_path']} at index {i}.")
            continue
        if len(packets) == 0:
            continue
        pcap_rewrite = (specifics_rewrite or {}).get(str(i))
        if pcap_rewrite:
            packets = rewrite_packets(packets, **pcap_rewrite)
        elif global_rewrite:
            packets = rewrite_packets(packets, **global_rewrite)
        first_ts = float(packets[0].time)
        for pkt in packets:                                                                                                                                                                                      
            pkt.time = current_offset + (float(pkt.time) - first_ts)                                                                                                                                             
            merged_packets.append(pkt)
        current_offset = float(merged_packets[-1].time)                                                                                                                                                          
    return merged_packets, current_offset 

