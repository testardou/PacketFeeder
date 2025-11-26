import logging
from scapy.all import rdpcap

def read_pcap(file_path):
    """
    Lit un fichier PCAP et retourne une liste de paquets.
    """
    logging.getLogger("scapy").setLevel(logging.CRITICAL)
    packets = rdpcap(file_path)
    return packets 