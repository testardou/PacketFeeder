import time
from scapy.all import sendp

def play_pcap(packets, iface="eth0", speed=1):
    """
    Joue un fichier PCAP sur une interface réseau donnée à une vitesse spécifiée.
    """
    if not packets:
        return

    sendp(packets, iface=iface)