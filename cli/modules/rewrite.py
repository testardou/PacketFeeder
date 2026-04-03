from scapy.utils import PcapWriter

from cli.mixins.infos import InfosMixin
from cli.mixins.rewrite import RewriteMixin
from cli.modules.base import BaseModule
import os

from core.replay.rewrite_packets import rewrite_packets
from core.rewrite.rewrite_params import build_rewrite_kwargs
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
              **build_rewrite_kwargs(self.rewrites)
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
