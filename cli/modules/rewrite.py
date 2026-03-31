from scapy.utils import PcapWriter

from cli.modules.base import BaseModule
import os

from core.replay.rewrite_packets import rewrite_packets
from core.utils.parse_mapping import parse_mapping
from core.utils.read_pcap import read_pcap

class RewriteModule(BaseModule):
    name = "rewrite"
    description = "Rewrite PCAP informations (IP, MAC, DNS...)."

    def __init__(self):
        super().__init__()
        self.register_option("pcap", 'PCAP file path.', required=True)
        self.register_option("output", 'PCAP file new name.', required=True)
        self.register_option("ip", 'Rewrite IP. Format: old=new old=new')
        self.register_option("ipv6", 'Rewrite IPV6. Format: old=new old=new')
        self.register_option("mac", 'Rewrite MAC. Format: old=new old=new')
        self.register_option("arp-ip", 'Rewrite ARP IP. Format: old=new old=new')
        self.register_option("dns", 'Rewrite DNS domain. Format: old=new old=new')
        self.register_option("tcp", 'Rewrite TCP port. Format: old=new old=new')
        self.register_option("udp", 'Rewrite UDP port. Format: old=new old=new')

    def _execute(self):
        pcap_path = self.get_option('pcap')
        if not os.path.isfile(pcap_path):
            print(f'File not found: {pcap_path}')
            return
        output_path = self.get_option('output')
        output_dir = os.path.dirname(output_path)                                                                  
        if output_dir and not os.path.isdir(output_dir):                                                      
            print(f"Directory not found: {output_dir}")                                                       
            return                                                                                            
        if os.path.isfile(output_path):                                                                            
            print(f"File already exists: {output_path}")                                                           
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
        if not has_rewrite:
            print('Warning: No rewrite rules specified.')
        rewritten_packets = rewrite_packets(packets, ip_map, mac_map, ipv6_map, arp_ip_map, dns_map, tcp_map, udp_map)
        writer = PcapWriter(
            output_path,
            append=False,
            sync=False,
            bufsz=8192
        )
        writer.write(rewritten_packets)
        writer.close()
        print(f"PCAP write in: {output_path}")                                                           
