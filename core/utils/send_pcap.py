from scapy.all import sendp
def send_pcap(packets, iface):
    sendp(packets, iface=iface, verbose=False)