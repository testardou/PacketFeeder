from scapy.utils import PcapWriter

from cli.mixins.infos import InfosMixin
from cli.mixins.rewrite import RewriteMixin
from cli.modules.base import BaseModule
import os

from core.replay.rewrite_packets import rewrite_packets
from core.utils.read_pcap import read_pcap

class RewriteModule(RewriteMixin, InfosMixin, BaseModule):
    name = "rewrite"
    description = "Rewrite PCAP informations (IP, MAC, DNS...)."

    def __init__(self):
        super().__init__()
        self.register_option("pcap", 'PCAP file path.', required=True)
        self.register_option("output", 'PCAP file new name.', required=True)

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
        if not self.rewrites:
            print('Warning: No rewrite rules specified.')
            return
        if self.rewrites:                                                                                                                                                                                            
          packets = rewrite_packets(                                                                                                                                                                               
              packets,
              ip_map=self.rewrites.get("ip"),                                                                                                                                                                      
              mac_map=self.rewrites.get("mac"),
              ipv6_map=self.rewrites.get("ipv6"),                                                                                                                                                                  
              arp_ip_map=self.rewrites.get("arp-ip"),                                                                                                                                                              
              dns_domain_map=self.rewrites.get("dns"),
              tcp_port_map=self.rewrites.get("tcp"),                                                                                                                                                                    
              udp_port_map=self.rewrites.get("udp"),
          )
        writer = PcapWriter(
            output_path,
            append=False,
            sync=False,
            bufsz=8192
        )
        writer.write(packets)
        writer.close()
        print(f"PCAP write in: {output_path}")                                                           
