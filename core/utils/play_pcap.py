from pylibpcap.pcap import rpcap
import time

def play_pcap(packets, iface="eth0", speed=1):
    """
    Joue un fichier PCAP sur une interface réseau donnée à une vitesse spécifiée.
    """
    if not packets:
        return

    # Timestamp du premier paquet pour compenser l'offset
    prev_ts = packets[0].time

    for pkt in packets:
        current_ts = pkt.time
        delay = (current_ts - prev_ts) / speed

        if delay > 0:
            time.sleep(delay)

        sender.sendpacket(bytes(pkt))
        prev_ts = current_ts
    sender = rpcap(iface)