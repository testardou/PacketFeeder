import os

from core.pcap_infos.pcap_infos_table import pcap_infos_table
from core.utils.pcap_infos import pcap_infos
from core.utils.read_pcap import read_pcap


class InfosMixin:
    def do_infos(self, _args):
        """Show PCAP informations for the selected pcap"""                                            
        pcap_path = self.get_option('pcap')
        if not pcap_path:                                                                             
            print("No pcap selected. Use: set pcap <path>")
            return                                                                                    
        if not os.path.isfile(pcap_path):
            print(f'File not found: {pcap_path}')                                                     
            return
        packets = read_pcap(pcap_path)
        infos = pcap_infos(packets)                                                                   
        pcap_infos_table(infos)
