import time

from tqdm import tqdm

from core.utils.send_pcap import send_pcap


def replay_with_speed(packets, iface, speed=0):
    if speed < 2:
        if speed == 0:
            first_timestamp = float(packets[0].time)
            prev_timestamp = first_timestamp
            ts = float(packets[-1].time) - first_timestamp
            d = int(ts // 86400)
            h = int((ts % 86400) // 3600)
            m = int((ts % 3600) // 60)
            s = int(ts % 60)
            ms = int((ts % 1) * 1000)
            print(f"[Replay] Total replay time: {d}d {h:02d}h {m:02d}m {s:02d}s {ms:03d}ms")
        packets_sent = 0
        for i, pkt in enumerate(tqdm(packets, desc="Replaying PCAP")):
            try:
                timestamp = float(pkt.time)
                if speed == 0 and timestamp > prev_timestamp:
                    time.sleep(timestamp - prev_timestamp)
                    prev_timestamp = timestamp
                packets_sent += 1
                send_pcap(pkt, iface=iface)
            except (OSError, ValueError) as e:
                print(f"\n[Replay] Error sending packet {i} on interface {iface}: {e}")
                print(f"[Replay] Continuing with next packet...")
                continue
            except Exception as e:
                print(f"\n[Replay] Unexpected error sending packet {i}: {e}")
                raise
        print(f"\n[Replay] Successfully sent {packets_sent}/{len(packets)} packets")
    else:
        print("Replaying PCAP...")
        try:
            send_pcap(packets, iface=iface)
            print(f"[Replay] Successfully sent {len(packets)} packets")
        except (OSError, ValueError) as e:
            print(f"\n[Replay] Error sending packets on interface {iface}: {e}")
        except Exception as e:
            print(f"[Replay] Unexpected error sending packets: {e}")
            raise