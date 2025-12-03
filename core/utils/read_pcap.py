from scapy.all import conf, rdpcap, sendp

def read_pcap(file_path):

    packets = rdpcap(file_path)
    return packets