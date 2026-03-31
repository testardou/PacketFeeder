import os

from cli.modules.base import BaseModule
from core.replay.rewrite_packets import rewrite_packets
from core.utils.filter_packets import filter_packets
from core.utils.get_ifaces import get_ifaces
from core.utils.parse_mapping import parse_mapping
from core.utils.read_pcap import read_pcap
from core.utils.replay_with_speed import replay_with_speed


class ReplayModule(BaseModule):
    name = 'replay'
    description = 'Replay a PCAP file'

    def __init__(self):
        super().__init__()
        ifaces = get_ifaces()
        self.register_option('iface','Selected iface where the packets will be sent', required=True, default=ifaces[0])
        self.register_option("pcap", 'PCAP file path.', required=True)
        self.register_option("speed", '0 = real-time, 1 = rapide avec progress bar, 2 = full speed.', default=0)
        self.register_option("index", 'Replay only a specific packet by index (0-based).', default=None)
        self.register_option("range", 'Replay a range of packets by index (0-based). Format: start-end.', default=None)
        self.register_option("ip", 'Rewrite IP. Format: old=new old=new')
        self.register_option("ipv6", 'Rewrite IPV6. Format: old=new old=new')
        self.register_option("mac", 'Rewrite MAC. Format: old=new old=new')
        self.register_option("arp-ip", 'Rewrite ARP IP. Format: old=new old=new')
        self.register_option("dns", 'Rewrite DNS domain. Format: old=new old=new')
        self.register_option("tcp", 'Rewrite TCP port. Format: old=new old=new')
        self.register_option("udp", 'Rewrite UDP port. Format: old=new old=new')

    def _execute(self):
        pcap_path = self.get_option('pcap')
        iface = self.get_option('iface')
        speed = self.get_option('speed')
        pkt_index = self.get_option('index')
        pkt_range = self.get_option('range')
        if not os.path.isfile(pcap_path):
            print(f'File not found: {pcap_path}')
            return
        packets = read_pcap(pcap_path)
        ip_map = parse_mapping(self.get_option('ip').split()) if self.get_option('ip') else None             
        mac_map = parse_mapping(self.get_option('mac').split()) if self.get_option('mac') else None             
        ipv6_map = parse_mapping(self.get_option('ipv6').split()) if self.get_option('ipv6') else None             
        arp_ip_map = parse_mapping(self.get_option('arp-ip').split()) if self.get_option('arp-ip') else None             
        dns_map = parse_mapping(self.get_option('dns').split()) if self.get_option('dns') else None             
        tcp_map = parse_mapping(self.get_option('tcp').split()) if self.get_option('tcp') else None             
        udp_map = parse_mapping(self.get_option('udp').split()) if self.get_option('udp') else None
        has_rewrite = any([
            ip_map, mac_map, ipv6_map, arp_ip_map,
            dns_map, tcp_map, udp_map
        ])
        packets = filter_packets(packets=packets, pkt_index=pkt_index, pkt_range=pkt_range)
        if has_rewrite:
            packets = rewrite_packets(packets, ip_map, mac_map, ipv6_map, arp_ip_map, dns_map, tcp_map, udp_map)
        replay_with_speed(packets=packets, iface=iface, speed=int(speed))
